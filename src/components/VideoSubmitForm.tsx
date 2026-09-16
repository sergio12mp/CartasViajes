import { submitCommunityVideo } from "@/app/actions/videos";
import { StateForm } from "./StateForm";
export function VideoSubmitForm({ tripId, trips }: { tripId?: string; trips?: { id: string; name: string }[] }) {
  return <StateForm action={submitCommunityVideo} label="Enviar vídeo" pendingLabel="Enviando…" resetOnSuccess>
    <label className="block space-y-2"><span>Enlace del TikTok</span><input name="url" type="url" required maxLength={300} placeholder="https://www.tiktok.com/@usuario/video/…" /></label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block space-y-2"><span>Título (opcional)</span><input name="title" maxLength={80} placeholder="Noche de Hidalgos" /></label>
      <label className="block space-y-2"><span>Destino (opcional)</span><input name="destination" maxLength={60} placeholder="Cancún" /></label>
    </div>
    {tripId ? <input type="hidden" name="tripId" value={tripId} /> : trips && trips.length > 0 && <label className="block space-y-2"><span>Viaje (opcional)</span><select name="tripId" defaultValue=""><option value="">Sin viaje</option>{trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
    <p className="text-xs text-muted">Lo revisaremos antes de publicarlo. Etiqueta a @Tripu o usa #Tripu para que lo encontremos.</p>
  </StateForm>;
}
