import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getTripForUser, getTripHistory } from "@/lib/trips";
import { resolveExpiredPlays } from "@/lib/plays";
import { AutoRefresh } from "@/components/AutoRefresh";
export const dynamic = "force-dynamic";
export default async function HistoryPage({ params }: { params: Promise<{ tripId: string }> }) {
  const user = await requireUser();
  const { tripId } = await params;
  const access = await getTripForUser(tripId, user.id);
  if (!access) notFound();
  await resolveExpiredPlays(tripId, user.id);
  const plays = await getTripHistory(tripId, user.id);
  if (!plays) notFound();
  return <div className="space-y-6">{access.trip.status === "ACTIVE" && <AutoRefresh />}<Link href={`/trips/${tripId}`} className="text-sm text-primary">← Volver al viaje</Link><div><h1>Historial de jugadas</h1><p className="mt-2 text-ink-soft">{access.trip.name} · {plays.length} jugadas</p></div>
    {plays.length === 0 && <p className="panel text-sm text-muted">Aún no se ha jugado ninguna carta.</p>}
    <ol className="space-y-4">{plays.map(play => {
      const expired = play.events.some(event => event.type === "PLAY_EXPIRED");
      const result = expired ? "Expirada · aplicada" : play.status === "PENDING" ? "Pendiente" : play.status === "ACCEPTED" ? "Aceptada" : play.status === "BLOCKED" ? `Bloqueada con ${play.reactionCard?.cardType.name ?? "Escudo"}` : `Devuelta con ${play.reactionCard?.cardType.name ?? "Boomerang"}`;
      const finalTarget = access.trip.players.find(p => p.id === play.finalTargetId);
      return <li key={play.id} className="panel space-y-3"><div className="flex flex-wrap justify-between gap-2"><time dateTime={play.createdAt.toISOString()} className="text-xs text-muted">{new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" }).format(play.createdAt)}</time><span className="badge">{result}</span></div><h2 className="text-lg">{play.card.cardType.emoji} {play.card.cardType.name}</h2><p className="text-sm">{play.attacker.displayName} → {play.target.displayName}</p><p className="text-sm text-ink-soft">{finalTarget ? `Efecto aplicado a ${finalTarget.displayName}.` : play.status === "BLOCKED" ? "Nadie recibe el efecto." : "Esperando respuesta."}</p></li>;
    })}</ol>
  </div>;
}
