import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { setSuggestionStatus } from "@/app/actions/admin";
export default async function AdminSuggestionsPage() {
  await requireAdmin();
  const suggestions = await prisma.cardSuggestion.findMany({ include: { user: { select: { name: true } }, card: { select: { id: true, name: true } } }, orderBy: [{ status: "desc" }, { createdAt: "desc" }], take: 200 });
  const open = suggestions.filter(s => s.status === "NEW");
  const reviewed = suggestions.filter(s => s.status === "REVIEWED");
  const list = (items: typeof suggestions) => items.length === 0 ? <p className="text-sm text-muted">Nada por aquí.</p> : <ul className="space-y-3">{items.map(s => <li key={s.id} className="panel space-y-2">
    <div className="flex flex-wrap justify-between gap-2"><span className="font-semibold">{s.name} <span className="badge capitalize">{s.category}</span></span><time className="text-xs text-muted" dateTime={s.createdAt.toISOString()}>{formatDate(s.createdAt)}</time></div>
    <p className="text-sm">{s.description}</p>
    {s.comment && <p className="text-sm text-ink-soft">Comentario: {s.comment}</p>}
    <p className="text-xs text-muted">De {s.user.name ?? "alguien"}{s.creditName && ` · crédito: ${s.creditName}`}{s.card && ` · ya es la carta ${s.card.name}`}</p>
    <div className="flex flex-wrap gap-2">{!s.card && <Link href={`/admin/cards?fromSuggestion=${s.id}`} className="btn">Convertir en carta</Link>}<ActionForm action={setSuggestionStatus} fields={{ suggestionId: s.id, status: s.status === "NEW" ? "REVIEWED" : "NEW" }} label={s.status === "NEW" ? "Marcar como revisada" : "Reabrir"} secondary /></div>
  </li>)}</ul>;
  return <div className="space-y-6"><h1>Sugerencias de cartas</h1>
    <section className="space-y-3"><h2>Sin revisar <span className="text-muted">· {open.length}</span></h2>{list(open)}</section>
    <section className="space-y-3"><h2>Revisadas <span className="text-muted">· {reviewed.length}</span></h2>{list(reviewed)}</section>
  </div>;
}
