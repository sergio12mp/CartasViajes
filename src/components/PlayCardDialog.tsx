"use client";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { playCard } from "@/app/actions/plays";
import { initialActionState } from "@/lib/action-state";
import type { HandCard } from "./CardTile";
export function PlayCardDialog({ card, tripId, targets, onClose }: { card: HandCard; tripId: string; targets: { id: string; displayName: string }[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(playCard, initialActionState);
  const router = useRouter();
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => { if (state.ok) { router.refresh(); onClose(); } }, [state, router, onClose]);
  return <dialog ref={dialog} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget && !pending) onClose(); }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-surface p-6 text-ink shadow-xl backdrop:bg-ink/50" aria-labelledby="play-title">
    <div className="mb-5 flex items-start justify-between gap-3"><h2 id="play-title">{card.cardType.emoji} {card.cardType.name}</h2><button type="button" onClick={onClose} disabled={pending} className="btn-secondary" aria-label="Cerrar">×</button></div>
    <p className="mb-5 text-sm text-ink-soft">{card.cardType.description}</p>
    <form action={action} className="space-y-4"><input type="hidden" name="tripId" value={tripId} /><input type="hidden" name="cardId" value={card.id} />
      <label className="block space-y-2"><span>¿A quién se la juegas?</span><select name="targetPlayerId" required defaultValue=""><option value="" disabled>Elige un objetivo</option>{targets.map(p => <option key={p.id} value={p.id}>{p.displayName}</option>)}</select></label>
      <p className="text-xs text-muted">La carta quedará marcada como usada en cuanto la juegues.</p>
      {state.message && <p role="status" className={state.ok ? "text-success" : "text-danger"}>{state.message}</p>}
      <button className="btn w-full" disabled={pending}>{pending ? "Jugando…" : "Jugar carta"}</button>
    </form>
  </dialog>;
}
