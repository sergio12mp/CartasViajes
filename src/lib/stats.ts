import { prisma } from "./db";
import { aggregateCardStats } from "./game/stats";
import { computeGrowthMetrics } from "./game/metrics";
export async function getGrowthStats(now = new Date()) {
  const [trips, joins, shares, shareCounts, revenue] = await Promise.all([
    prisma.trip.findMany({ select: { id: true, creatorId: true, status: true, createdAt: true, _count: { select: { players: { where: { userId: { not: null } } }, plays: true } } } }),
    prisma.tripPlayer.findMany({ where: { userId: { not: null }, joinedAt: { not: null } }, select: { userId: true, joinedAt: true, trip: { select: { creatorId: true } } } }),
    prisma.shareEvent.findMany({ where: { kind: "SUMMARY", tripId: { not: null } }, select: { tripId: true }, distinct: ["tripId"] }),
    prisma.shareEvent.groupBy({ by: ["kind"], _count: { _all: true } }),
    prisma.packPurchase.groupBy({ by: ["packId", "scope"], where: { status: "PAID" }, _count: { _all: true }, _sum: { amountCents: true } }),
  ]);
  const metrics = computeGrowthMetrics({
    trips: trips.map(t => ({ id: t.id, creatorId: t.creatorId, status: t.status, createdAt: t.createdAt, claimedPlayers: t._count.players, plays: t._count.plays })),
    joins: joins.map(j => ({ userId: j.userId!, tripCreatorId: j.trip.creatorId, joinedAt: j.joinedAt! })),
    sharedTripIds: shares.map(s => s.tripId!), now,
  });
  const packs = await prisma.cardPack.findMany({ where: { id: { in: revenue.map(r => r.packId) } }, select: { id: true, name: true, emoji: true } });
  return { metrics, shares: Object.fromEntries(shareCounts.map(s => [s.kind, s._count._all])) as Partial<Record<"SUMMARY" | "CARD" | "INVITE", number>>, revenue: revenue.map(r => ({ ...r, pack: packs.find(p => p.id === r.packId) })), totalRevenueCents: revenue.reduce((sum, r) => sum + (r._sum.amountCents ?? 0), 0) };
}
export async function getCardStats() {
  const [plays, favorites, cards, tripCounts, feedbackAggregate] = await Promise.all([
    prisma.play.findMany({ select: { status: true, card: { select: { cardTypeId: true } }, reactionCard: { select: { cardTypeId: true } }, events: { select: { type: true } } } }),
    prisma.tripFeedback.groupBy({ by: ["favoriteCardTypeId"], _count: { _all: true }, where: { favoriteCardTypeId: { not: null } } }),
    prisma.cardType.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }] }),
    prisma.trip.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.tripFeedback.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
  ]);
  const stats = aggregateCardStats(plays, favorites.map(f => ({ cardTypeId: f.favoriteCardTypeId!, count: f._count._all })));
  const byId = new Map(cards.map(c => [c.id, c]));
  return {
    cards: stats.map(s => ({ ...s, card: byId.get(s.cardTypeId) ?? null })),
    trips: Object.fromEntries(tripCounts.map(t => [t.status, t._count._all])) as Partial<Record<"DRAFT" | "ACTIVE" | "FINISHED", number>>,
    feedback: { count: feedbackAggregate._count._all, averageRating: feedbackAggregate._avg.rating },
    catalog: byId,
  };
}
