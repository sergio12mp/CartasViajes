import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { videoInclude } from "@/lib/videos";
import { formatDate } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { TikTokEmbed } from "@/components/TikTokEmbed";
import { deleteVideo, reviewVideo } from "@/app/actions/admin";
export default async function AdminVideosPage() {
  await requireAdmin();
  const videos = await prisma.communityVideo.findMany({ include: videoInclude, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 200 });
  const groups = [["PENDING", "Pendientes de revisar"], ["APPROVED", "Publicados"], ["REJECTED", "Rechazados"]] as const;
  return <div className="space-y-6"><h1>Vídeos de la comunidad</h1>
    {groups.map(([status, title]) => { const list = videos.filter(v => v.status === status); return <section key={status} className="space-y-3"><h2>{title} <span className="text-muted">· {list.length}</span></h2>
      {list.length === 0 && <p className="text-sm text-muted">Nada por aquí.</p>}
      {list.map(video => <article key={video.id} className="panel space-y-3">
        <div className="flex flex-wrap justify-between gap-2 text-sm"><span><strong>{video.title ?? "Sin título"}</strong>{video.destination && ` · ${video.destination}`}{video.trip && ` · ${video.trip.name}`}</span><time className="text-xs text-muted" dateTime={video.createdAt.toISOString()}>{formatDate(video.createdAt)}</time></div>
        <p className="text-xs text-muted">Enviado por {video.submittedBy.name ?? "alguien"} · <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary">{video.url}</a></p>
        {status === "PENDING" && <TikTokEmbed url={video.url} videoId={video.videoId} title={video.title} />}
        <div className="flex flex-wrap gap-2">
          {status !== "APPROVED" && <ActionForm action={reviewVideo} fields={{ videoId: video.id, status: "APPROVED" }} label="Aprobar y publicar" />}
          {status !== "REJECTED" && <ActionForm action={reviewVideo} fields={{ videoId: video.id, status: "REJECTED" }} label="Rechazar" secondary />}
          {status !== "PENDING" && <ActionForm action={reviewVideo} fields={{ videoId: video.id, status: "PENDING" }} label="Devolver a pendientes" secondary />}
          <ActionForm action={deleteVideo} fields={{ videoId: video.id }} label="Eliminar" secondary confirmMessage="¿Eliminar este vídeo definitivamente?" />
        </div>
      </article>)}
    </section>; })}
  </div>;
}
