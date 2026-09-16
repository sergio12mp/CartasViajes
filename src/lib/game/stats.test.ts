import { expect, it } from "vitest";
import { aggregateCardStats, type PlayForStats } from "./stats";
const play = (cardTypeId: string, status: PlayForStats["status"], reaction?: string, expired = false): PlayForStats => ({ status, card: { cardTypeId }, reactionCard: reaction ? { cardTypeId: reaction } : null, events: expired ? [{ type: "PLAY_EXPIRED" }] : [] });
it("aggregates outcomes, reactions and favorites per card", () => {
  const stats = aggregateCardStats([
    play("hidalgo", "ACCEPTED"), play("hidalgo", "ACCEPTED", undefined, true), play("hidalgo", "BLOCKED", "escudo"), play("hidalgo", "REFLECTED", "rebote"), play("cantar", "PENDING"),
  ], [{ cardTypeId: "cantar", count: 2 }, { cardTypeId: "dj", count: 1 }]);
  expect(stats.map(s => s.cardTypeId)).toEqual(["hidalgo", "cantar", "escudo", "rebote", "dj"]);
  expect(stats[0]).toMatchObject({ played: 4, accepted: 1, expired: 1, blocked: 1, reflected: 1, pending: 0, reactions: { escudo: 1, rebote: 1 } });
  expect(stats[1]).toMatchObject({ played: 1, pending: 1, favorites: 2 });
  expect(stats.find(s => s.cardTypeId === "escudo")).toMatchObject({ played: 0, usedAsReaction: 1 });
  expect(stats.find(s => s.cardTypeId === "dj")).toMatchObject({ played: 0, favorites: 1 });
});
it("returns an empty list without data", () => expect(aggregateCardStats([])).toEqual([]));
