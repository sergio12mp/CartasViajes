import { requireAdmin } from "@/lib/admin";
import { getCardStats, getGrowthStats } from "@/lib/stats";
import { rarityBadgeClass, rarityLabels } from "@/lib/game/rarity";
import { formatEuros } from "@/lib/game/packs";
const pct = (value: number | null) => value === null ? "—" : `${Math.round(value * 100)} %`;
export default async function AdminStatsPage() {
  await requireAdmin();
  const [{ cards, trips, feedback, catalog }, growth] = await Promise.all([getCardStats(), getGrowthStats()]);
  const { metrics } = growth;
  const kpis = [
    ["K-factor", metrics.kFactor === null ? "—" : metrics.kFactor.toFixed(2), `${metrics.converted} de ${metrics.invited} invitados crean un viaje en 60 días · objetivo > 0,5`, metrics.kFactor !== null && metrics.kFactor >= 0.5],
    ["Activación", pct(metrics.activationRate), `${metrics.activated} de ${metrics.tripsConsidered} viajes llegan a jugarse con ≥ 3 a bordo`, metrics.activationRate !== null && metrics.activationRate >= 0.5],
    ["Profundidad", metrics.playsPerPlayer === null ? "—" : metrics.playsPerPlayer.toFixed(1), `cartas jugadas por jugador en ${metrics.finishedTrips} viajes finalizados · objetivo ≥ 2`, metrics.playsPerPlayer !== null && metrics.playsPerPlayer >= 2],
    ["Compartición", pct(metrics.shareRate), `${metrics.sharedTrips} viajes finalizados compartieron el resumen · ${growth.shares.INVITE ?? 0} invitaciones y ${growth.shares.CARD ?? 0} tarjetas compartidas`, metrics.shareRate !== null && metrics.shareRate >= 0.3],
  ] as const;
  const name = (id: string) => { const card = catalog.get(id); return card ? `${card.emoji ?? ""} ${card.name}`.trim() : id; };
  const played = cards.filter(c => c.played > 0);
  const reactions = cards.filter(c => c.usedAsReaction > 0);
  const never = [...catalog.values()].filter(c => c.isActive && !cards.some(s => s.cardTypeId === c.id && (s.played > 0 || s.usedAsReaction > 0)));
  return <div className="space-y-6"><div><h1>Estadísticas de uso</h1><p className="mt-2 text-sm text-ink-soft">{trips.FINISHED ?? 0} viajes finalizados · {trips.ACTIVE ?? 0} en juego · {trips.DRAFT ?? 0} preparándose · {feedback.count} valoraciones{feedback.averageRating ? ` (media ${feedback.averageRating.toFixed(1)}/5)` : ""}</p></div>
    <section className="grid gap-3 sm:grid-cols-2">{kpis.map(([title, value, text, ok]) => <article key={title} className="panel"><p className="text-xs font-bold uppercase tracking-widest text-muted">{title}</p><p className={`mt-2 text-3xl font-bold ${ok ? "text-success" : "text-ink"}`}>{value}</p><p className="mt-1 text-xs text-ink-soft">{text}</p></article>)}</section>
    <section className="panel space-y-3"><h2>Ingresos <span className="text-muted">· {formatEuros(growth.totalRevenueCents)}</span></h2>
      {growth.revenue.length === 0 ? <p className="text-sm text-muted">Todavía no hay compras pagadas.</p> : <ul className="space-y-2 text-sm">{growth.revenue.map(r => <li key={`${r.packId}-${r.scope}`} className="flex justify-between gap-3 border-b border-border/60 pb-2"><span>{r.pack?.emoji} {r.pack?.name ?? r.packId} · {r.scope === "LIFETIME" ? "para siempre" : "por viaje"}</span><strong>{r._count._all} × · {formatEuros(r._sum.amountCents ?? 0)}</strong></li>)}</ul>}
    </section>
    <section className="panel space-y-3"><h2>Cartas más jugadas</h2>
      {played.length === 0 ? <p className="text-sm text-muted">Aún no se ha jugado ninguna carta.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border text-xs uppercase tracking-wide text-muted"><th className="py-2 pr-3">Carta</th><th className="py-2 pr-3">Jugadas</th><th className="py-2 pr-3">Aceptadas</th><th className="py-2 pr-3">Expiradas</th><th className="py-2 pr-3">Bloqueadas</th><th className="py-2 pr-3">Devueltas</th><th className="py-2 pr-3">Favorita</th><th className="py-2">Respondida con</th></tr></thead>
        <tbody>{played.map(s => <tr key={s.cardTypeId} className="border-b border-border/60"><td className="py-2 pr-3"><span className="font-semibold">{name(s.cardTypeId)}</span>{s.card && <> <span className={rarityBadgeClass[s.card.rarity]}>{rarityLabels[s.card.rarity]}</span></>}</td><td className="py-2 pr-3">{s.played}</td><td className="py-2 pr-3">{s.accepted}</td><td className="py-2 pr-3">{s.expired}</td><td className="py-2 pr-3">{s.blocked}</td><td className="py-2 pr-3">{s.reflected}</td><td className="py-2 pr-3">{s.favorites}</td><td className="py-2 text-xs text-ink-soft">{Object.entries(s.reactions).map(([id, n]) => `${name(id)} ×${n}`).join(", ") || "—"}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="panel space-y-3"><h2>Reacciones usadas</h2>
      {reactions.length === 0 ? <p className="text-sm text-muted">Nadie ha usado una reacción todavía.</p> : <ul className="space-y-2 text-sm">{reactions.map(s => <li key={s.cardTypeId} className="flex justify-between gap-3 border-b border-border/60 pb-2"><span>{name(s.cardTypeId)}</span><strong>{s.usedAsReaction} veces</strong></li>)}</ul>}
    </section>
    <section className="panel space-y-3"><h2>Cartas favoritas</h2>
      {cards.some(c => c.favorites > 0) ? <ul className="space-y-2 text-sm">{cards.filter(c => c.favorites > 0).sort((a, b) => b.favorites - a.favorites).map(s => <li key={s.cardTypeId} className="flex justify-between gap-3 border-b border-border/60 pb-2"><span>{name(s.cardTypeId)}</span><strong>{s.favorites} votos</strong></li>)}</ul> : <p className="text-sm text-muted">Aún no hay favoritas.</p>}
    </section>
    <section className="panel space-y-3"><h2>Cartas activas sin usar <span className="text-muted">· {never.length}</span></h2>
      {never.length === 0 ? <p className="text-sm text-muted">Todas las cartas activas se han usado alguna vez.</p> : <ul className="flex flex-wrap gap-2">{never.map(c => <li key={c.id} className="badge">{c.emoji} {c.name}</li>)}</ul>}
    </section>
  </div>;
}
