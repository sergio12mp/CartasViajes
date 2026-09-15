import Link from "next/link";
export const statusLabels = { DRAFT: "Preparando", ACTIVE: "En juego", FINISHED: "Finalizado" };
export function TripCard({ trip }: { trip: { id: string; name: string; code: string; status: keyof typeof statusLabels; _count: { players: number }; players: { displayName: string }[] } }) {
  return <Link href={`/trips/${trip.id}`} className="panel block space-y-3 transition hover:border-primary">
    <div className="flex items-start justify-between gap-3"><h2>{trip.name}</h2><span className={`badge ${trip.status === "ACTIVE" ? "text-success" : "text-ink-soft"}`}>{statusLabels[trip.status]}</span></div>
    <p className="text-sm text-ink-soft">{trip._count.players} participantes · {trip.players[0]?.displayName ?? "Elige tu nombre"}</p>
    <div className="flex justify-between text-sm"><span className="font-mono tracking-widest">{trip.code}</span><span className="font-semibold text-primary">Abrir viaje →</span></div>
  </Link>;
}
