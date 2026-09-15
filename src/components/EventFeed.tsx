import type { TripEvent } from "@prisma/client";
export function EventFeed({ events }: { events: TripEvent[] }) {
  const now = Date.now();
  const relative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  return <section className="panel space-y-4"><h2>Diario del viaje</h2>{events.length === 0 ? <p className="text-sm text-muted">Las aventuras empiezan aquí.</p> : <ol className="space-y-4">{events.map(event => {
    const minutes = Math.round((event.createdAt.getTime() - now) / 60_000);
    const label = Math.abs(minutes) < 60 ? relative.format(minutes, "minute") : Math.abs(minutes) < 1440 ? relative.format(Math.round(minutes / 60), "hour") : relative.format(Math.round(minutes / 1440), "day");
    return <li key={event.id} className="border-l-2 border-accent pl-3"><p className="text-sm leading-relaxed">{event.message}</p><time dateTime={event.createdAt.toISOString()} className="mt-1 block text-xs text-muted">{label}</time></li>;
  })}</ol>}</section>;
}
