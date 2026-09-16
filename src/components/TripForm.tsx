"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CardPack } from "@prisma/client";
import type { CardTypeWithPacks } from "@/lib/cards";
import { initialActionState, type FormAction } from "@/lib/action-state";
import { suggestSplit } from "@/lib/game/deal";
import { rarityBadgeClass, rarityLabels } from "@/lib/game/rarity";
import { DealRulesEditor } from "./DealRulesEditor";
import { PackUnlock } from "./PackUnlock";
export interface TripFormValues {
  tripId?: string; name: string; responseWindowMinutes: number; poolCardTypeIds: string[]; packId: string | null;
  legendariesPerPlayer: number; raresPerPlayer: number; commonsPerPlayer: number; dealByCategory: boolean; dealRules: Record<string, number>;
  players: { name: string; claimed: boolean }[];
}
export interface TripFormProps { cards: CardTypeWithPacks[]; packs: CardPack[]; unlockedPackIds: string[]; stripeEnabled: boolean; action: FormAction; initialValues?: TripFormValues }
const clamp = (value: number, max: number) => Math.max(0, Math.min(max, Math.floor(Number.isFinite(value) ? value : 0)));
export function TripForm({ cards, packs, unlockedPackIds, stripeEnabled, action, initialValues }: TripFormProps) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const unlocked = new Set(unlockedPackIds);
  const isLocked = (card: CardTypeWithPacks) => card.packs.length > 0 && !card.packs.some(p => unlocked.has(p.packId));
  const packLocked = (pack: CardPack) => pack.isPremium && !unlocked.has(pack.id);
  const packCards = (packId: string) => cards.filter(c => c.packs.some(p => p.packId === packId)).sort((a, b) => (a.packs.find(p => p.packId === packId)?.sortOrder ?? 0) - (b.packs.find(p => p.packId === packId)?.sortOrder ?? 0));
  const allowed = cards.filter(c => !isLocked(c));
  const [mode, setMode] = useState<"pack" | "manual">(initialValues && !initialValues.packId ? "manual" : "pack");
  const [packId, setPackId] = useState<string | null>(initialValues?.packId ?? null);
  const [selected, setSelected] = useState(() => (initialValues?.poolCardTypeIds ?? allowed.map(c => c.id)).filter(id => allowed.some(c => c.id === id)));
  const [minutes, setMinutes] = useState(initialValues?.responseWindowMinutes ?? 10);
  const [legendaries, setLegendaries] = useState(initialValues?.legendariesPerPlayer ?? 1);
  const [rares, setRares] = useState(initialValues?.raresPerPlayer ?? 2);
  const [commons, setCommons] = useState(initialValues?.commonsPerPlayer ?? 2);
  const [byCategory, setByCategory] = useState(initialValues?.dealByCategory ?? false);
  const [rules, setRules] = useState<Record<string, number>>(initialValues?.dealRules ?? { bebida: 2, reto: 2, social: 1, defensa: 2 });
  const [players, setPlayers] = useState(initialValues?.players ?? [{ name: "", claimed: false }, { name: "", claimed: false }]);
  const router = useRouter();
  useEffect(() => { if (state.ok && state.redirectTo) { router.push(state.redirectTo); router.refresh(); } }, [state, router]);
  const pack = packs.find(p => p.id === packId) ?? null;
  const poolIds = mode === "pack" && pack ? packCards(pack.id).filter(c => !isLocked(c)).map(c => c.id) : selected;
  const selectedCards = cards.filter(c => poolIds.includes(c.id));
  const nonLegendary = selectedCards.filter(c => c.rarity !== "LEGENDARY");
  const activeCategories = [...new Set(nonLegendary.map(c => c.category))];
  const legendariesInPool = selectedCards.filter(c => c.rarity === "LEGENDARY").length;
  const raresInPool = selectedCards.filter(c => c.rarity === "RARE").length;
  const commonsInPool = selectedCards.filter(c => c.rarity === "COMMON").length;
  const legendariesNeeded = players.length * legendaries;
  const categoryMode = mode === "manual" && byCategory;
  const restTotal = categoryMode ? activeCategories.reduce((sum, c) => sum + (rules[c] ?? 0), 0) : rares + commons;
  const total = legendaries + restTotal;
  function choosePack(next: CardPack) {
    setPackId(next.id); setMinutes(next.responseWindowMinutes); setLegendaries(next.legendariesPerPlayer); setRares(next.raresPerPlayer); setCommons(next.commonsPerPlayer);
  }
  function toggle(ids: string[], checked: boolean) { setSelected(current => checked ? [...new Set([...current, ...ids])] : current.filter(id => !ids.includes(id))); }
  function autoSplit() { const split = suggestSplit(Math.max(total, legendaries + 1) - legendaries); setRares(split.rares); setCommons(split.commons); }
  function setTotal(value: number) { const split = suggestSplit(clamp(value, 200) - legendaries); setRares(split.rares); setCommons(split.commons); }
  const categories = [...new Set(cards.map(c => c.category))];
  const cardRow = (card: CardTypeWithPacks) => { const locked = isLocked(card); return <label key={card.id} className={`flex items-start gap-3 rounded-xl border p-3 ${locked ? "border-border opacity-60" : selected.includes(card.id) ? "border-primary/30 bg-primary/5" : "border-border"}`}>
    {locked ? <span className="mt-1 shrink-0 text-base" aria-hidden>🔒</span> : <input type="checkbox" name="poolCardTypeIds[]" value={card.id} checked={selected.includes(card.id)} onChange={e => toggle([card.id], e.target.checked)} className="mt-1 shrink-0" />}
    <span><span className="flex flex-wrap items-center gap-2 font-semibold">{card.emoji} {card.name} <span className={rarityBadgeClass[card.rarity]}>{rarityLabels[card.rarity]}</span><span className="text-xs font-normal text-muted">· {card.kind === "ATTACK" ? "Ataque" : "Reacción"}</span>{card.packs.map(p => <span key={p.packId} className="badge text-[10px]">{p.pack.emoji} {p.pack.name}</span>)}</span><span className="mt-1 block text-xs font-normal text-ink-soft">{card.description}</span>{card.creditName && <span className="mt-1 block text-[10px] text-muted">Propuesta por {card.creditName}</span>}</span>
  </label>; };
  const dealSection = <section className="panel space-y-5"><div><h2>{mode === "pack" ? "03 · Ajusta el reparto" : "03 · El reparto"}</h2><p className="mt-1 text-sm text-ink-soft">{mode === "pack" ? "El pack propone un reparto; cámbialo si quieres más o menos cartas." : "Cada jugador recibe sus legendarias (nunca se repiten en el viaje) y el resto se completa al azar."}</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-2"><span>Cartas por jugador</span><input type="number" min={1} max={200} value={total} onChange={e => setTotal(Number(e.target.value))} aria-describedby="total-help" disabled={categoryMode} /><span id="total-help" className="block text-xs text-muted">{categoryMode ? "Con reparto por categoría, el total se calcula abajo." : "Al cambiarlo, raras y comunes se ajustan solas."}</span></label>
      <label className="block space-y-2"><span>Legendarias por jugador</span><input type="number" name="legendariesPerPlayer" min={0} max={10} value={legendaries} onChange={e => setLegendaries(clamp(Number(e.target.value), 10))} /></label>
    </div>
    <p className={`rounded-xl p-3 text-sm ${legendariesInPool >= legendariesNeeded ? "bg-bg" : "bg-accent/20 text-warning"}`}>{legendariesInPool} legendarias en el mazo · hacen falta {legendariesNeeded} ({players.length} jugadores × {legendaries}).{legendariesInPool < legendariesNeeded && ` Faltan ${legendariesNeeded - legendariesInPool}: se sortean y quien se quede sin una recibe 2 raras a cambio.`}</p>
    {mode === "manual" && <label className="flex items-center gap-2"><input type="checkbox" name="dealByCategory" checked={byCategory} onChange={e => setByCategory(e.target.checked)} />Repartir por categoría</label>}
    {categoryMode ? <DealRulesEditor categories={activeCategories} rules={rules} onChange={(category, value) => setRules(current => ({ ...current, [category]: clamp(value, 100) }))} /> : <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2"><span>Raras por jugador</span><input type="number" name="raresPerPlayer" min={0} max={100} value={rares} onChange={e => setRares(clamp(Number(e.target.value), 100))} /></label>
        <label className="block space-y-2"><span>Comunes por jugador</span><input type="number" name="commonsPerPlayer" min={0} max={100} value={commons} onChange={e => setCommons(clamp(Number(e.target.value), 100))} /></label>
      </div>
      <button type="button" className="btn-secondary" onClick={autoSplit}>Ajustar automáticamente</button>
      <p className="rounded-xl bg-bg p-3 text-sm font-semibold">{total} cartas por jugador: {legendaries} legendarias · {rares} raras · {commons} comunes</p>
    </div>}
    {categoryMode && <input type="hidden" name="raresPerPlayer" value={0} />}
    {categoryMode && <input type="hidden" name="commonsPerPlayer" value={0} />}
  </section>;
  return <form action={formAction} className="space-y-5">
    {initialValues?.tripId && <input type="hidden" name="tripId" value={initialValues.tripId} />}
    <input type="hidden" name="dealRules" value={JSON.stringify(Object.fromEntries(activeCategories.map(c => [c, rules[c] ?? 0])))} />
    {mode === "pack" && pack && <><input type="hidden" name="packId" value={pack.id} />{poolIds.map(id => <input key={id} type="hidden" name="poolCardTypeIds[]" value={id} />)}</>}
    <section className="panel space-y-4"><h2>01 · El viaje</h2>
      <label className="block space-y-2"><span>Nombre del viaje</span><input name="name" required minLength={2} maxLength={60} defaultValue={initialValues?.name} placeholder="Un finde para recordar" /></label>
      <label className="block space-y-2"><span>Minutos para responder a un ataque</span><input type="number" name="responseWindowMinutes" required min={1} max={120} value={minutes} onChange={e => setMinutes(clamp(Number(e.target.value), 120) || 1)} /></label>
    </section>
    <section className="panel space-y-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2>02 · Las cartas</h2><p className="mt-1 text-sm text-ink-soft">{mode === "pack" ? "Elige un pack y listo: sus cartas y su reparto vienen preparados." : `Elige carta a carta. Seleccionadas: ${legendariesInPool} legendarias · ${raresInPool} raras · ${commonsInPool} comunes.`}</p></div>
      <div className="flex rounded-xl border border-border p-1 text-sm" role="tablist"><button type="button" role="tab" aria-selected={mode === "pack"} className={`rounded-lg px-3 py-1.5 font-semibold ${mode === "pack" ? "bg-primary text-white" : "text-ink-soft"}`} onClick={() => setMode("pack")}>Packs</button><button type="button" role="tab" aria-selected={mode === "manual"} className={`rounded-lg px-3 py-1.5 font-semibold ${mode === "manual" ? "bg-primary text-white" : "text-ink-soft"}`} onClick={() => { setMode("manual"); if (pack) setSelected(poolIds); }}>Modo manual</button></div></div>
      {cards.length === 0 && <p role="alert" className="text-danger">Todavía no hay cartas disponibles en el catálogo.</p>}
      {mode === "pack" && <>
        <div className="grid gap-3 sm:grid-cols-2">{packs.map(p => { const group = packCards(p.id); const locked = packLocked(p); const active = packId === p.id; return <button type="button" key={p.id} onClick={() => choosePack(p)} disabled={locked} aria-pressed={active} className={`flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition ${active ? "border-primary bg-primary/5" : locked ? "border-border opacity-60" : "border-border hover:border-primary/50"}`}>
          <span className="flex items-center justify-between gap-2"><span className="text-2xl" aria-hidden>{p.emoji}</span><span className="badge">{!p.isPremium ? "Gratis" : locked ? "🔒 Premium" : stripeEnabled ? "Desbloqueado" : "Premium · abierto en pruebas"}</span></span>
          <span className="font-bold">{p.name}</span><span className="text-xs text-ink-soft">{p.description}</span>
          <span className="text-xs text-muted">{group.length} cartas · {group.filter(c => c.rarity === "LEGENDARY").length} legendarias · {p.legendariesPerPlayer + p.raresPerPlayer + p.commonsPerPlayer} por jugador</span>
        </button>; })}</div>
        {pack && packLocked(pack) && <PackUnlock pack={pack} tripId={initialValues?.tripId} stripeEnabled={stripeEnabled} />}
        {pack ? <details className="rounded-xl border border-border p-3"><summary className="cursor-pointer text-sm font-semibold">Ver las {poolIds.length} cartas de {pack.name}</summary><ul className="mt-3 space-y-2 text-sm">{packCards(pack.id).map(c => <li key={c.id} className="flex flex-wrap items-center gap-2"><span>{c.emoji} {c.name}</span><span className={rarityBadgeClass[c.rarity]}>{rarityLabels[c.rarity]}</span><span className="text-xs text-ink-soft">{c.description}</span></li>)}</ul></details> : <p role="status" className="rounded-xl bg-accent/20 p-3 text-sm text-warning">Elige un pack para continuar, o pasa al modo manual.</p>}
      </>}
      {mode === "manual" && <>
        <div className="flex flex-wrap gap-2">{packs.filter(p => !packLocked(p)).map(p => { const ids = packCards(p.id).map(c => c.id); const all = ids.length > 0 && ids.every(id => selected.includes(id)); return <button type="button" key={p.id} className="btn-secondary text-xs" onClick={() => toggle(ids, !all)}>{all ? "− Quitar" : "+ Añadir"} {p.emoji} {p.name}</button>; })}</div>
        {categories.map(category => { const group = cards.filter(c => c.category === category); const free = group.filter(c => !isLocked(c)); return <fieldset key={category} className="space-y-3"><legend className="mb-2 font-bold capitalize">{category}</legend>
          {free.length > 0 && <label className="flex items-center gap-2"><input type="checkbox" checked={free.every(c => selected.includes(c.id))} onChange={e => toggle(free.map(c => c.id), e.target.checked)} />Seleccionar toda la categoría</label>}
          {group.map(cardRow)}
        </fieldset>; })}
        {packs.filter(packLocked).map(p => <div key={p.id} className="rounded-2xl border-2 border-accent/60 bg-accent/5 p-4"><p className="font-bold">{p.emoji} {p.name} <span className="badge ml-1">🔒 Premium</span></p><p className="mb-3 text-sm text-ink-soft">{p.description}</p><PackUnlock pack={p} tripId={initialValues?.tripId} stripeEnabled={stripeEnabled} /></div>)}
      </>}
    </section>
    {dealSection}
    <section className="panel space-y-4"><h2>04 · La tripulación</h2><p className="text-sm text-ink-soft">Incluye tu nombre. Cada persona lo reclamará al entrar.</p>
      {players.map((player, index) => <div key={index} className="flex items-center gap-2"><label className="flex-1"><span className="sr-only">Participante {index + 1}</span><input name="playerNames[]" required maxLength={30} value={player.name} readOnly={player.claimed} aria-label={`Participante ${index + 1}${player.claimed ? " (ya reclamado)" : ""}`} placeholder={`Nombre ${index + 1}`} onChange={e => setPlayers(current => current.map((p, i) => i === index ? { ...p, name: e.target.value } : p))} /></label>
        <button type="button" className="btn-secondary" aria-label={`Eliminar participante ${index + 1}`} disabled={players.length <= 2 || player.claimed} onClick={() => setPlayers(current => current.filter((_, i) => i !== index))}>×</button>
      </div>)}
      <button type="button" className="btn-secondary" disabled={players.length >= 30} onClick={() => setPlayers(current => [...current, { name: "", claimed: false }])}>+ Añadir participante</button>
    </section>
    {state.message && <p className={state.ok ? "text-success" : "text-danger"} role="status">{state.message}</p>}
    <button className="btn w-full" disabled={pending || cards.length === 0 || (mode === "pack" && !pack)}>{pending ? "Guardando…" : initialValues ? "Guardar configuración" : "Crear viaje"}</button>
  </form>;
}
