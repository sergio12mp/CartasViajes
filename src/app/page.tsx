import Link from "next/link";
import { auth, signIn } from "@/auth";
import { getTripsForUser } from "@/lib/trips";
import { TripCard } from "@/components/TripCard";
import { JoinCodeForm } from "@/components/JoinCodeForm";
export const dynamic = "force-dynamic";
export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  const { error } = await searchParams;
  if (!session?.user?.id) return <div className="space-y-8 py-5 sm:py-10">
    {error && <p role="alert" className="panel text-sm text-danger">No se pudo iniciar sesión. Comprueba el acceso de tu cuenta e inténtalo de nuevo.</p>}
    <section className="space-y-6"><p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Amigos · Viajes · Cartas</p><h1 className="max-w-xl text-5xl leading-[1.05] sm:text-6xl">El viaje se pone<br /><span className="text-primary">en juego.</span></h1>
      <p className="max-w-lg text-lg leading-relaxed text-ink-soft">Reúne a tu gente. Reparte las cartas.<br />Lanza un reto, prepara tu escudo y deja que el viaje haga el resto.</p>
      <form action={async () => { "use server"; await signIn("google"); }}><button className="btn">Entrar con Google →</button></form>
    </section>
    <div className="grid gap-3 sm:grid-cols-3">{[["01", "Prepara el viaje", "Elige las cartas y reúne a la tripulación."], ["02", "Juega tu mano", "Lanza un ataque o guarda una defensa."], ["03", "Que quede escrito", "Sigue cada jugada en el diario del viaje."]].map(([number, title, text]) => <article key={number} className="panel"><span className="text-sm font-bold text-primary">{number}</span><h2 className="mt-4 text-base">{title}</h2><p className="mt-2 text-sm text-ink-soft">{text}</p></article>)}</div>
    <p className="text-xs text-muted">Sin descargas. Solo un código, tu cuenta de Google y tus amigos.</p>
  </div>;
  const trips = await getTripsForUser(session.user.id);
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-1 text-sm text-muted">Tu próxima aventura</p><h1>Mis viajes</h1></div><Link className="btn" href="/trips/new">+ Crear viaje</Link></div>
    <JoinCodeForm />
    {trips.length ? <div className="grid gap-4 sm:grid-cols-2">{trips.map(trip => <TripCard key={trip.id} trip={trip} />)}</div> : <div className="panel space-y-2"><h2>Todo viaje empieza aquí</h2><p className="text-sm text-ink-soft">Crea uno para tus amigos o introduce el código que te hayan compartido.</p></div>}
  </div>;
}
