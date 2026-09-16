"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/action-state";
import { idSchema } from "@/lib/validation";
import { ActionError, actionResult } from "@/lib/transactions";
import { appUrl, paymentsEnabled, stripe } from "@/lib/stripe";

const schema = z.object({ packId: idSchema, scope: z.enum(["TRIP", "LIFETIME"]), tripId: z.preprocess(v => (v === "" || v == null ? null : v), idSchema.nullable()) });
export async function startCheckout(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { packId, scope, tripId } = parsed.data;
  return actionResult(async () => {
    if (!paymentsEnabled()) throw new ActionError("Los pagos aún no están activados: todos los packs están abiertos durante las pruebas.");
    const pack = await prisma.cardPack.findFirst({ where: { id: packId, isActive: true, isPremium: true } });
    if (!pack) throw new ActionError("Ese pack no está disponible.");
    const amount = scope === "TRIP" ? pack.priceTripCents : pack.priceLifetimeCents;
    if (amount <= 0) throw new ActionError("Ese pack no se vende con esa modalidad.");
    let returnPath = "/trips/new";
    if (scope === "TRIP") {
      if (!tripId) throw new ActionError("Crea el viaje y desbloquea el pack desde su configuración.");
      const trip = await prisma.trip.findFirst({ where: { id: tripId, creatorId: user.id, status: "DRAFT" }, select: { id: true } });
      if (!trip) throw new ActionError("Solo el creador puede desbloquear packs en un viaje que no haya empezado.");
      returnPath = `/trips/${tripId}/settings`;
    } else if (tripId) returnPath = `/trips/${tripId}/settings`;
    const already = await prisma.packPurchase.findFirst({ where: { packId, status: "PAID", OR: [{ userId: user.id, scope: "LIFETIME" }, ...(tripId ? [{ tripId, scope: "TRIP" as const }] : [])] } });
    if (already) throw new ActionError("Ese pack ya está desbloqueado.");
    const purchase = await prisma.packPurchase.create({ data: { userId: user.id, packId, tripId: scope === "TRIP" ? tripId : null, scope, amountCents: amount, stripeSessionId: `pending-${crypto.randomUUID()}` } });
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ quantity: 1, price_data: { currency: "eur", unit_amount: amount, product_data: { name: `${pack.emoji ? `${pack.emoji} ` : ""}${pack.name} · ${scope === "TRIP" ? "este viaje" : "para siempre"}`, description: pack.description.slice(0, 200) } } }],
      metadata: { purchaseId: purchase.id, packId, scope, userId: user.id, tripId: tripId ?? "" },
      customer_email: user.email ?? undefined,
      success_url: appUrl(`${returnPath}?checkout=${purchase.id}`),
      cancel_url: appUrl(`${returnPath}?checkout=cancelled`),
      locale: "es",
    });
    if (!session.url) throw new ActionError("Stripe no devolvió una página de pago.");
    await prisma.packPurchase.update({ where: { id: purchase.id }, data: { stripeSessionId: session.id } });
    return { ok: true, message: "Redirigiendo al pago…", redirectTo: session.url };
  });
}
