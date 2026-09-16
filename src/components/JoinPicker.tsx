import { claimPlayer } from "@/app/actions/trips";
import { ActionForm } from "./ActionForm";
import type { PlayerView } from "./PlayerList";
import Image from "next/image";
export function JoinPicker({ tripId, code, players, readOnly = false }: { tripId: string; code: string; players: PlayerView[]; readOnly?: boolean }) {
  return <section className="panel space-y-4"><div><h2>{readOnly ? "La tripulación" : "¿Quién eres en este viaje?"}</h2><p className="mt-1 text-sm text-ink-soft">{readOnly ? "Entra con Google para reclamar tu nombre." : "Elige tu nombre. Las cartas de ese nombre serán tuyas."}</p></div>
    <ul className="space-y-3">{players.map(p => <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-bg p-3">
      <span className="flex items-center gap-2 break-words">{p.image && <Image src={p.image} width={28} height={28} alt="" className="rounded-full" />}{p.displayName}</span>
      {p.claimed ? <span className="text-xs text-success">A bordo</span> : readOnly ? <span className="text-xs text-muted">Libre</span> : <ActionForm action={claimPlayer} fields={{ tripId, playerId: p.id, code }} label={`Soy ${p.displayName}`} secondary />}
    </li>)}</ul>
    {players.every(p => p.claimed) && <p className="text-sm text-muted">Todos los nombres están reclamados.</p>}
  </section>;
}
