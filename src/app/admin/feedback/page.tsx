import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
export default async function AdminFeedbackPage() {
  await requireAdmin();
  const [feedback, aggregate] = await Promise.all([
    prisma.tripFeedback.findMany({ include: { trip: { select: { name: true } }, user: { select: { name: true } }, favoriteCard: { select: { name: true, emoji: true } } }, orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.tripFeedback.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
  ]);
  return <div className="space-y-6"><div><h1>Valoraciones</h1><p className="mt-2 text-sm text-ink-soft">{aggregate._count._all} valoraciones · nota media {aggregate._avg.rating ? aggregate._avg.rating.toFixed(1) : "—"} / 5</p></div>
    {feedback.length === 0 && <p className="panel text-sm text-muted">Todavía nadie ha valorado un viaje.</p>}
    <ul className="space-y-3">{feedback.map(item => <li key={item.id} className="panel space-y-2">
      <div className="flex flex-wrap justify-between gap-2"><span className="font-semibold">{item.trip.name}</span><span className="text-accent" aria-label={`${item.rating} de 5`}>{"★".repeat(item.rating)}<span className="text-border">{"★".repeat(5 - item.rating)}</span></span></div>
      <p className="text-sm text-ink-soft">{item.user.name ?? "Alguien"} · {formatDate(item.updatedAt)}{item.favoriteCard && ` · favorita: ${item.favoriteCard.emoji ?? ""} ${item.favoriteCard.name}`}</p>
      {item.comment && <p className="text-sm">{item.comment}</p>}
    </li>)}</ul>
  </div>;
}
