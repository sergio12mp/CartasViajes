import { expect, it } from "vitest";
import { computeGrowthMetrics } from "./metrics";
const day = (n: number) => new Date(Date.UTC(2026, 0, 1 + n));
const now = day(100);
it("computes k-factor from invited users who later create trips within the window", () => {
  const metrics = computeGrowthMetrics({
    trips: [
      { id: "t1", creatorId: "ana", status: "FINISHED", createdAt: day(0), claimedPlayers: 4, plays: 12 },
      { id: "t2", creatorId: "luis", status: "ACTIVE", createdAt: day(10), claimedPlayers: 3, plays: 3 },
      { id: "t3", creatorId: "marta", status: "DRAFT", createdAt: new Date(now.getTime() - 3_600_000), claimedPlayers: 1, plays: 0 },
      { id: "t4", creatorId: "pepe", status: "FINISHED", createdAt: day(50), claimedPlayers: 2, plays: 2 },
    ],
    joins: [
      { userId: "ana", tripCreatorId: "ana", joinedAt: day(0) },
      { userId: "luis", tripCreatorId: "ana", joinedAt: day(1) },
      { userId: "marta", tripCreatorId: "ana", joinedAt: day(1) },
      { userId: "pepe", tripCreatorId: "ana", joinedAt: day(2) },
      { userId: "sofia", tripCreatorId: "ana", joinedAt: day(2) },
    ],
    sharedTripIds: ["t1"], now,
  });
  expect(metrics.invited).toBe(4);
  expect(metrics.converted).toBe(2);
  expect(metrics.kFactor).toBe(0.5);
  expect(metrics.tripsConsidered).toBe(3);
  expect(metrics.activated).toBe(2);
  expect(metrics.finishedTrips).toBe(2);
  expect(metrics.playsPerPlayer).toBe(2);
  expect(metrics.sharedTrips).toBe(1);
  expect(metrics.shareRate).toBe(0.5);
});
it("returns null rates without data", () => {
  const metrics = computeGrowthMetrics({ trips: [], joins: [], sharedTripIds: [], now });
  expect(metrics).toMatchObject({ kFactor: null, activationRate: null, playsPerPlayer: null, shareRate: null });
});
