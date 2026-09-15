"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CardType } from "@prisma/client";
import { initialActionState, type FormAction } from "@/lib/action-state";
import { DealRulesEditor } from "./DealRulesEditor";
export interface TripFormValues { tripId?: string; name: string; responseWindowMinutes: number; poolCardTypeIds: string[]; dealRules: Record<string, number>; players: { name: string; claimed: boolean }[] }
export function TripForm({ cards, action, initialValues }: { cards: CardType[]; action: FormAction; initialValues?: TripFormValues }) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [selected, setSelected] = useState(initialValues?.poolCardTypeIds ?? cards.map(c => c.id));
  const [rules, setRules] = useState<Record<string, number>>(initialValues?.dealRules ?? { bebida: 2, reto: 2, social: 1, defensa: 2 });
  const [players, setPlayers] = useState(initialValues?.players ?? [{ name: "", claimed: false }, { name: "", claimed: false }]);
  const router = useRouter();
  useEffect(() => { if (state.ok && state.redirectTo) { router.push(state.redirectTo); router.refresh(); } }, [state, router]);
  const categories = [...new Set(cards.map(c => c.category))];
  const activeCategories = categories.filter(category => cards.some(c => c.category === category && selected.includes(c.id)));
  function toggle(ids: string[], checked: boolean) { setSelected(current => checked ? [...new Set([...current, ...ids])] : current.filter(id => !ids.includes(id))); }
  return <form action={formAction} className="space-y-5">
    {initialValues?.tripId && <input type="hidden" name="tripId" value={initialValues.tripId} />}
    <input type="hidden" name="dealRules" value={JSON.stringify(Object.fromEntries(activeCategories.map(c => [c, rules[c] ?? 0])))} />
    <section className="panel space-y-4"><h2>01 · El viaje</h2>
      <label className="block space-y-2"><span>Nombre del viaje</span><input name="name" required minLength={2} maxLength={60} defaultValue={initialValues?.name} placeholder="Un finde para recordar" /></label>
      <label className="block space-y-2"><span>Minutos para responder a un ataque</span><input type="number" name="responseWindowMinutes" required min={1} max={120} defaultValue={initialValues?.responseWindowMinutes ?? 10} /></label>
    </section>
    <section className="panel space-y-5"><div><h2>02 · Las cartas</h2><p className="mt-1 text-sm text-ink-soft">Elige qué tipos podrán salir en el reparto.</p></div>
      {cards.length === 0 && <p role="alert" className="text-danger">Todavía no hay cartas disponibles en el catálogo.</p>}
      {categories.map(category => { const group = cards.filter(c => c.category === category); return <fieldset key={category} className="space-y-3"><legend className="mb-2 font-bold capitalize">{category}</legend>
        <label className="flex items-center gap-2"><input type="checkbox" checked={group.every(c => selected.includes(c.id))} onChange={e => toggle(group.map(c => c.id), e.target.checked)} />Seleccionar toda la categoría</label>
        {group.map(card => <label key={card.id} className={`flex items-start gap-3 rounded-xl border p-3 ${selected.includes(card.id) ? "border-primary/30 bg-primary/5" : "border-border"}`}>
          <input type="checkbox" name="poolCardTypeIds[]" value={card.id} checked={selected.includes(card.id)} onChange={e => toggle([card.id], e.target.checked)} className="mt-1 shrink-0" />
          <span><span className="block font-semibold">{card.emoji} {card.name} <span className="text-xs font-normal text-muted">· {card.kind === "ATTACK" ? "Ataque" : "Reacción"}</span></span><span className="mt-1 block text-xs font-normal text-ink-soft">{card.description}</span></span>
        </label>)}
      </fieldset>; })}
    </section>
    <section className="panel space-y-4"><h2>03 · El reparto</h2><DealRulesEditor categories={activeCategories} rules={rules} onChange={(category, value) => setRules(current => ({ ...current, [category]: value }))} /></section>
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
