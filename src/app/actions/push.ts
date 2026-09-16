"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/action-state";
import { actionResult } from "@/lib/transactions";

const subscriptionSchema = z.object({
  endpoint: z.string().url().startsWith("https://", "La suscripción no es válida.").max(1000),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
  userAgent: z.string().max(300).optional(),
});
export async function subscribePush(input: unknown): Promise<ActionState> {
  const user = await requireUser();
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "No se pudo registrar la suscripción." };
  const { endpoint, keys, userAgent } = parsed.data;
  return actionResult(async () => {
    const data = { userId: user.id, p256dh: keys.p256dh, auth: keys.auth, userAgent: userAgent ?? null };
    await prisma.pushSubscription.upsert({ where: { endpoint }, create: { endpoint, ...data }, update: data });
    return { ok: true, message: "Notificaciones activadas en este dispositivo." };
  });
}
export async function unsubscribePush(endpoint: unknown): Promise<ActionState> {
  const user = await requireUser();
  const parsed = z.string().url().max(1000).safeParse(endpoint);
  if (!parsed.success) return { ok: false, message: "Suscripción no válida." };
  return actionResult(async () => {
    await prisma.pushSubscription.deleteMany({ where: { endpoint: parsed.data, userId: user.id } });
    return { ok: true, message: "Notificaciones desactivadas en este dispositivo." };
  });
}
