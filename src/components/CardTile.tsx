"use client";
export type HandCard = { id: string; status: "AVAILABLE" | "LOCKED"; cardType: { name: string; description: string; category: string; kind: "ATTACK" | "REACTION"; emoji: string | null } };
export function CardTile({ card, onPlay }: { card: HandCard; onPlay?: () => void }) {
  const locked = card.status === "LOCKED";
  const content = <><div className="flex items-center justify-between gap-2"><span className="text-3xl" aria-hidden>{card.cardType.emoji ?? "🃏"}</span><span className="text-[10px] font-bold uppercase tracking-widest">{locked ? "🔒 Usada" : card.cardType.kind === "ATTACK" ? "Ataque" : "Reacción"}</span></div>
    <div className="space-y-2"><p className="text-[10px] capitalize text-muted">{card.cardType.category}</p><p className="text-base font-bold leading-tight">{card.cardType.name}</p><p className="text-xs leading-relaxed">{card.cardType.description}</p></div>
    <p className="mt-auto pt-2 text-[11px] font-semibold">{locked ? "Carta bloqueada" : card.cardType.kind === "ATTACK" ? "Toca para jugar ↗" : "Se usa cuando te ataquen"}</p></>;
  const style = `flex min-h-56 w-full flex-col gap-4 rounded-2xl border p-4 text-left ${locked ? "border-border bg-border/30 text-muted grayscale" : card.cardType.kind === "ATTACK" ? "border-primary/30 bg-primary/5 text-ink" : "border-success/30 bg-success/5 text-ink"}`;
  return onPlay && !locked && card.cardType.kind === "ATTACK" ? <button className={`${style} transition hover:-translate-y-1 hover:border-primary`} onClick={onPlay}>{content}</button> : <article className={style}>{content}</article>;
}
