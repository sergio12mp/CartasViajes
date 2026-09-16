"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/action-state";
import { idSchema, parseTripForm, type TripInput } from "@/lib/validation";
import { createTripWithUniqueCode } from "@/lib/codes";
import { dealCards, validateDealConfig, type DealConfig, type DealRule } from "@/lib/game/deal";
import { buildEventMessage } from "@/lib/game/rules";
import { canClaimPlayer, canManageTrip, validateRetainedPlayers } from "@/lib/game/trips";
import { ActionError, actionResult, enforce, inTripTransaction, lockTrip, requireOne } from "@/lib/transactions";
import { expiredNotifications, resolvePlaysInTransaction } from "@/lib/plays";
import { sendNotifications } from "@/lib/push";
import { playerJoinedNotification, tripStartedNotification } from "@/lib/game/notifications";
import { getUnlockedPackIds } from "@/lib/packs";
import { lockedPackNamesInPool } from "@/lib/game/packs";

function refresh(tripId: string) {
  revalidatePath(`/trips/${tripId}`, "layout");
  revalidatePath("/");
}
function dealConfigOf(trip: { legendariesPerPlayer: number; raresPerPlayer: number; commonsPerPlayer: number; dealByCategory: boolean }, rules: DealRule[]): DealConfig {
  return { legendariesPerPlayer: trip.legendariesPerPlayer, raresPerPlayer: trip.raresPerPlayer, commonsPerPlayer: trip.commonsPerPlayer, dealByCategory: trip.dealByCategory, rules };
}
async function validatedConfig(tx: Prisma.TransactionClient, input: TripInput, userId: string, tripId: string | null) {
  const ids = [...new Set(input.poolCardTypeIds)];
  const cards = await tx.cardType.findMany({ where: { id: { in: ids }, isActive: true }, include: { pack: { select: { id: true, name: true, isPremium: true } } } });
  if (cards.length !== ids.length) throw new ActionError("Alguna carta ya no está disponible. Revisa la selección.");
  const locked = lockedPackNamesInPool(cards, await getUnlockedPackIds(userId, tripId));
  if (locked.length) throw new ActionError(`El pack ${locked.join(", ")} no está desbloqueado para este viaje.`);
  const rules = input.dealByCategory ? Object.entries(input.dealRules ?? {}).map(([category, cardsPerPlayer]) => ({ category, cardsPerPlayer })) : [];
  const config = dealConfigOf(input, rules);
  const message = validateDealConfig(cards.map(c => ({ cardTypeId: c.id, category: c.category, rarity: c.rarity })), config, input.playerNames.length);
  if (message) throw new ActionError(message);
  const settings = { legendariesPerPlayer: input.legendariesPerPlayer, raresPerPlayer: input.raresPerPlayer, commonsPerPlayer: input.commonsPerPlayer, dealByCategory: input.dealByCategory };
  return { pool: ids.map(cardTypeId => ({ cardTypeId })), rules, settings };
}
export async function createTrip(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseTripForm(form);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    const trip = await createTripWithUniqueCode(code => prisma.$transaction(async tx => {
      const { pool, rules, settings } = await validatedConfig(tx, parsed.data, user.id, null);
      return tx.trip.create({ data: {
        name: parsed.data.name, responseWindowMinutes: parsed.data.responseWindowMinutes, creatorId: user.id, code, ...settings,
        pool: { create: pool }, dealRules: { create: rules }, players: { create: parsed.data.playerNames.map(displayName => ({ displayName })) },
      } });
    }));
    refresh(trip.id);
    return { ok: true, message: "Viaje creado. Elige tu nombre y comparte el código.", redirectTo: `/trips/${trip.id}` };
  });
}
export async function updateTripSettings(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = parseTripForm(form);
  const id = idSchema.safeParse(form.get("tripId"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (!id.success) return { ok: false, message: id.error.issues[0].message };
  return actionResult(async () => {
    await inTripTransaction(id.data, user.id, async (tx, trip) => {
      enforce(canManageTrip(trip, user.id, "DRAFT"));
      enforce(validateRetainedPlayers(trip.players, parsed.data.playerNames));
      const { pool, rules, settings } = await validatedConfig(tx, parsed.data, user.id, trip.id);
      await tx.tripPoolCard.deleteMany({ where: { tripId: trip.id } });
      await tx.tripDealRule.deleteMany({ where: { tripId: trip.id } });
      // Preserve retained IDs, especially claimed slots, across settings edits.
      await tx.tripPlayer.deleteMany({ where: { tripId: trip.id, userId: null, displayName: { notIn: parsed.data.playerNames } } });
      const added = parsed.data.playerNames.filter(name => !trip.players.some(p => p.displayName === name));
      await tx.trip.update({ where: { id: trip.id }, data: { name: parsed.data.name, responseWindowMinutes: parsed.data.responseWindowMinutes, ...settings,
        pool: { create: pool }, dealRules: { create: rules }, players: { create: added.map(displayName => ({ displayName })) },
      } });
    });
    refresh(id.data);
    return { ok: true, message: "Configuración guardada.", redirectTo: `/trips/${id.data}` };
  });
}
export async function claimPlayer(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = z.object({ tripId: idSchema, playerId: idSchema, code: z.string().regex(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/, "El código no es válido.") }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    const joined = await prisma.$transaction(async tx => {
      const trip = await lockTrip(tx, parsed.data.tripId);
      // The invitation code authorizes a first claim, before membership exists.
      if (trip.code !== parsed.data.code) throw new ActionError("La invitación no corresponde a este viaje.");
      enforce(canClaimPlayer(trip.status, trip.players, parsed.data.playerId, user.id));
      const now = new Date();
      const claimed = await tx.tripPlayer.updateMany({ where: { id: parsed.data.playerId, tripId: trip.id, userId: null }, data: { userId: user.id, joinedAt: now } });
      requireOne(claimed.count, "Ese nombre acaba de ser reclamado por otra persona.");
      const player = trip.players.find(p => p.id === parsed.data.playerId)!;
      await tx.tripEvent.create({ data: { tripId: trip.id, actorPlayerId: player.id, type: "PLAYER_JOINED", message: buildEventMessage("PLAYER_JOINED", { attackerName: "", targetName: player.displayName, cardName: "" }) } });
      return { creatorId: trip.creatorId, tripName: trip.name, playerName: player.displayName, claimed: trip.players.filter(p => p.userId).length + 1, total: trip.players.length };
    });
    if (joined.creatorId !== user.id) await sendNotifications([{ userIds: [joined.creatorId], payload: playerJoinedNotification({ tripId: parsed.data.tripId, ...joined }) }]);
    refresh(parsed.data.tripId);
    return { ok: true, message: "¡Ya estás dentro!", redirectTo: `/trips/${parsed.data.tripId}` };
  });
}
export async function startTrip(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = idSchema.safeParse(form.get("tripId"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    const started = await inTripTransaction(parsed.data, user.id, async (tx, trip) => {
      enforce(canManageTrip(trip, user.id, "DRAFT"));
      const pool = trip.pool.map(c => ({ cardTypeId: c.cardTypeId, category: c.cardType.category, rarity: c.cardType.rarity }));
      const config = dealConfigOf(trip, trip.dealRules);
      const message = validateDealConfig(pool, config, trip.players.length);
      if (message) throw new ActionError(message);
      const cards = dealCards({ playerIds: trip.players.map(p => p.id), pool, config });
      const started = await tx.trip.updateMany({ where: { id: trip.id, status: "DRAFT" }, data: { status: "ACTIVE", startedAt: new Date() } });
      requireOne(started.count, "El viaje ya se ha iniciado.");
      await tx.playerCard.createMany({ data: cards.map(card => ({ ...card, tripId: trip.id })) });
      await tx.tripEvent.create({ data: { tripId: trip.id, type: "TRIP_STARTED", message: buildEventMessage("TRIP_STARTED", { attackerName: "", targetName: "", cardName: "" }) } });
      return { name: trip.name, members: trip.players.map(p => p.userId).filter(id => id !== user.id) };
    });
    await sendNotifications([{ userIds: started.members, payload: tripStartedNotification({ tripId: parsed.data, tripName: started.name }) }]);
    refresh(parsed.data);
    return { ok: true, message: "¡Viaje iniciado! Las cartas están repartidas." };
  });
}
export async function finishTrip(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = idSchema.safeParse(form.get("tripId"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    await inTripTransaction(parsed.data, user.id, async (tx, trip) => {
      enforce(canManageTrip(trip, user.id, "ACTIVE"));
      const now = new Date();
      const resolved = await resolvePlaysInTransaction(tx, trip.id, now, true);
      const finished = await tx.trip.updateMany({ where: { id: trip.id, status: "ACTIVE" }, data: { status: "FINISHED", finishedAt: now } });
      requireOne(finished.count, "El viaje ya ha finalizado.");
      await tx.tripEvent.create({ data: { tripId: trip.id, type: "TRIP_FINISHED", message: buildEventMessage("TRIP_FINISHED", { attackerName: "", targetName: "", cardName: "" }) } });
      return expiredNotifications(trip.id, resolved);
    }).then(sendNotifications);
    refresh(parsed.data);
    return { ok: true, message: "Viaje finalizado. Ya puedes consultar el resumen." };
  });
}
