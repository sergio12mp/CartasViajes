"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { idSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/action-state";
import { ActionError, actionResult, enforce, inTripTransaction, requireOne } from "@/lib/transactions";
import { expiredNotifications, resolvePlaysInTransaction } from "@/lib/plays";
import { sendNotifications, type Notification } from "@/lib/push";
import { cardPlayedNotification, playRespondedNotification } from "@/lib/game/notifications";
import { buildEventMessage, canPlayAttack, canReact, canRespond, computeExpiry, resolveReaction } from "@/lib/game/rules";

export async function playCard(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = z.object({ tripId: idSchema, cardId: idSchema, targetPlayerId: idSchema }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    // Notifications are collected inside the transaction and sent only after it commits.
    const notifications: Notification[] = [];
    const result = await inTripTransaction(parsed.data.tripId, user.id, async (tx, trip) => {
      const now = new Date();
      notifications.push(...expiredNotifications(trip.id, await resolvePlaysInTransaction(tx, trip.id, now)));
      const me = trip.players.find(p => p.userId === user.id);
      if (!me) return { ok: false, message: "Elige tu nombre antes de jugar." };
      const card = await tx.playerCard.findFirst({ where: { id: parsed.data.cardId, tripId: trip.id, playerId: me.id }, include: { cardType: true } });
      const target = trip.players.find(p => p.id === parsed.data.targetPlayerId);
      if (!card || !target) return { ok: false, message: "La carta o el objetivo no pertenecen a este viaje." };
      const rule = canPlayAttack({ trip, card: { ...card, kind: card.cardType.kind }, attackerPlayerId: me.id, targetPlayerId: target.id });
      if (!rule.ok) return rule;
      const locked = await tx.playerCard.updateMany({ where: { id: card.id, tripId: trip.id, playerId: me.id, status: "AVAILABLE" }, data: { status: "LOCKED", lockedAt: now } });
      requireOne(locked.count, "Esa carta ya se ha usado.");
      const play = await tx.play.create({ data: { tripId: trip.id, attackerId: me.id, targetId: target.id, cardId: card.id, createdAt: now, expiresAt: computeExpiry(now, trip.responseWindowMinutes) } });
      await tx.tripEvent.create({ data: { tripId: trip.id, playId: play.id, actorPlayerId: me.id, type: "CARD_PLAYED", message: buildEventMessage("CARD_PLAYED", { attackerName: me.displayName, targetName: target.displayName, cardName: card.cardType.name }) } });
      notifications.push({ userIds: [target.userId], payload: cardPlayedNotification({ tripId: trip.id, playId: play.id, attackerName: me.displayName, cardName: card.cardType.name, minutes: trip.responseWindowMinutes }) });
      return { ok: true, message: `Has jugado ${card.cardType.name} contra ${target.displayName}. Tiene ${trip.responseWindowMinutes} minutos para responder.` };
    });
    revalidatePath(`/trips/${parsed.data.tripId}`, "layout");
    if (result.ok) await sendNotifications(notifications);
    return result;
  });
}
async function respond(form: FormData, react: boolean): Promise<ActionState> {
  const user = await requireUser();
  const parsed = z.object({ tripId: idSchema, playId: idSchema, reactionCardId: react ? idSchema : z.string().optional() }).safeParse({
    ...Object.fromEntries(form), reactionCardId: form.get("reactionCardId") ?? undefined,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    const notifications: Notification[] = [];
    const result = await inTripTransaction(parsed.data.tripId, user.id, async (tx, trip) => {
      const now = new Date();
      notifications.push(...expiredNotifications(trip.id, await resolvePlaysInTransaction(tx, trip.id, now)));
      const me = trip.players.find(p => p.userId === user.id);
      if (!me) return { ok: false, message: "Elige tu nombre antes de responder." };
      const play = await tx.play.findFirst({ where: { id: parsed.data.playId, tripId: trip.id }, include: { attacker: true, target: true, card: { include: { cardType: true } } } });
      if (!play) return { ok: false, message: "La jugada no pertenece a este viaje." };
      if (play.targetId === me.id && play.status === "ACCEPTED" && play.expiresAt <= now) return { ok: false, message: "La jugada ha expirado y se ha aplicado." };
      const input = { trip, play, responderPlayerId: me.id, now };
      const allowed = canRespond(input);
      if (!allowed.ok) return allowed;
      const reactionCard = react ? await tx.playerCard.findFirst({ where: { id: parsed.data.reactionCardId, tripId: trip.id, playerId: me.id }, include: { cardType: true } }) : null;
      if (react && !reactionCard) return { ok: false, message: "No tienes esa carta de reacción." };
      let resolution: { status: "ACCEPTED" | "BLOCKED" | "REFLECTED"; finalTargetId: string | null } = { status: "ACCEPTED", finalTargetId: play.targetId };
      if (reactionCard) {
        enforce(canReact({ ...input, reactionCard: { ...reactionCard, kind: reactionCard.cardType.kind } }));
        if (!reactionCard.cardType.reactionEffect) throw new ActionError("Esta carta no tiene un efecto de reacción válido.");
        resolution = resolveReaction(reactionCard.cardType.reactionEffect, play);
        const locked = await tx.playerCard.updateMany({ where: { id: reactionCard.id, tripId: trip.id, playerId: me.id, status: "AVAILABLE" }, data: { status: "LOCKED", lockedAt: now } });
        requireOne(locked.count, "Esa carta ya se ha usado.");
      }
      const updated = await tx.play.updateMany({ where: { id: play.id, tripId: trip.id, status: "PENDING", expiresAt: { gt: now } }, data: { ...resolution, resolvedAt: now, reactionCardId: reactionCard?.id ?? null } });
      requireOne(updated.count, "Otra respuesta se adelantó. Actualiza la página.");
      const type = resolution.status === "ACCEPTED" ? "PLAY_ACCEPTED" : resolution.status === "BLOCKED" ? "PLAY_BLOCKED" : "PLAY_REFLECTED";
      const message = buildEventMessage(type, { attackerName: play.attacker.displayName, targetName: play.target.displayName, cardName: play.card.cardType.name, reactionName: reactionCard?.cardType.name });
      await tx.tripEvent.create({ data: { tripId: trip.id, playId: play.id, actorPlayerId: me.id, type, message } });
      notifications.push({ userIds: [play.attacker.userId], payload: playRespondedNotification({ tripId: trip.id, playId: play.id, status: resolution.status, targetName: play.target.displayName, cardName: play.card.cardType.name, reactionName: reactionCard?.cardType.name }) });
      return { ok: true, message };
    });
    revalidatePath(`/trips/${parsed.data.tripId}`, "layout");
    if (result.ok) await sendNotifications(notifications);
    return result;
  });
}
export async function acceptPlay(_previous: ActionState, form: FormData): Promise<ActionState> { return respond(form, false); }
export async function reactToPlay(_previous: ActionState, form: FormData): Promise<ActionState> { return respond(form, true); }
