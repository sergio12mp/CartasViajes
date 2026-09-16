import { prisma } from "./db";
import { tripInclude } from "./transactions";
export async function getTripsForUser(userId: string) {
  return prisma.trip.findMany({
    where: { OR: [{ creatorId: userId }, { players: { some: { userId } } }] },
    include: { _count: { select: { players: true } }, players: { where: { userId }, select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
  });
}
export async function getTripForUser(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, OR: [{ creatorId: userId }, { players: { some: { userId } } }] }, include: tripInclude });
  if (!trip) return null;
  return { trip, me: trip.players.find(p => p.userId === userId) ?? null, isCreator: trip.creatorId === userId };
}
export async function getTripByCode(code: string) {
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code)) return null;
  return prisma.trip.findUnique({ where: { code }, select: {
    id: true, name: true, code: true, status: true, legendariesPerPlayer: true, raresPerPlayer: true, commonsPerPlayer: true, dealByCategory: true, dealRules: true,
    players: { select: { id: true, displayName: true, userId: true, user: { select: { image: true } } }, orderBy: { displayName: "asc" } },
    _count: { select: { pool: true } },
  } });
}
const playInclude = { attacker: true, target: true, card: { include: { cardType: true } }, reactionCard: { include: { cardType: true } } };
export async function getTripBoard(tripId: string, playerId: string | null, userId: string) {
  const access = await getTripForUser(tripId, userId);
  if (!access || (playerId !== null && access.me?.id !== playerId)) return null;
  const [hand, incoming, outgoing, events, counts] = await Promise.all([
    playerId ? prisma.playerCard.findMany({ where: { tripId, playerId }, include: { cardType: true }, orderBy: [{ status: "asc" }, { cardTypeId: "asc" }, { id: "asc" }] }) : [],
    playerId ? prisma.play.findMany({ where: { tripId, targetId: playerId, status: "PENDING" }, include: playInclude, orderBy: { expiresAt: "asc" } }) : [],
    playerId ? prisma.play.findMany({ where: { tripId, attackerId: playerId, status: "PENDING" }, include: playInclude, orderBy: { expiresAt: "asc" } }) : [],
    prisma.tripEvent.findMany({ where: { tripId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50 }),
    prisma.playerCard.groupBy({ by: ["playerId", "status"], where: { tripId }, _count: true }),
  ]);
  return { hand, incoming, outgoing, events, players: access.trip.players.map(p => ({ ...p,
    available: counts.find(c => c.playerId === p.id && c.status === "AVAILABLE")?._count ?? 0,
    locked: counts.find(c => c.playerId === p.id && c.status === "LOCKED")?._count ?? 0,
  })) };
}
export async function getTripFeedbackForUser(tripId: string, userId: string) {
  return prisma.tripFeedback.findUnique({ where: { tripId_userId: { tripId, userId } } });
}
export async function getTripHistory(tripId: string, userId: string) {
  if (!await getTripForUser(tripId, userId)) return null;
  return prisma.play.findMany({ where: { tripId }, include: { ...playInclude, events: { select: { type: true } } }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
}
