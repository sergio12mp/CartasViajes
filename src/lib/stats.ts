import { prisma } from "./db";
import { aggregateCardStats } from "./game/stats";
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
