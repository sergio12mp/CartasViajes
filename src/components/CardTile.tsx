"use client";
import { rarityBadgeClass, rarityClass, rarityLabels, type RarityKey } from "@/lib/game/rarity";
export type CardTypeView = { name: string; description: string; category: string; kind: "ATTACK" | "REACTION"; rarity: RarityKey; emoji: string | null };
export type HandCard = { id: string; status: "AVAILABLE" | "LOCKED"; cardType: CardTypeView };
export function CardTile({ card, onPlay, mode = "hand" }: { card: HandCard; onPlay?: () => void; mode?: "hand" | "preview" }) {
  const used = mode === "hand" && card.status === "LOCKED";
  const { cardType } = card;
  const content = <><div className="flex items-center justify-between gap-2"><span className="text-3xl" aria-hidden>{cardType.emoji ?? "🃏"}</span><span className="text-[10px] font-bold uppercase tracking-widest">{used ? "🔒 Usada" : cardType.kind === "ATTACK" ? "Ataque" : "Reacción"}</span></div>
    <div className="space-y-2"><div className="flex flex-wrap items-center gap-2"><span className={rarityBadgeClass[cardType.rarity]}>{rarityLabels[cardType.rarity]}</span><span className="text-[10px] capitalize text-muted">{cardType.category}</span></div><p className="text-base font-bold leading-tight">{cardType.name}</p><p className="text-xs leading-relaxed">{cardType.description}</p></div>
    {mode === "hand" && <p className="mt-auto pt-2 text-[11px] font-semibold">{used ? "Carta usada" : cardType.kind === "ATTACK" ? "Toca para jugar ↗" : "Se usa cuando te ataquen"}</p>}</>;
  const style = `flex min-h-56 w-full flex-col gap-4 rounded-2xl p-4 text-left ${rarityClass[cardType.rarity]} ${used ? "bg-border/30 text-muted grayscale" : cardType.kind === "ATTACK" ? "bg-primary/5 text-ink" : "bg-success/5 text-ink"}`;
  return onPlay && !used && cardType.kind === "ATTACK" ? <button className={`${style} transition hover:-translate-y-1`} onClick={onPlay}>{content}</button> : <article className={style}>{content}</article>;
}
