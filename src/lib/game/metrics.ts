const DAY = 86_400_000;
export interface TripForMetrics { id: string; creatorId: string; status: "DRAFT" | "ACTIVE" | "FINISHED"; createdAt: Date; claimedPlayers: number; plays: number }
export interface JoinForMetrics { userId: string; tripCreatorId: string; joinedAt: Date }
export interface GrowthMetrics {
  invited: number; converted: number; kFactor: number | null;
  tripsConsidered: number; activated: number; activationRate: number | null;
  finishedTrips: number; playsPerPlayer: number | null;
  sharedTrips: number; shareRate: number | null;
}
export function computeGrowthMetrics(input: { trips: TripForMetrics[]; joins: JoinForMetrics[]; sharedTripIds: Iterable<string>; now: Date; conversionWindowDays?: number; activationGraceHours?: number }): GrowthMetrics {
  const { trips, joins, sharedTripIds, now, conversionWindowDays = 60, activationGraceHours = 24 } = input;
  const firstCreated = new Map<string, Date>();
  for (const trip of trips) { const current = firstCreated.get(trip.creatorId); if (!current || trip.createdAt < current) firstCreated.set(trip.creatorId, trip.createdAt); }
  const firstInvitedJoin = new Map<string, Date>();
  for (const join of joins) {
    if (join.userId === join.tripCreatorId) continue;
    const current = firstInvitedJoin.get(join.userId);
    if (!current || join.joinedAt < current) firstInvitedJoin.set(join.userId, join.joinedAt);
  }
  let invited = 0, converted = 0;
  for (const [userId, joinedAt] of firstInvitedJoin) {
    const created = firstCreated.get(userId);
    if (created && created < joinedAt) continue;
    invited++;
    if (created && created.getTime() - joinedAt.getTime() <= conversionWindowDays * DAY) converted++;
  }
  const considered = trips.filter(t => now.getTime() - t.createdAt.getTime() >= activationGraceHours * 3_600_000);
  const activated = considered.filter(t => t.status !== "DRAFT" && t.claimedPlayers >= 3).length;
  const finished = trips.filter(t => t.status === "FINISHED" && t.claimedPlayers > 0);
  const playsPerPlayer = finished.length ? finished.reduce((sum, t) => sum + t.plays / t.claimedPlayers, 0) / finished.length : null;
  const shared = new Set(sharedTripIds);
  const sharedTrips = trips.filter(t => t.status === "FINISHED" && shared.has(t.id)).length;
  const finishedCount = trips.filter(t => t.status === "FINISHED").length;
  return {
    invited, converted, kFactor: invited ? converted / invited : null,
    tripsConsidered: considered.length, activated, activationRate: considered.length ? activated / considered.length : null,
    finishedTrips: finishedCount, playsPerPlayer, sharedTrips, shareRate: finishedCount ? sharedTrips / finishedCount : null,
  };
}
