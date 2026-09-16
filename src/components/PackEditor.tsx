"use client";
import { useState } from "react";
import type { CardPack } from "@prisma/client";
import { upsertPack } from "@/app/actions/packs";
import { slugify } from "@/lib/slug";
import { StateForm } from "./StateForm";
export function PackEditor({ pack }: { pack?: CardPack }) {
  const [id, setId] = useState(pack?.id ?? "");
  const [idTouched, setIdTouched] = useState(Boolean(pack));
  return <StateForm action={upsertPack} label={pack ? "Guardar pack" : "Crear pack"} resetOnSuccess={!pack} secondary={Boolean(pack)}>
    <input type="hidden" name="mode" value={pack ? "edit" : "create"} />
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-2"><span>Nombre</span><input name="name" required minLength={2} maxLength={60} defaultValue={pack?.name} onChange={e => { if (!idTouched) setId(slugify(e.target.value)); }} placeholder="Despedida de soltero" /></label>
      <label className="block space-y-2"><span>Identificador</span>{pack ? <><input type="hidden" name="id" value={pack.id} /><input value={pack.id} readOnly aria-label="Identificador" /></> : <input name="id" required pattern="[a-z0-9-]{2,60}" value={id} onChange={e => { setIdTouched(true); setId(e.target.value); }} />}</label>
    </div>
    <label className="block space-y-2"><span>Descripción</span><textarea name="description" required minLength={5} maxLength={300} rows={2} defaultValue={pack?.description} className="w-full rounded-xl border border-border bg-surface px-3 py-3" /></label>
    <div className="grid gap-4 sm:grid-cols-4">
      <label className="block space-y-2"><span>Emoji</span><input name="emoji" maxLength={8} defaultValue={pack?.emoji ?? ""} placeholder="🎉" /></label>
      <label className="block space-y-2"><span>Precio por viaje (€)</span><input name="priceTripCents" type="number" step="0.01" min={0} max={500} defaultValue={pack ? (pack.priceTripCents / 100).toFixed(2) : "2.99"} /></label>
      <label className="block space-y-2"><span>Precio para siempre (€)</span><input name="priceLifetimeCents" type="number" step="0.01" min={0} max={500} defaultValue={pack ? (pack.priceLifetimeCents / 100).toFixed(2) : "4.99"} /></label>
      <label className="block space-y-2"><span>Orden</span><input name="sortOrder" type="number" min={0} max={10000} defaultValue={pack?.sortOrder ?? 100} /></label>
    </div>
    <div className="flex flex-wrap gap-4">
      <label className="flex items-center gap-2"><input type="checkbox" name="isPremium" defaultChecked={pack?.isPremium ?? true} />De pago</label>
      <label className="flex items-center gap-2"><input type="checkbox" name="isActive" defaultChecked={pack?.isActive ?? true} />Visible en la creación de viajes</label>
    </div>
    <p className="text-xs text-muted">Un precio a 0 desactiva esa modalidad. Asigna cartas al pack desde el editor de cada carta.</p>
  </StateForm>;
}
