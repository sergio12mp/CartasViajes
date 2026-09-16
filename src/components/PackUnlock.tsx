"use client";
import { useActionState, useEffect } from "react";
import { startCheckout } from "@/app/actions/checkout";
import { initialActionState } from "@/lib/action-state";
import { formatEuros } from "@/lib/game/packs";
export function PackUnlock({ pack, tripId, stripeEnabled }: { pack: { id: string; priceTripCents: number; priceLifetimeCents: number }; tripId?: string; stripeEnabled: boolean }) {
  const [state, action, pending] = useActionState(startCheckout, initialActionState);
  useEffect(() => { if (state.ok && state.redirectTo) window.location.assign(state.redirectTo); }, [state]);
  if (!stripeEnabled) return <p className="text-sm text-muted">Pack premium. Los pagos se activarán muy pronto.</p>;
  return <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      {pack.priceTripCents > 0 && (tripId
        ? <form action={action}><input type="hidden" name="packId" value={pack.id} /><input type="hidden" name="scope" value="TRIP" /><input type="hidden" name="tripId" value={tripId} /><button className="btn-secondary" disabled={pending}>Solo este viaje · {formatEuros(pack.priceTripCents)}</button></form>
        : <span className="btn-secondary cursor-default opacity-70" title="Crea el viaje y desbloquéalo desde su configuración">Este viaje · {formatEuros(pack.priceTripCents)} (tras crearlo)</span>)}
      {pack.priceLifetimeCents > 0 && <form action={action}><input type="hidden" name="packId" value={pack.id} /><input type="hidden" name="scope" value="LIFETIME" /><input type="hidden" name="tripId" value={tripId ?? ""} /><button className="btn" disabled={pending}>Para siempre · {formatEuros(pack.priceLifetimeCents)}</button></form>}
    </div>
    {state.message && <p role="status" className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
  </div>;
}
