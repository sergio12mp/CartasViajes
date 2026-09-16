export interface PushPayload { title: string; body: string; url: string; tag?: string }
const tripUrl = (tripId: string) => `/trips/${tripId}`;
export function cardPlayedNotification(p: { tripId: string; playId: string; attackerName: string; cardName: string; minutes: number }): PushPayload {
  return { title: `${p.attackerName} te ha lanzado ${p.cardName}`, body: `Tienes ${p.minutes} ${p.minutes === 1 ? "minuto" : "minutos"} para aceptar o reaccionar.`, url: tripUrl(p.tripId), tag: `play-${p.playId}` };
}
export function playRespondedNotification(p: { tripId: string; playId: string; status: "ACCEPTED" | "BLOCKED" | "REFLECTED"; targetName: string; cardName: string; reactionName?: string | null }): PushPayload {
  const title = p.status === "ACCEPTED" ? `${p.targetName} ha aceptado ${p.cardName}` : p.status === "BLOCKED" ? `${p.targetName} ha bloqueado ${p.cardName}` : `${p.targetName} te ha devuelto ${p.cardName}`;
  const body = p.status === "ACCEPTED" ? "El efecto se aplica. ¡Que lo cumpla!" : p.status === "BLOCKED" ? `Ha usado ${p.reactionName ?? "Escudo"}. Nadie recibe el efecto.` : `Ha usado ${p.reactionName ?? "Rebote"}. Ahora el efecto es para ti.`;
  return { title, body, url: tripUrl(p.tripId), tag: `play-${p.playId}` };
}
export function playExpiredNotification(p: { tripId: string; playId: string; forAttacker: boolean; attackerName: string; targetName: string; cardName: string }): PushPayload {
  return p.forAttacker
    ? { title: `${p.cardName} se ha aplicado a ${p.targetName}`, body: "No respondió a tiempo, así que el efecto cuenta.", url: tripUrl(p.tripId), tag: `play-${p.playId}` }
    : { title: `Se te ha aplicado ${p.cardName}`, body: `Se agotó el tiempo para responder a ${p.attackerName}.`, url: tripUrl(p.tripId), tag: `play-${p.playId}` };
}
export function tripStartedNotification(p: { tripId: string; tripName: string }): PushPayload {
  return { title: `¡${p.tripName} ha empezado!`, body: "Ya tienes tus cartas. Entra y mira tu mano.", url: tripUrl(p.tripId), tag: `trip-${p.tripId}` };
}
