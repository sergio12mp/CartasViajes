import type { RuleResult } from "./rules";
export function canManageTrip(trip: { creatorId: string; status: string }, userId: string, requiredStatus: "DRAFT" | "ACTIVE"): RuleResult {
  if (trip.creatorId !== userId) return { ok: false, message: "Solo el creador puede hacer esto." };
  if (trip.status !== requiredStatus) return { ok: false, message: requiredStatus === "DRAFT" ? "Solo puedes cambiar un viaje que no haya empezado." : "El viaje no está activo." };
  return { ok: true };
}
export function canClaimPlayer(status: string, players: { id: string; userId: string | null }[], playerId: string, userId: string): RuleResult {
  if (status === "FINISHED") return { ok: false, message: "Este viaje ya ha finalizado." };
  const player = players.find(p => p.id === playerId);
  if (!player) return { ok: false, message: "Ese nombre no pertenece al viaje." };
  if (player.userId) return { ok: false, message: "Ese nombre ya está reclamado." };
  if (players.some(p => p.userId === userId)) return { ok: false, message: "Ya tienes un nombre en este viaje." };
  return { ok: true };
}
export function validateRetainedPlayers(players: { displayName: string; userId: string | null }[], names: string[]): RuleResult {
  if (players.some(p => p.userId && !names.includes(p.displayName))) return { ok: false, message: "No puedes eliminar ni renombrar un nombre ya reclamado." };
  return { ok: true };
}
