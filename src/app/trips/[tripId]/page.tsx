import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getTripBoard, getTripForUser, getTripHistory } from "@/lib/trips";
import { resolveExpiredPlays } from "@/lib/plays";
import { startTrip, finishTrip } from "@/app/actions/trips";
import { AutoRefresh } from "@/components/AutoRefresh";
import { CopyButton } from "@/components/CopyButton";
import { PlayerList } from "@/components/PlayerList";
import { JoinPicker } from "@/components/JoinPicker";
import { ActionForm } from "@/components/ActionForm";
import { Hand } from "@/components/Hand";
import { PendingPlays } from "@/components/PendingPlays";
import { EventFeed } from "@/components/EventFeed";
import { statusLabels } from "@/components/TripCard";
export const dynamic = "force-dynamic";
export default async function TripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const user = await requireUser();
  const { tripId } = await params;
  const access = await getTripForUser(tripId, user.id);
  if (!access) notFound();
  await resolveExpiredPlays(tripId, user.id);
  const current = await getTripForUser(tripId, user.id);
  if (!current) notFound();
  const { trip, me, isCreator } = current;
  const players = trip.players.map(p => ({ id: p.id, displayName: p.displayName, claimed: Boolean(p.userId), image: p.user?.image }));
  const board = trip.status === "ACTIVE" ? await getTripBoard(tripId, me?.id ?? null, user.id) : null;
  const history = trip.status === "FINISHED" ? await getTripHistory(tripId, user.id) : null;
  const ranking = history ? players.map(player => ({ ...player, received: history.filter(play => play.finalTargetId === player.id).length })).sort((a, b) => b.received - a.received || a.displayName.localeCompare(b.displayName, "es")) : [];
  return <div className="space-y-7">
    {trip.status !== "FINISHED" && <AutoRefresh />}
    <Link href="/" className="text-sm text-primary">← Mis viajes</Link>
    <header className="space-y-3"><span className="badge">{statusLabels[trip.status]}</span><h1 className="break-words">{trip.name}</h1><div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft"><span>{me ? `Juegas como ${me.displayName}` : "Elige tu nombre para jugar"} · {trip.responseWindowMinutes} min por ataque</span><Link href={`/trips/${tripId}/history`} className="font-semibold text-primary">Historial ↗</Link></div></header>
    {trip.status !== "FINISHED" && <section className="panel flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-muted">Código de embarque</p><p className="mt-2 font-mono text-3xl font-bold tracking-[0.2em]">{trip.code}</p></div><CopyButton path={`/join/${trip.code}`} /></section>}
    {!me && trip.status !== "FINISHED" && <JoinPicker tripId={tripId} code={trip.code} players={players} />}
    {trip.status === "DRAFT" && <>
      <PlayerList players={players} />
      <section className="panel space-y-4"><h2>Así se juega este viaje</h2><p className="text-sm text-ink-soft">Cada participante recibe {trip.dealRules.reduce((sum, rule) => sum + rule.cardsPerPlayer, 0)} cartas. También repartiremos a quienes aún no hayan entrado.</p>
        <ul className="flex flex-wrap gap-2">{trip.dealRules.map(rule => <li key={rule.category} className="badge capitalize">{rule.category}: {rule.cardsPerPlayer}</li>)}</ul>
        <details><summary className="cursor-pointer text-sm font-semibold">Ver los {trip.pool.length} tipos de carta</summary><ul className="mt-3 space-y-2 text-sm">{trip.pool.map(p => <li key={p.cardTypeId}>{p.cardType.emoji} {p.cardType.name}</li>)}</ul></details>
      </section>
      {isCreator ? <div className="flex flex-wrap gap-3"><Link className="btn-secondary" href={`/trips/${tripId}/settings`}>Editar configuración</Link><ActionForm action={startTrip} fields={{ tripId }} label="Iniciar viaje" confirmMessage="¿Iniciar el viaje y repartir las cartas? La configuración quedará cerrada." /></div> : <p className="text-center text-sm text-muted">El creador iniciará el viaje cuando estéis listos.</p>}
    </>}
    {trip.status === "ACTIVE" && board && <>
      {me && <><PendingPlays tripId={tripId} incoming={board.incoming} outgoing={board.outgoing} reactions={board.hand.filter(c => c.status === "AVAILABLE" && c.cardType.kind === "REACTION")} /><Hand tripId={tripId} cards={board.hand} targets={players.filter(p => p.id !== me.id)} /></>}
      <EventFeed events={board.events} />
      <PlayerList players={board.players.map(p => ({ id: p.id, displayName: p.displayName, claimed: Boolean(p.userId), image: p.user?.image, available: p.available, locked: p.locked }))} />
      {isCreator && <div className="border-t border-border pt-5"><ActionForm action={finishTrip} fields={{ tripId }} label="Finalizar viaje" confirmMessage="¿Finalizar el viaje? Todos los ataques pendientes se aplicarán a sus objetivos y ya no se podrán jugar cartas." secondary /></div>}
    </>}
    {trip.status === "FINISHED" && <>
      <section className="panel space-y-4"><p className="text-4xl" aria-hidden>🏁</p><h2>Un viaje para recordar</h2><p className="text-ink-soft">{history?.length ?? 0} jugadas y muchas historias.</p><Link href={`/trips/${tripId}/history`} className="btn">Ver el historial completo</Link></section>
      <section className="panel space-y-4"><h2>Quien más cartas ha sufrido</h2><ol className="space-y-3">{ranking.map((p, i) => <li key={p.id} className="flex justify-between gap-3 border-b border-border pb-3 text-sm"><span>{i + 1}. {p.displayName}</span><strong>{p.received} cartas</strong></li>)}</ol><p className="text-xs text-muted">Los ataques devueltos cuentan para quien los lanzó. Los bloqueados no cuentan.</p></section>
    </>}
  </div>;
}
