export type RuleResult = { ok: true } | { ok: false; message: string };
type Trip = { status: "DRAFT" | "ACTIVE" | "FINISHED" };
type Card = { status: "AVAILABLE" | "LOCKED"; kind: "ATTACK" | "REACTION"; playerId: string };
export type ResponseInput = {
  trip: Trip;
  play: { status: "PENDING" | "ACCEPTED" | "BLOCKED" | "REFLECTED"; targetId: string; expiresAt: Date };
  responderPlayerId: string; now: Date;
};
const fail = (message: string): RuleResult => ({ ok: false, message });
export function canPlayAttack({ trip, card, attackerPlayerId, targetPlayerId }: {
  trip: Trip; card: Card; attackerPlayerId: string; targetPlayerId: string;
}): RuleResult {
  if (trip.status !== "ACTIVE") return fail("El viaje no está activo.");
  if (card.playerId !== attackerPlayerId) return fail("Esa carta no es tuya.");
  if (card.status !== "AVAILABLE") return fail("Esa carta ya se ha usado.");
  if (card.kind !== "ATTACK") return fail("Solo puedes jugar cartas de ataque contra otros jugadores.");
  if (targetPlayerId === attackerPlayerId) return fail("No puedes atacarte a ti mismo.");
  return { ok: true };
}
export function canRespond({ trip, play, responderPlayerId, now }: ResponseInput): RuleResult {
  if (trip.status !== "ACTIVE") return fail("El viaje no está activo.");
  if (play.status !== "PENDING") return fail("Esta jugada ya está resuelta.");
  if (play.targetId !== responderPlayerId) return fail("Solo puede responder quien recibió el ataque.");
  // Expiration uses the same inclusive boundary in the rules and database.
  if (now >= play.expiresAt) return fail("La jugada ha expirado y se ha aplicado.");
  return { ok: true };
}
export function canReact(args: ResponseInput & { reactionCard: Card }): RuleResult {
  const response = canRespond(args);
  if (!response.ok) return response;
  if (args.reactionCard.playerId !== args.responderPlayerId) return fail("Esa carta de reacción no es tuya.");
  if (args.reactionCard.status !== "AVAILABLE") return fail("Esa carta ya se ha usado.");
  if (args.reactionCard.kind !== "REACTION") return fail("Necesitas una carta de reacción.");
  return { ok: true };
}
export function resolveReaction(effect: "BLOCK" | "REFLECT", play: { attackerId: string; targetId: string }): { status: "BLOCKED" | "REFLECTED"; finalTargetId: string | null } {
  switch (effect) {
    case "BLOCK": return { status: "BLOCKED", finalTargetId: null };
    case "REFLECT": return { status: "REFLECTED", finalTargetId: play.attackerId };
    default: throw new Error("Efecto de reacción desconocido.");
  }
}
export function computeExpiry(createdAt: Date, responseWindowMinutes: number): Date {
  if (!Number.isFinite(createdAt.getTime()) || !Number.isInteger(responseWindowMinutes) || responseWindowMinutes < 1 || responseWindowMinutes > 120) throw new Error("La ventana de respuesta debe ser de 1 a 120 minutos.");
  return new Date(createdAt.getTime() + responseWindowMinutes * 60_000);
}
export type GameEventType = "TRIP_STARTED" | "TRIP_FINISHED" | "CARD_PLAYED" | "PLAY_ACCEPTED" | "PLAY_BLOCKED" | "PLAY_REFLECTED" | "PLAY_EXPIRED" | "PLAYER_JOINED";
export function buildEventMessage(type: GameEventType, ctx: { attackerName: string; targetName: string; cardName: string; reactionName?: string }): string {
  const { attackerName, targetName, cardName, reactionName } = ctx;
  switch (type) {
    case "TRIP_STARTED": return "¡El viaje ha comenzado! Las cartas están repartidas.";
    case "TRIP_FINISHED": return "El viaje ha finalizado. Todas las jugadas están resueltas.";
    case "PLAYER_JOINED": return `${targetName} se ha unido al viaje.`;
    case "CARD_PLAYED": return `${attackerName} jugó ${cardName} contra ${targetName}.`;
    case "PLAY_ACCEPTED": return `${targetName} aceptó ${cardName} de ${attackerName}.`;
    case "PLAY_BLOCKED": return `${targetName} bloqueó ${cardName} de ${attackerName} con ${reactionName ?? "Escudo"}.`;
    case "PLAY_REFLECTED": return `${targetName} devolvió ${cardName} a ${attackerName} con ${reactionName ?? "Boomerang"}.`;
    case "PLAY_EXPIRED": return `Se agotó el tiempo: ${cardName} de ${attackerName} se aplica a ${targetName}.`;
  }
}
