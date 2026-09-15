import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { getTripByCode } from "@/lib/trips";
import { JoinPicker } from "@/components/JoinPicker";
import { AutoRefresh } from "@/components/AutoRefresh";
export const dynamic = "force-dynamic";
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.trim().toUpperCase();
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code)) return <div className="panel space-y-3"><h1>Código no válido</h1><Link href="/" className="text-primary">Volver al inicio</Link></div>;
  const session = await auth();
  if (!session?.user?.id) return <section className="panel space-y-4"><h1>Te espera un viaje</h1><p className="text-ink-soft">Entra con Google para elegir tu nombre y unirte.</p><form action={async () => { "use server"; await signIn("google", { redirectTo: `/join/${code}` }); }}><button className="btn">Entrar y unirme</button></form></section>;
  const trip = await getTripByCode(code);
  if (!trip) return <section className="panel space-y-3"><h1>No encontramos ese viaje</h1><p>Comprueba el código de invitación.</p><Link href="/" className="text-primary">Volver al inicio</Link></section>;
  if (trip.players.some(p => p.userId === session.user.id)) redirect(`/trips/${trip.id}`);
  if (trip.status === "FINISHED") return <section className="panel space-y-3"><h1>{trip.name}</h1><p>El viaje ha finalizado y ya no admite participantes.</p><Link href="/" className="text-primary">Volver al inicio</Link></section>;
  return <div className="space-y-6"><AutoRefresh /><p className="text-sm text-primary">Invitación · {code}</p><h1>{trip.name}</h1><JoinPicker tripId={trip.id} code={code} players={trip.players.map(p => ({ id: p.id, displayName: p.displayName, claimed: Boolean(p.userId), image: p.user?.image }))} /></div>;
}
