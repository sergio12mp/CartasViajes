import type { Prisma } from "@prisma/client";
import { buildEventMessage } from "./game/rules";
import { playExpiredNotification } from "./game/notifications";
import { inTripTransaction } from "./transactions";
import { sendNotifications, type Notification } from "./push";
// Update each winner separately: finalTargetId differs per play and events must
// never be emitted for a row another response has already resolved.
export async function resolvePlaysInTransaction(tx: Prisma.TransactionClient, tripId: string, now: Date, allPending = false) {
  const plays = await tx.play.findMany({ where: { tripId, status: "PENDING", ...(allPending ? {} : { expiresAt: { lte: now } }) }, include: { attacker: true, target: true, card: { include: { cardType: true } } } });
  const resolved: typeof plays = [];
  for (const play of plays) {
    const updated = await tx.play.updateMany({ where: { id: play.id, tripId, status: "PENDING" }, data: { status: "ACCEPTED", resolvedAt: now, finalTargetId: play.targetId } });
    if (updated.count !== 1) continue;
    resolved.push(play);
    await tx.tripEvent.create({ data: {
      tripId, playId: play.id, type: "PLAY_EXPIRED", createdAt: now,
      message: allPending && play.expiresAt > now
        ? `Al finalizar el viaje, ${play.card.cardType.name} de ${play.attacker.displayName} se aplica a ${play.target.displayName}.`
        : buildEventMessage("PLAY_EXPIRED", { attackerName: play.attacker.displayName, targetName: play.target.displayName, cardName: play.card.cardType.name }),
    } });
  }
  return resolved;
}
export function expiredNotifications(tripId: string, plays: Awaited<ReturnType<typeof resolvePlaysInTransaction>>): Notification[] {
  return plays.flatMap(play => {
    const names = { tripId, playId: play.id, attackerName: play.attacker.displayName, targetName: play.target.displayName, cardName: play.card.cardType.name };
    return [{ userIds: [play.attacker.userId], payload: playExpiredNotification({ ...names, forAttacker: true }) }, { userIds: [play.target.userId], payload: playExpiredNotification({ ...names, forAttacker: false }) }];
  });
}
export async function resolveExpiredPlays(tripId: string, userId: string, now?: Date) {
  const resolved = await inTripTransaction(tripId, userId, async (tx) => resolvePlaysInTransaction(tx, tripId, now ?? new Date()));
  await sendNotifications(expiredNotifications(tripId, resolved));
}
