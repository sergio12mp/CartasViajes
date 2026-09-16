"use client";
import { useEffect, useState } from "react";
import { acceptPlay, reactToPlay } from "@/app/actions/plays";
import { ActionForm } from "./ActionForm";
import type { HandCard } from "./CardTile";
import { TripuReminder } from "./TripuReminder";
export type PendingPlayView = { id: string; expiresAt: Date; attacker: { displayName: string }; target: { displayName: string }; card: { cardType: { name: string } } };
export function PendingPlays({ tripId, incoming, outgoing, reactions }: { tripId: string; incoming: PendingPlayView[]; outgoing: PendingPlayView[]; reactions: HandCard[] }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const interval = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(interval); }, []);
  function seconds(play: PendingPlayView) { return now === null ? null : Math.max(0, Math.ceil((new Date(play.expiresAt).getTime() - now) / 1000)); }
  function countdown(play: PendingPlayView) { const left = seconds(play); return left === null ? "Calculando tiempo…" : left === 0 ? "Tiempo agotado · resolviendo…" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} para responder`; }
  return <section className="space-y-4"><h2>En la mesa</h2>
    {incoming.length === 0 && <p className="panel text-sm text-ink-soft">Todo tranquilo: no tienes ataques pendientes.</p>}
    {incoming.map(play => <article className="rounded-2xl border-2 border-warning bg-accent/10 p-5" key={play.id}>
      <p className="text-xs font-bold uppercase tracking-wide text-warning">Te han lanzado una carta</p><h3 className="mt-2 text-xl font-bold">{play.card.cardType.name}</h3><p className="mt-1 text-sm">De {play.attacker.displayName}</p>
      <p className="my-4 font-mono text-sm font-semibold" role="timer">{countdown(play)}</p>
      <ActionForm action={acceptPlay} fields={{ tripId, playId: play.id }} label="Aceptar" disabled={seconds(play) === 0} />
      {reactions.length > 0 && <div className="mt-4 space-y-3">
        {seconds(play) !== 0 && <TripuReminder reaction />}
        <div className="flex flex-wrap gap-2">{reactions.map(card => <ActionForm key={card.id} action={reactToPlay} fields={{ tripId, playId: play.id, reactionCardId: card.id }} label={`Usar ${card.cardType.name}`} disabled={seconds(play) === 0} secondary />)}</div>
      </div>}
    </article>)}
    {outgoing.length > 0 && <div className="panel space-y-3"><h3 className="font-semibold">Esperando respuesta</h3>{outgoing.map(play => <div key={play.id} className="border-t border-border pt-3 text-sm"><p>{play.card.cardType.name} → <strong>{play.target.displayName}</strong></p><p className="mt-1 text-xs text-muted">{countdown(play)}</p></div>)}</div>}
  </section>;
}
