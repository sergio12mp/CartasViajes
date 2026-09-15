import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import type { ActionState } from "./action-state";
import type { RuleResult } from "./game/rules";
export class ActionError extends Error {}
export function enforce(result: RuleResult) { if (!result.ok) throw new ActionError(result.message); }
export function requireOne(count: number, message: string) { if (count !== 1) throw new ActionError(message); }
export const tripInclude = {
  players: { include: { user: { select: { image: true } } }, orderBy: { displayName: "asc" as const } },
  pool: { include: { cardType: true } }, dealRules: true,
} satisfies Prisma.TripInclude;
// All mutations lock the trip first, so start/finish/claim/play share one ordering.
// PostgreSQL holds this row lock only until the transaction commits or rolls back.
export async function lockTrip(tx: Prisma.TransactionClient, tripId: string) {
  await tx.$queryRaw`SELECT "id" FROM "Trip" WHERE "id" = ${tripId} FOR UPDATE`;
  const trip = await tx.trip.findUnique({ where: { id: tripId }, include: tripInclude });
  if (!trip) throw new ActionError("El viaje no existe.");
  return trip;
}
export function requireMembership(trip: { creatorId: string; players: { userId: string | null }[] }, userId: string) {
  if (trip.creatorId !== userId && !trip.players.some(p => p.userId === userId)) throw new ActionError("No tienes acceso a este viaje.");
}
export async function inTripTransaction<T>(tripId: string, userId: string, work: (tx: Prisma.TransactionClient, trip: Awaited<ReturnType<typeof lockTrip>>) => Promise<T>) {
  return prisma.$transaction(async tx => {
    const trip = await lockTrip(tx, tripId);
    requireMembership(trip, userId);
    return work(tx, trip);
  }, { maxWait: 10_000, timeout: 20_000 });
}
export async function actionResult(work: () => Promise<ActionState>): Promise<ActionState> {
  try { return await work(); }
  catch (error) {
    if (error instanceof ActionError) return { ok: false, message: error.message };
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2034"].includes(error.code)) return { ok: false, message: "Otra operación se adelantó. Actualiza la página e inténtalo de nuevo." };
    // Do not expose database errors, connection strings or personal data to clients or logs.
    return { ok: false, message: "No se pudo completar la operación. Inténtalo de nuevo." };
  }
}
