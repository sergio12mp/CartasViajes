import type { CardType } from "@prisma/client";
import { CardTile } from "./CardTile";
import { rarityOrder, rarityPluralLabels } from "@/lib/game/rarity";
type Trip = { legendariesPerPlayer: number; raresPerPlayer: number; commonsPerPlayer: number; dealByCategory: boolean; dealRules: { category: string; cardsPerPlayer: number }[] };
export function dealSummary(trip: Trip) {
  const parts = [`${trip.legendariesPerPlayer} ${trip.legendariesPerPlayer === 1 ? "legendaria" : "legendarias"}`];
  if (trip.dealByCategory) parts.push(...trip.dealRules.map(rule => `${rule.cardsPerPlayer} de ${rule.category}`));
  else parts.push(`${trip.raresPerPlayer} ${trip.raresPerPlayer === 1 ? "rara" : "raras"}`, `${trip.commonsPerPlayer} ${trip.commonsPerPlayer === 1 ? "común" : "comunes"}`);
  const total = trip.legendariesPerPlayer + (trip.dealByCategory ? trip.dealRules.reduce((sum, r) => sum + r.cardsPerPlayer, 0) : trip.raresPerPlayer + trip.commonsPerPlayer);
  return { total, parts };
}
export function PoolPreview({ pool, trip, playerCount }: { pool: CardType[]; trip: Trip; playerCount: number }) {
  const { total, parts } = dealSummary(trip);
  const missing = Math.max(0, playerCount * trip.legendariesPerPlayer - pool.filter(c => c.rarity === "LEGENDARY").length);
  return <section className="panel space-y-5"><div><h2>Así se juega este viaje</h2><p className="mt-1 text-sm text-ink-soft">Cada participante recibe {total} cartas: {parts.join(" · ")}. Las legendarias no se repiten entre jugadores.{missing > 0 && ` Faltan ${missing} legendarias para todos: se sortean y quien se quede sin una recibe 2 raras a cambio.`} También repartiremos a quienes aún no hayan entrado.</p></div>
    {rarityOrder.map(rarity => { const cards = pool.filter(c => c.rarity === rarity); return cards.length > 0 && <div key={rarity} className="space-y-3"><h3 className="text-sm font-bold uppercase tracking-widest text-muted">{cards.length} {rarityPluralLabels[rarity]}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{cards.map(card => <CardTile key={card.id} mode="preview" card={{ id: card.id, status: "AVAILABLE", cardType: card }} />)}</div>
    </div>; })}
  </section>;
}
