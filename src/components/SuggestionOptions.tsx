"use client";

import { useEffect, useRef, useState } from "react";
import { getCategoryPresentation } from "@/lib/card-categories";
import { rarityBadgeClass, rarityClass, rarityLabels, type RarityKey } from "@/lib/game/rarity";

const rarities: { value: RarityKey; description: string }[] = [
  { value: "COMMON", description: "Una carta para los momentos habituales del viaje." },
  { value: "RARE", description: "Una carta especial para sorprender al grupo." },
  { value: "LEGENDARY", description: "Una carta excepcional para un momento memorable." },
];

export function SuggestionOptions({ categories }: { categories: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [custom, setCustom] = useState(false);
  const options = [...new Set(categories)].map(value => ({ value, ...getCategoryPresentation(value) }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  useEffect(() => {
    const form = root.current?.closest("form");
    const reset = () => setCustom(false);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, []);

  return <div ref={root} className="space-y-5">
    <div className="space-y-2">
      <label htmlFor="suggestion-category">Categoría</label>
      <select id="suggestion-category" name={custom ? undefined : "category"} required defaultValue="" onChange={event => setCustom(event.target.value === "__custom__")} aria-describedby="suggestion-category-help">
        <option value="" disabled>Elige el tema de tu carta</option>
        {options.map(option => <option key={option.value} value={option.value}>{option.emoji} {option.label}</option>)}
        <option value="__custom__">＋ Otra categoría…</option>
      </select>
      <p id="suggestion-category-help" className="text-xs text-muted">Elige una categoría de la colección o propón una nueva.</p>
      {custom && <label className="block space-y-2 pt-2"><span>Tu nueva categoría</span><input name="category" required minLength={2} maxLength={60} placeholder="Por ejemplo: naturaleza" /></label>}
    </div>
    <fieldset className="space-y-3" aria-describedby="suggestion-rarity-help">
      <legend className="text-sm font-medium">Rareza propuesta</legend>
      <div className="grid gap-3 sm:grid-cols-3">{rarities.map(({ value, description }) => <label key={value} className="relative cursor-pointer">
        <input type="radio" name="rarity" value={value} required className="peer sr-only" />
        <span className={`flex h-full flex-col gap-2 rounded-xl bg-surface p-4 ${rarityClass[value]} peer-checked:bg-accent/15 peer-checked:outline-2 peer-checked:outline-offset-2 peer-checked:outline-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-4`}>
          <span className={`${rarityBadgeClass[value]} w-fit`}>{rarityLabels[value]}</span>
          <span className="text-xs font-normal leading-relaxed text-ink-soft">{description}</span>
        </span>
      </label>)}</div>
      <p id="suggestion-rarity-help" className="text-xs text-muted">Tu elección nos orienta. La rareza final se decide al revisar la carta.</p>
    </fieldset>
  </div>;
}
