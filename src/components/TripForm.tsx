"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CardPack } from "@prisma/client";
import type { CardTypeWithPack } from "@/lib/cards";
import { initialActionState, type FormAction } from "@/lib/action-state";
import { suggestSplit } from "@/lib/game/deal";
import { rarityBadgeClass, rarityLabels } from "@/lib/game/rarity";
import { DealRulesEditor } from "./DealRulesEditor";
import { PackUnlock } from "./PackUnlock";
export interface TripFormValues {
  tripId?: string; name: string; responseWindowMinutes: number; poolCardTypeIds: string[];
  legendariesPerPlayer: number; raresPerPlayer: number; commonsPerPlayer: number; dealByCategory: boolean; dealRules: Record<string, number>;
  players: { name: string; claimed: boolean }[];
}
export interface TripFormProps { cards: CardTypeWithPack[]; packs: CardPack[]; unlockedPackIds: string[]; stripeEnabled: boolean; action: FormAction; initialValues?: TripFormValues }
const clamp = (value: number, max: number) => Math.max(0, Math.min(max, Math.floor(Number.isFinite(value) ? value : 0)));
export function TripForm({ cards, packs, unlockedPackIds, stripeEnabled, action, initialValues }: TripFormProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const unlocked = new Set(unlockedPackIds);
  const isLocked = (card: CardTypeWithPack) => Boolean(card.pack && card.pack.isPremium && !unlocked.has(card.pack.id));
  const allowed = cards.filter(c => !isLocked(c));
  const [selected, setSelected] = useState(() => (initialValues?.poolCardTypeIds ?? allowed.map(c => c.id)).filter(id => allowed.some(c => c.id === id)));
  const [legendaries, setLegendaries] = useState(initialValues?.legendariesPerPlayer ?? 1);
  const [rares, setRares] = useState(initialValues?.raresPerPlayer ?? 2);
  const [commons, setCommons] = useState(initialValues?.commonsPerPlayer ?? 2);
  const [byCategory, setByCategory] = useState(initialValues?.dealByCategory ?? false);
  const [rules, setRules] = useState<Record<string, number>>(initialValues?.dealRules ?? { bebida: 2, reto: 2, social: 1, defensa: 2 });
  const [players, setPlayers] = useState(initialValues?.players ?? [{ name: "", claimed: false }, { name: "", claimed: false }]);
  const router = useRouter();
  useEffect(() => { if (state.ok && state.redirectTo) { router.push(state.redirectTo); router.refresh(); } }, [state, router]);
  const baseCards = cards.filter(c => !c.packId);
  const categories = [...new Set(baseCards.map(c => c.category))];
  const selectedCards = cards.filter(c => selected.includes(c.id));
  const nonLegendary = selectedCards.filter(c => c.rarity !== "LEGENDARY");
  const activeCategories = [...new Set(nonLegendary.map(c => c.category))];
  const legendariesInPool = selectedCards.filter(c => c.rarity === "LEGENDARY").length;
  const raresInPool = selectedCards.filter(c => c.rarity === "RARE").length;
  const commonsInPool = selectedCards.filter(c => c.rarity === "COMMON").length;
  const legendariesNeeded = players.length * legendaries;
  const restTotal = byCategory ? activeCategories.reduce((sum, c) => sum + (rules[c] ?? 0), 0) : rares + commons;
  const total = legendaries + restTotal;
  function toggle(ids: string[], checked: boolean) { setSelected(current => checked ? [...new Set([...current, ...ids])] : current.filter(id => !ids.includes(id))); }
  function autoSplit() { const split = suggestSplit(Math.max(total, legendaries + 1) - legendaries); setRares(split.rares); setCommons(split.commons); }
  function setTotal(value: number) { const split = suggestSplit(clamp(value, 200) - legendaries); setRares(split.rares); setCommons(split.commons); }
  const cardRow = (card: CardTypeWithPack, locked: boolean) => <label key={card.id} className={`flex items-start gap-3 rounded-xl border p-3 ${locked ? "border-border opacity-60" : selected.includes(card.id) ? "border-primary/30 bg-primary/5" : "border-border"}`}>
    {locked ? <span className="mt-1 shrink-0 text-base" aria-hidden>🔒</span> : <input type="checkbox" name="poolCardTypeIds[]" value={card.id} checked={selected.includes(card.id)} onChange={e => toggle([card.id], e.target.checked)} className="mt-1 shrink-0" />}
    <span><span className="flex flex-wrap items-center gap-2 font-semibold">{card.emoji} {card.name} <span className={rarityBadgeClass[card.rarity]}>{rarityLabels[card.rarity]}</span><span className="text-xs font-normal text-muted">· {card.kind === "ATTACK" ? "Ataque" : "Reacción"}</span></span><span className="mt-1 block text-xs font-normal text-ink-soft">{card.description}</span>{card.creditName && <span className="mt-1 block text-[10px] text-muted">Propuesta por {card.creditName}</span>}</span>
  </label>;
  const groupToggle = (group: CardTypeWithPack[]) => <label className="flex items-center gap-2"><input type="checkbox" checked={group.every(c => selected.includes(c.id))} onChange={e => toggle(group.map(c => c.id), e.target.checked)} />Seleccionar todo</label>;
  return <form action={formAction} className="space-y-5">
    {initialValues?.tripId && <input type="hidden" name="tripId" value={initialValues.tripId} />}
    <input type="hidden" name="dealRules" value={JSON.stringify(Object.fromEntries(activeCategories.map(c => [c, rules[c] ?? 0])))} />
    <section className="panel space-y-4"><h2>01 · El viaje</h2>
      <label className="block space-y-2"><span>Nombre del viaje</span><input name="name" required minLength={2} maxLength={60} defaultValue={initialValues?.name} placeholder="Un finde para recordar" /></label>
      <label className="block space-y-2"><span>Minutos para responder a un ataque</span><input type="number" name="responseWindowMinutes" required min={1} max={120} defaultValue={initialValues?.responseWindowMinutes ?? 10} /></label>
    </section>
    <section className="panel space-y-5"><div><h2>02 · Las cartas</h2><p className="mt-1 text-sm text-ink-soft">Elige qué tipos podrán salir en el reparto. Seleccionadas: {legendariesInPool} legendarias · {raresInPool} raras · {commonsInPool} comunes.</p></div>
      {cards.length === 0 && <p role="alert" className="text-danger">Todavía no hay cartas disponibles en el catálogo.</p>}
      {categories.map(category => { const group = baseCards.filter(c => c.category === category); return <fieldset key={category} className="space-y-3"><legend className="mb-2 font-bold capitalize">{category}</legend>{groupToggle(group)}{group.map(card => cardRow(card, false))}</fieldset>; })}
      {packs.map(pack => { const group = cards.filter(c => c.packId === pack.id); if (group.length === 0) return null; const locked = pack.isPremium && !unlocked.has(pack.id); return <fieldset key={pack.id} className={`space-y-3 rounded-2xl border-2 p-4 ${locked ? "border-accent/60 bg-accent/5" : "border-primary/20"}`}>
        <legend className="px-2 font-bold">{pack.emoji} {pack.name} <span className="badge ml-1">{!pack.isPremium ? "Gratis" : locked ? "Premium" : stripeEnabled ? "Desbloqueado" : "Premium · abierto en pruebas"}</span></legend>
        <p className="text-sm text-ink-soft">{pack.description}</p>
        {locked ? <PackUnlock pack={pack} tripId={initialValues?.tripId} stripeEnabled={stripeEnabled} /> : groupToggle(group)}
        {group.map(card => cardRow(card, locked))}
      </fieldset>; })}
    </section>
    <section className="panel space-y-5"><div><h2>03 · El reparto</h2><p className="mt-1 text-sm text-ink-soft">Cada jugador recibe sus legendarias (nunca se repiten en el viaje) y el resto se completa al azar.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2"><span>Cartas por jugador</span><input type="number" min={1} max={200} value={total} onChange={e => setTotal(Number(e.target.value))} aria-describedby="total-help" disabled={byCategory} /><span id="total-help" className="block text-xs text-muted">{byCategory ? "Con reparto por categoría, el total se calcula abajo." : "Al cambiarlo, raras y comunes se ajustan solas."}</span></label>
        <label className="block space-y-2"><span>Legendarias por jugador</span><input type="number" name="legendariesPerPlayer" min={0} max={10} value={legendaries} onChange={e => setLegendaries(clamp(Number(e.target.value), 10))} /></label>
      </div>
      <p className={`rounded-xl p-3 text-sm ${legendariesInPool >= legendariesNeeded ? "bg-bg" : "bg-accent/20 text-warning"}`}>{legendariesInPool} legendarias en el mazo · hacen falta {legendariesNeeded} ({players.length} jugadores × {legendaries}).{legendariesInPool < legendariesNeeded && ` Faltan ${legendariesNeeded - legendariesInPool}: se sortean y quien se quede sin una recibe 2 raras a cambio.`}</p>
      <label className="flex items-center gap-2"><input type="checkbox" name="dealByCategory" checked={byCategory} onChange={e => setByCategory(e.target.checked)} />Repartir por categoría</label>
      {byCategory ? <DealRulesEditor categories={activeCategories} rules={rules} onChange={(category, value) => setRules(current => ({ ...current, [category]: clamp(value, 100) }))} /> : <div className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2"><span>Raras por jugador</span><input type="number" name="raresPerPlayer" min={0} max={100} value={rares} onChange={e => setRares(clamp(Number(e.target.value), 100))} /></label>
          <label className="block space-y-2"><span>Comunes por jugador</span><input type="number" name="commonsPerPlayer" min={0} max={100} value={commons} onChange={e => setCommons(clamp(Number(e.target.value), 100))} /></label>
        </div>
        <button type="button" className="btn-secondary" onClick={autoSplit}>Ajustar automáticamente</button>
        <p className="rounded-xl bg-bg p-3 text-sm font-semibold">{total} cartas por jugador: {legendaries} legendarias · {rares} raras · {commons} comunes</p>
      </div>}
      {byCategory && <input type="hidden" name="raresPerPlayer" value={0} />}
      {byCategory && <input type="hidden" name="commonsPerPlayer" value={0} />}
    </section>
    <section className="panel space-y-4"><h2>04 · La tripulación</h2><p className="text-sm text-ink-soft">Incluye tu nombre. Cada persona lo reclamará al entrar.</p>
      {players.map((player, index) => <div key={index} className="flex items-center gap-2"><label className="flex-1"><span className="sr-only">Participante {index + 1}</span><input name="playerNames[]" required maxLength={30} value={player.name} readOnly={player.claimed} aria-label={`Participante ${index + 1}${player.claimed ? " (ya reclamado)" : ""}`} placeholder={`Nombre ${index + 1}`} onChange={e => setPlayers(current => current.map((p, i) => i === index ? { ...p, name: e.target.value } : p))} /></label>
        <button type="button" className="btn-secondary" aria-label={`Eliminar participante ${index + 1}`} disabled={players.length <= 2 || player.claimed} onClick={() => setPlayers(current => current.filter((_, i) => i !== index))}>×</button>
      </div>)}
      <button type="button" className="btn-secondary" disabled={players.length >= 30} onClick={() => setPlayers(current => [...current, { name: "", claimed: false }])}>+ Añadir participante</button>
    </section>
    {state.message && <p className={state.ok ? "text-success" : "text-danger"} role="status">{state.message}</p>}
    <button className="btn w-full" disabled={pending || cards.length === 0}>{pending ? "Guardando…" : initialValues ? "Guardar configuración" : "Crear viaje"}</button>
  </form>;
}
