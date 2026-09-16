"use client";
import { useState } from "react";
import type { CardPack, CardType } from "@prisma/client";
import { upsertCardType } from "@/app/actions/admin";
import { slugify } from "@/lib/slug";
import { rarityLabels, type RarityKey } from "@/lib/game/rarity";
import { StateForm } from "./StateForm";
const textarea = "w-full rounded-xl border border-border bg-surface px-3 py-3";
export type CardDraft = { name?: string; description?: string; category?: string; creditName?: string | null; suggestionId?: string | null };
export function CardEditor({ card, categories, packs, packIds = [], draft }: { card?: CardType; categories: string[]; packs: CardPack[]; packIds?: string[]; draft?: CardDraft }) {
  const [kind, setKind] = useState<"ATTACK" | "REACTION">(card?.kind ?? "ATTACK");
  const [id, setId] = useState(card?.id ?? slugify(draft?.name ?? ""));
  const [idTouched, setIdTouched] = useState(Boolean(card));
  return <StateForm action={upsertCardType} label={card ? "Guardar carta" : "Crear carta"} resetOnSuccess={!card} secondary={Boolean(card)}>
    <input type="hidden" name="mode" value={card ? "edit" : "create"} />
    {(draft?.suggestionId ?? card?.suggestionId) && <input type="hidden" name="suggestionId" value={draft?.suggestionId ?? card?.suggestionId ?? ""} />}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-2"><span>Nombre</span><input name="name" required minLength={2} maxLength={60} defaultValue={card?.name ?? draft?.name} onChange={e => { if (!idTouched) setId(slugify(e.target.value)); }} /></label>
      <label className="block space-y-2"><span>Identificador</span>{card ? <><input type="hidden" name="id" value={card.id} /><input value={card.id} readOnly aria-label="Identificador" /></> : <input name="id" required pattern="[a-z0-9-]{2,60}" value={id} onChange={e => { setIdTouched(true); setId(e.target.value); }} placeholder="se-genera-del-nombre" />}</label>
    </div>
    <label className="block space-y-2"><span>Descripción</span><textarea name="description" required minLength={5} maxLength={500} rows={3} defaultValue={card?.description ?? draft?.description} className={textarea} /></label>
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="block space-y-2"><span>Tipo</span><select name="kind" value={kind} onChange={e => setKind(e.target.value as "ATTACK" | "REACTION")}><option value="ATTACK">Ataque</option><option value="REACTION">Reacción</option></select></label>
      <label className="block space-y-2"><span>Efecto de reacción</span><select name="reactionEffect" defaultValue={card?.reactionEffect ?? ""} disabled={kind !== "REACTION"}><option value="">Ninguno</option><option value="BLOCK">Bloquear</option><option value="REFLECT">Devolver</option></select></label>
      <label className="block space-y-2"><span>Rareza</span><select name="rarity" defaultValue={card?.rarity ?? "COMMON"}>{(Object.keys(rarityLabels) as RarityKey[]).map(r => <option key={r} value={r}>{rarityLabels[r]}</option>)}</select></label>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="block space-y-2"><span>Categoría</span><input name="category" required list="card-categories" pattern="[a-zA-Z0-9-]{2,60}" defaultValue={card?.category ?? draft?.category} placeholder="reto" /><datalist id="card-categories">{categories.map(c => <option key={c} value={c} />)}</datalist></label>
      <label className="block space-y-2"><span>Emoji</span><input name="emoji" maxLength={8} defaultValue={card?.emoji ?? ""} placeholder="🎤" /></label>
      <label className="block space-y-2"><span>Orden</span><input name="sortOrder" type="number" min={0} max={10000} defaultValue={card?.sortOrder ?? 100} /></label>
    </div>
    <fieldset className="space-y-2"><legend className="text-sm font-medium">Packs en los que aparece</legend><div className="flex flex-wrap gap-3">{packs.map(p => <label key={p.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"><input type="checkbox" name="packIds[]" value={p.id} defaultChecked={packIds.includes(p.id)} />{p.emoji} {p.name}{p.isPremium && <span className="text-xs text-muted">· premium</span>}</label>)}</div><p className="text-xs text-muted">Sin ningún pack, la carta solo aparece en el modo manual y es gratis.</p></fieldset>
    <label className="block space-y-2"><span>Crédito (propuesta por)</span><input name="creditName" maxLength={40} defaultValue={card?.creditName ?? draft?.creditName ?? ""} placeholder="Nombre de quien la propuso" /></label>
    <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={card?.isActive ?? true} />Disponible para nuevos viajes</label>
  </StateForm>;
}
