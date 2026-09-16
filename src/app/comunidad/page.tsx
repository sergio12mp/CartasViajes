import { auth, signIn } from "@/auth";
import { getApprovedVideos, getVideosForUser } from "@/lib/videos";
import { getTripsForUser } from "@/lib/trips";
import { getCommunityCardTypes } from "@/lib/cards";
import { CardTile } from "@/components/CardTile";
import { formatDate } from "@/lib/format";
import { TikTokEmbed } from "@/components/TikTokEmbed";
import { VideoSubmitForm } from "@/components/VideoSubmitForm";
export const dynamic = "force-dynamic";
const statusLabels = { PENDING: "En revisión", APPROVED: "Publicado", REJECTED: "No publicado" };
export default async function CommunityPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [videos, mine, trips, communityCards] = await Promise.all([getApprovedVideos(), userId ? getVideosForUser(userId) : [], userId ? getTripsForUser(userId) : [], getCommunityCardTypes()]);
  const destinations = [...new Set(videos.map(v => v.destination).filter((d): d is string => Boolean(d)))];
  return <div className="space-y-8">
    <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Comunidad</p><h1 className="mt-2">Así se juega por el mundo</h1><p className="mt-2 text-ink-soft">TikToks de viajes jugando a Tripu. Etiqueta a @Tripu o usa #Tripu y envíanos el enlace.</p></div>
    <section className="panel space-y-4"><h2>Comparte tu vídeo</h2>
      {userId ? <VideoSubmitForm trips={trips.map(t => ({ id: t.id, name: t.name }))} /> : <form action={async () => { "use server"; await signIn("google", { redirectTo: "/comunidad" }); }}><p className="mb-3 text-sm text-ink-soft">Entra con tu cuenta para enviar un vídeo.</p><button className="btn">Entrar con Google</button></form>}
    </section>
    {destinations.length > 0 && <p className="flex flex-wrap gap-2 text-sm"><span className="text-muted">Destinos:</span>{destinations.map(d => <a key={d} href={`#destino-${encodeURIComponent(d)}`} className="badge">{d}</a>)}</p>}
    {videos.length === 0 ? <p className="panel text-sm text-muted">Todavía no hay vídeos publicados. ¡Sé el primero!</p> : <div className="grid gap-6 sm:grid-cols-2">{videos.map(video => <article key={video.id} id={video.destination ? `destino-${encodeURIComponent(video.destination)}` : undefined} className="panel space-y-3">
      <TikTokEmbed url={video.url} videoId={video.videoId} title={video.title} />
      <div className="space-y-1"><h2 className="text-base">{video.title ?? "Sin título"}</h2><p className="text-sm text-ink-soft">{[video.destination, video.trip?.name].filter(Boolean).join(" · ") || "Sin destino"}</p><p className="text-xs text-muted">Compartido por {video.submittedBy.name ?? "alguien"}</p></div>
    </article>)}</div>}
    {communityCards.length > 0 && <section className="space-y-4"><div><h2>Cartas creadas por la comunidad</h2><p className="mt-1 text-sm text-ink-soft">Propuestas desde <a href="/sugerencias" className="text-primary">Sugerencias</a> y ya en el catálogo.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{communityCards.map(card => <CardTile key={card.id} mode="preview" card={{ id: card.id, status: "AVAILABLE", cardType: card }} />)}</div></section>}
    {mine.length > 0 && <section className="space-y-3"><h2>Tus envíos</h2><ul className="space-y-2">{mine.map(v => <li key={v.id} className="panel flex flex-wrap justify-between gap-2 text-sm"><span><strong>{v.title ?? "Sin título"}</strong>{v.destination && ` · ${v.destination}`}<span className="block text-xs text-muted">{formatDate(v.createdAt)}</span></span><span className={`badge ${v.status === "APPROVED" ? "text-success" : v.status === "REJECTED" ? "text-danger" : "text-ink-soft"}`}>{statusLabels[v.status]}</span></li>)}</ul></section>}
  </div>;
}
