import Image from "next/image";
export type PlayerView = { id: string; displayName: string; claimed: boolean; image?: string | null; available?: number; locked?: number };
export function PlayerList({ players }: { players: PlayerView[] }) {
  return <section className="panel space-y-4"><h2>La tripulación <span className="text-muted">· {players.length}</span></h2>
    <ul className="divide-y divide-border">{players.map(p => <li key={p.id} className="flex items-center gap-3 py-3">
      {p.image ? <Image src={p.image} width={36} height={36} alt="" className="rounded-full" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bg font-bold" aria-hidden>{p.displayName[0]}</span>}
      <div className="min-w-0 flex-1"><p className="break-words font-medium">{p.displayName}</p><p className="text-xs text-muted">{p.claimed ? "A bordo" : "No ha entrado aún"}</p></div>
      {p.available !== undefined && <p className="text-right text-xs"><span className="text-success">{p.available} disponibles</span><br /><span className="text-muted">{p.locked ?? 0} bloqueadas</span></p>}
    </li>)}</ul>
  </section>;
}
