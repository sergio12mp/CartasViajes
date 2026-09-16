"use client";
import { useCallback, useState } from "react";
import { CardTile, type HandCard } from "./CardTile";
import { PlayCardDialog } from "./PlayCardDialog";
import { TripuReminder } from "./TripuReminder";
export function Hand({ cards, tripId, targets }: { cards: HandCard[]; tripId: string; targets: { id: string; displayName: string }[] }) {
  const [selected, setSelected] = useState<HandCard | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const available = cards.filter(c => c.status === "AVAILABLE");
  const locked = cards.filter(c => c.status === "LOCKED");
  return <section className="space-y-4"><div className="flex items-baseline justify-between"><h2>Tu mano</h2><span className="text-sm text-muted">{available.length} disponibles</span></div>
    {available.length > 0 && <TripuReminder />}
    {available.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{available.map(card => <CardTile key={card.id} card={card} onPlay={() => setSelected(card)} />)}</div> : <p className="panel text-sm text-muted">Ya has jugado todas tus cartas. Sigue la partida en la actividad del viaje.</p>}
    {locked.length > 0 && <details className="panel"><summary className="cursor-pointer font-semibold">Cartas usadas · {locked.length}</summary><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{locked.map(card => <CardTile key={card.id} card={card} />)}</div></details>}
    {selected && <PlayCardDialog card={selected} tripId={tripId} targets={targets} onClose={close} />}
  </section>;
}
