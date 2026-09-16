import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { prisma } from "@/lib/db";
export default async function AdminHome() {
  await requireAdmin();
  const [cards, inactive, pendingVideos, approvedVideos, newSuggestions, feedback, trips] = await Promise.all([
    prisma.cardType.count({ where: { isActive: true } }), prisma.cardType.count({ where: { isActive: false } }),
    prisma.communityVideo.count({ where: { status: "PENDING" } }), prisma.communityVideo.count({ where: { status: "APPROVED" } }),
    prisma.cardSuggestion.count({ where: { status: "NEW" } }), prisma.tripFeedback.count(), prisma.trip.count(),
  ]);
  const tiles = [
    ["/admin/cards", "Cartas", `${cards} activas · ${inactive} retiradas`], ["/admin/videos", "Vídeos", `${pendingVideos} pendientes · ${approvedVideos} publicados`],
    ["/admin/sugerencias", "Sugerencias", `${newSuggestions} sin revisar`], ["/admin/feedback", "Valoraciones", `${feedback} recibidas`], ["/admin/stats", "Estadísticas", `${trips} viajes creados`],
  ];
  return <div className="space-y-6"><h1>Panel de administración</h1>
    <div className="grid gap-3 sm:grid-cols-2">{tiles.map(([href, title, text]) => <Link key={href} href={href} className="panel block transition hover:border-primary"><h2>{title}</h2><p className="mt-2 text-sm text-ink-soft">{text}</p></Link>)}</div>
  </div>;
}
