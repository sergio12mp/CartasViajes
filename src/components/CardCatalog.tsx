"use client";

import { useState } from "react";
import { CardTile } from "@/components/CardTile";
import { rarityLabels } from "@/lib/game/rarity";
import type { PublicCard } from "@/lib/public-cards";

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function CardCatalog({ cards }: { cards: PublicCard[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [rarity, setRarity] = useState("");
  const [kind, setKind] = useState("");
  const [pack, setPack] = useState("");
  const categories = [...new Set(cards.map(card => card.category))].sort((a, b) => a.localeCompare(b, "es"));
  const packs = [...new Map(cards.flatMap(card => card.packs.map(({ pack }) => [pack.id, pack] as const))).values()]
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
  const search = normalizeSearch(query);
  const filtered = cards.filter(card => (!category || card.category === category)
    && (!rarity || card.rarity === rarity)
    && (!kind || card.kind === kind)
    && (!pack || card.packs.some(item => item.pack.id === pack))
    && (!search || normalizeSearch([card.name, card.description, card.category, ...card.packs.map(item => item.pack.name)].join(" ")).includes(search)));
  const hasFilters = Boolean(query || category || rarity || kind || pack);

  function clearFilters() {
    setQuery(""); setCategory(""); setRarity(""); setKind(""); setPack("");
  }

  if (cards.length === 0) return <section className="panel space-y-2"><h2>El catálogo se está preparando</h2><p className="text-sm text-ink-soft">Todavía no hay cartas publicadas. Vuelve pronto para descubrirlas.</p></section>;

  return <div className="space-y-5">
    <section aria-label="Filtrar la colección" className="panel space-y-4">
      <label className="block space-y-2"><span>Buscar cartas</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre, descripción o pack…" aria-controls="catalog-results" /></label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="min-w-0 space-y-2"><span>Categoría</span><select value={category} onChange={event => setCategory(event.target.value)} aria-controls="catalog-results"><option value="">Todas</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="min-w-0 space-y-2"><span>Rareza</span><select value={rarity} onChange={event => setRarity(event.target.value)} aria-controls="catalog-results"><option value="">Todas</option>{Object.entries(rarityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="min-w-0 space-y-2"><span>Tipo</span><select value={kind} onChange={event => setKind(event.target.value)} aria-controls="catalog-results"><option value="">Todos</option><option value="ATTACK">Ataque</option><option value="REACTION">Reacción</option></select></label>
        <label className="min-w-0 space-y-2"><span>Pack</span><select value={pack} onChange={event => setPack(event.target.value)} aria-controls="catalog-results"><option value="">Todos</option>{packs.map(item => <option key={item.id} value={item.id}>{item.emoji} {item.name}</option>)}</select></label>
      </div>
      {hasFilters && <button type="button" className="btn-secondary" onClick={clearFilters}>Limpiar filtros</button>}
    </section>
    <p role="status" aria-atomic="true" className="text-sm text-ink-soft">Mostrando {filtered.length} de {cards.length} cartas</p>
    <div id="catalog-results">
      {filtered.length ? <div className="grid gap-4 min-[380px]:grid-cols-2 sm:grid-cols-3">{filtered.map(card => <div key={card.id} className="flex min-w-0 flex-col gap-2 break-words">
        <CardTile mode="preview" card={{ id: card.id, status: "AVAILABLE", cardType: card }} />
        {card.packs.length > 0 && <ul aria-label={`Packs de ${card.name}`} className="flex flex-wrap gap-1">{card.packs.map(({ pack }) => <li key={pack.id} className="badge text-[11px]">{pack.emoji} {pack.name}</li>)}</ul>}
      </div>)}</div> : <div className="panel space-y-3"><h2 className="text-lg">No hay cartas con estos filtros</h2><p className="text-sm text-ink-soft">Prueba otro nombre o amplía la selección para descubrir más cartas.</p><button type="button" className="btn-secondary" onClick={clearFilters}>Ver todas las cartas</button></div>}
    </div>
  </div>;
}
