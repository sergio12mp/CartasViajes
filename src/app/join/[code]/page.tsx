import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { getTripByCode } from "@/lib/trips";
import { JoinPicker } from "@/components/JoinPicker";
import { AutoRefresh } from "@/components/AutoRefresh";
import { dealSummary } from "@/components/PoolPreview";
export const dynamic = "force-dynamic";
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.trim().toUpperCase();
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code)) return <div className="panel space-y-3"><h1>Código no válido</h1><Link href="/" className="text-primary">Volver al inicio</Link></div>;
  const session = await auth();
  const trip = await getTripByCode(code);
  if (!trip) return <section className="panel space-y-3"><h1>No encontramos ese viaje</h1><p>Comprueba el código de invitación.</p><Link href="/" className="text-primary">Volver al inicio</Link></section>;
  if (session?.user?.id && trip.players.some(p => p.userId === session.user!.id)) redirect(`/trips/${trip.id}`);
  if (trip.status === "FINISHED") return <section className="panel space-y-3"><h1>{trip.name}</h1><p>El viaje ha finalizado y ya no admite participantes.</p><Link href="/" className="text-primary">Volver al inicio</Link></section>;
  const players = trip.players.map(p => ({ id: p.id, displayName: p.displayName, claimed: Boolean(p.userId), image: p.user?.image }));
  const { total, parts } = dealSummary(trip);
  const claimed = players.filter(p => p.claimed).length;
  return <div className="space-y-6"><AutoRefresh />
    <div><p className="text-sm text-primary">Invitación · {code}</p><h1 className="break-words">{trip.name}</h1><p className="mt-2 text-ink-soft">{players.length} participantes · {claimed} a bordo · {trip._count.pool} tipos de carta</p></div>
    {!session?.user?.id && <section className="panel space-y-4"><h2>Te espera un viaje</h2><p className="text-sm text-ink-soft">Cada participante recibe {total} cartas ({parts.join(", ")}). Lanza retos a tus amigos, defiéndete con Escudo y deja que el viaje haga el resto.</p>
      <form action={async () => { "use server"; await signIn("google", { redirectTo: `/join/${code}` }); }}><button className="btn w-full">Entrar con Google y unirme →</button></form></section>}
    <JoinPicker tripId={trip.id} code={code} players={players} readOnly={!session?.user?.id} />
  </div>;
}
