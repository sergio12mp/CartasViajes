"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { ActionState } from "@/lib/action-state";
import { idSchema, packSchema } from "@/lib/validation";
import { actionResult, ActionError } from "@/lib/transactions";

function refresh() { revalidatePath("/admin", "layout"); revalidatePath("/trips", "layout"); }
export async function upsertPack(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = packSchema.safeParse({ ...Object.fromEntries(form), isPremium: form.get("isPremium") ?? false, isActive: form.get("isActive") ?? false });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { id, ...data } = parsed.data;
  return actionResult(async () => {
    if (form.get("mode") === "create" && await prisma.cardPack.findUnique({ where: { id }, select: { id: true } })) throw new ActionError("Ya existe un pack con ese identificador.");
    await prisma.cardPack.upsert({ where: { id }, create: { id, ...data }, update: data });
    refresh();
    return { ok: true, message: `Pack ${data.name} guardado.` };
  });
}
export async function grantPack(_previous: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z.object({ packId: idSchema, email: z.string().trim().email("Escribe un correo válido.") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
    if (!user) throw new ActionError("No hay ningún usuario con ese correo. Debe haber entrado al menos una vez.");
    const exists = await prisma.packPurchase.findFirst({ where: { userId: user.id, packId: parsed.data.packId, scope: "LIFETIME", status: "PAID" } });
    if (exists) return { ok: true, message: "Ese usuario ya tenía el pack." };
    await prisma.packPurchase.create({ data: { userId: user.id, packId: parsed.data.packId, scope: "LIFETIME", status: "PAID", amountCents: 0, paidAt: new Date(), stripeSessionId: `manual-${admin.id}-${crypto.randomUUID()}` } });
    refresh();
    return { ok: true, message: "Pack regalado para siempre." };
  });
}
