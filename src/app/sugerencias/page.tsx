import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getActiveCardTypes } from "@/lib/cards";
import { formatDate } from "@/lib/format";
import { StateForm } from "@/components/StateForm";
import { submitCardSuggestion } from "@/app/actions/suggestions";
import { SuggestionOptions } from "@/components/SuggestionOptions";
import { getCategoryPresentation } from "@/lib/card-categories";
import { rarityBadgeClass, rarityLabels } from "@/lib/game/rarity";
export const dynamic = "force-dynamic";
export default async function SuggestionsPage() {
  const user = await requireUser();
  const [mine, cards] = await Promise.all([
    prisma.cardSuggestion.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    getActiveCardTypes(),
  ]);
  const categories = [...new Set(cards.map(c => c.category))];
  return <div className="space-y-6"><div><h1>Sugiere una carta</h1><p className="mt-2 text-ink-soft">¿Se te ha ocurrido una carta durante el viaje? Cuéntanosla y la valoraremos para el catálogo.</p></div>
    <section className="panel"><StateForm action={submitCardSuggestion} label="Enviar sugerencia" pendingLabel="Enviando…" resetOnSuccess>
      <label className="block space-y-2"><span>Nombre de la carta</span><input name="name" required minLength={2} maxLength={60} placeholder="Karaoke sorpresa" /></label>
      <label className="block space-y-2"><span>¿Qué hace?</span><textarea name="description" required minLength={5} maxLength={500} rows={3} className="w-full rounded-xl border border-border bg-surface px-3 py-3" placeholder="Al aplicar esta carta sobre un jugador…" /></label>
      <SuggestionOptions categories={categories} />
      <label className="block space-y-2"><span>Comentario (opcional)</span><textarea name="comment" maxLength={500} rows={2} className="w-full rounded-xl border border-border bg-surface px-3 py-3" placeholder="Por qué funcionaría, en qué viaje se os ocurrió…" /></label>
      <label className="block space-y-2"><span>Nombre para el crédito</span><input name="creditName" maxLength={40} defaultValue={user.name ?? ""} placeholder="Como quieres aparecer en la carta" /><span className="block text-xs text-muted">Si la carta entra en el catálogo, aparecerá «Propuesta por» con este nombre.</span></label>
    </StateForm></section>
    {mine.length > 0 && <section className="space-y-3"><h2>Tus sugerencias</h2><ul className="space-y-3">{mine.map(s => <li key={s.id} className="panel space-y-2"><div className="flex flex-wrap justify-between gap-2"><span className="font-semibold">{s.name}</span><span className={`badge ${s.status === "REVIEWED" ? "text-success" : "text-ink-soft"}`}>{s.status === "REVIEWED" ? "Revisada" : "Pendiente"}</span></div><div className="flex flex-wrap items-center gap-2"><span className="badge">{getCategoryPresentation(s.category).emoji} {getCategoryPresentation(s.category).label}</span>{s.rarity ? <span className={rarityBadgeClass[s.rarity]}>{rarityLabels[s.rarity]}</span> : <span className="text-xs text-muted">Sin rareza propuesta</span>}</div><p className="text-sm text-ink-soft">{s.description}</p><p className="text-xs text-muted">{formatDate(s.createdAt)}</p></li>)}</ul></section>}
  </div>;
}
