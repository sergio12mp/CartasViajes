import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { groupByCategory } from "@/lib/cards";
import { rarityBadgeClass, rarityLabels } from "@/lib/game/rarity";
import { CardEditor } from "@/components/CardEditor";
import { ActionForm } from "@/components/ActionForm";
import { setCardTypeActive } from "@/app/actions/admin";
export default async function AdminCardsPage({ searchParams }: { searchParams: Promise<{ fromSuggestion?: string }> }) {
  await requireAdmin();
  const { fromSuggestion } = await searchParams;
  const [cards, packs, suggestion] = await Promise.all([
    prisma.cardType.findMany({ include: { packs: { include: { pack: { select: { id: true, name: true, emoji: true } } } } }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
    prisma.cardPack.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    fromSuggestion ? prisma.cardSuggestion.findUnique({ where: { id: fromSuggestion } }) : null,
  ]);
  const groups = groupByCategory(cards);
  const categories = Object.keys(groups);
  return <div className="space-y-6"><div><h1>Cartas del catálogo</h1><p className="mt-2 text-sm text-ink-soft">{cards.length} cartas. Retirar una carta la oculta en viajes nuevos; las manos ya repartidas la conservan. Las cartas base también viven en <code>prisma/card-catalog.ts</code>: si las editas aquí, refleja el cambio allí para que el próximo seed no lo pise.</p></div>
    <section className="panel space-y-4"><h2>{suggestion ? `Nueva carta a partir de la sugerencia de ${suggestion.creditName ?? "la comunidad"}` : "Nueva carta"}</h2>{suggestion && <p className="text-sm text-ink-soft">Revisa el texto y ajusta rareza, tipo y pack. Al guardar, la sugerencia quedará marcada como revisada.</p>}<CardEditor key={suggestion?.id ?? "new"} categories={categories} packs={packs} draft={suggestion ? { name: suggestion.name, description: suggestion.description, category: suggestion.category, creditName: suggestion.creditName, suggestionId: suggestion.id } : undefined} /></section>
    {categories.map(category => <section key={category} className="space-y-3"><h2 className="capitalize">{category} <span className="text-muted">· {groups[category].length}</span></h2>
      {groups[category].map(card => <details key={card.id} className={`panel ${card.isActive ? "" : "opacity-60"}`}><summary className="flex cursor-pointer flex-wrap items-center gap-2"><span className="text-xl" aria-hidden>{card.emoji ?? "🃏"}</span><span className="font-semibold">{card.name}</span><span className={rarityBadgeClass[card.rarity]}>{rarityLabels[card.rarity]}</span>{card.packs.map(p => <span key={p.packId} className="badge">{p.pack.emoji} {p.pack.name}</span>)}{card.creditName && <span className="text-xs text-muted">por {card.creditName}</span>}<span className="text-xs text-muted">{card.kind === "ATTACK" ? "Ataque" : "Reacción"} · {card.id}</span>{!card.isActive && <span className="badge text-danger">Retirada</span>}</summary>
        <div className="mt-4 space-y-4"><CardEditor card={card} categories={categories} packs={packs} packIds={card.packs.map(p => p.packId)} />
          <ActionForm action={setCardTypeActive} fields={{ id: card.id, isActive: String(!card.isActive) }} label={card.isActive ? "Retirar del catálogo" : "Volver a activar"} secondary confirmMessage={card.isActive ? `¿Retirar ${card.name} de los viajes nuevos?` : undefined} />
        </div>
      </details>)}
    </section>)}
  </div>;
}
