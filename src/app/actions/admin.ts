"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { ActionState } from "@/lib/action-state";
import { cardTypeSchema, idSchema } from "@/lib/validation";
import { actionResult, ActionError } from "@/lib/transactions";

function refreshAdmin() {
  revalidatePath("/admin", "layout");
  revalidatePath("/comunidad");
  revalidatePath("/trips", "layout");
}
export async function upsertCardType(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = cardTypeSchema.safeParse({ ...Object.fromEntries(form), isActive: form.get("isActive") ?? false });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { id, ...data } = parsed.data;
  const creating = form.get("mode") === "create";
  return actionResult(async () => {
    if (creating && await prisma.cardType.findUnique({ where: { id }, select: { id: true } })) throw new ActionError("Ya existe una carta con ese identificador.");
    await prisma.cardType.upsert({ where: { id }, create: { id, ...data }, update: data });
    refreshAdmin();
    return { ok: true, message: creating ? `Carta ${data.name} creada.` : `Carta ${data.name} guardada.` };
  });
}
export async function setCardTypeActive(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.object({ id: idSchema, isActive: z.enum(["true", "false"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    await prisma.cardType.update({ where: { id: parsed.data.id }, data: { isActive: parsed.data.isActive === "true" } });
    refreshAdmin();
    return { ok: true, message: parsed.data.isActive === "true" ? "Carta activada." : "Carta retirada del catálogo. Las manos existentes la conservan." };
  });
}
export async function reviewVideo(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.object({ videoId: idSchema, status: z.enum(["APPROVED", "REJECTED", "PENDING"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    await prisma.communityVideo.update({ where: { id: parsed.data.videoId }, data: { status: parsed.data.status, reviewedAt: parsed.data.status === "PENDING" ? null : new Date() } });
    refreshAdmin();
    return { ok: true, message: { APPROVED: "Vídeo aprobado y publicado.", REJECTED: "Vídeo rechazado.", PENDING: "Vídeo devuelto a pendientes." }[parsed.data.status] };
  });
}
export async function deleteVideo(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = idSchema.safeParse(form.get("videoId"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    await prisma.communityVideo.delete({ where: { id: parsed.data } });
    refreshAdmin();
    return { ok: true, message: "Vídeo eliminado." };
  });
}
export async function setSuggestionStatus(_previous: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.object({ suggestionId: idSchema, status: z.enum(["NEW", "REVIEWED"]) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    await prisma.cardSuggestion.update({ where: { id: parsed.data.suggestionId }, data: { status: parsed.data.status } });
    refreshAdmin();
    return { ok: true, message: parsed.data.status === "REVIEWED" ? "Sugerencia marcada como revisada." : "Sugerencia reabierta." };
  });
}
