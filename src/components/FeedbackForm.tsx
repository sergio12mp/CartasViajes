"use client";
import { useState } from "react";
import { submitTripFeedback } from "@/app/actions/feedback";
import { StateForm } from "./StateForm";
type Existing = { rating: number; favoriteCardTypeId: string | null; comment: string | null } | null;
export function FeedbackForm({ tripId, pool, existing }: { tripId: string; pool: { id: string; name: string; emoji: string | null }[]; existing: Existing }) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  return <StateForm action={submitTripFeedback} label={existing ? "Actualizar valoración" : "Enviar valoración"}>
    <input type="hidden" name="tripId" value={tripId} />
    <input type="hidden" name="rating" value={rating} />
    <fieldset className="space-y-2"><legend className="text-sm font-medium">¿Qué nota le das al juego en este viaje?</legend>
      <div className="flex gap-2" role="radiogroup" aria-label="Nota del 1 al 5">{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} de 5`} onClick={() => setRating(value)} className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl ${rating >= value ? "border-accent bg-accent/30" : "border-border bg-surface"}`}>★</button>)}</div>
    </fieldset>
    <label className="block space-y-2"><span>Tu carta favorita</span><select name="favoriteCardTypeId" defaultValue={existing?.favoriteCardTypeId ?? ""}><option value="">Sin favorita</option>{pool.map(card => <option key={card.id} value={card.id}>{card.emoji} {card.name}</option>)}</select></label>
    <label className="block space-y-2"><span>¿Algo que contarnos? (opcional)</span><textarea name="comment" maxLength={500} rows={3} defaultValue={existing?.comment ?? ""} className="w-full rounded-xl border border-border bg-surface px-3 py-3" placeholder="Qué carta sobró, qué faltó, qué momento fue el mejor…" /></label>
  </StateForm>;
}
