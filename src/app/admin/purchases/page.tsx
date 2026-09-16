import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatEuros } from "@/lib/game/packs";
import { formatDate } from "@/lib/format";
const statusLabels = { PENDING: "Pendiente", PAID: "Pagada", REFUNDED: "Reembolsada" };
export default async function AdminPurchasesPage() {
  await requireAdmin();
  const [purchases, totals] = await Promise.all([
    prisma.packPurchase.findMany({ include: { pack: { select: { name: true, emoji: true } }, user: { select: { name: true, email: true } }, trip: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.packPurchase.groupBy({ by: ["status"], _sum: { amountCents: true }, _count: { _all: true } }),
  ]);
  const paid = totals.find(t => t.status === "PAID");
  return <div className="space-y-6"><div><h1>Compras</h1><p className="mt-2 text-sm text-ink-soft">{paid?._count._all ?? 0} compras pagadas · {formatEuros(paid?._sum.amountCents ?? 0)} ingresados</p></div>
    {purchases.length === 0 && <p className="panel text-sm text-muted">Todavía no hay compras.</p>}
    <ul className="space-y-2">{purchases.map(p => <li key={p.id} className="panel flex flex-wrap items-center justify-between gap-2 text-sm">
      <span><strong>{p.pack.emoji} {p.pack.name}</strong> · {p.scope === "LIFETIME" ? "para siempre" : `viaje ${p.trip?.name ?? "eliminado"}`}<span className="block text-xs text-muted">{p.user.name ?? p.user.email ?? "usuario"} · {formatDate(p.createdAt)}{p.stripeSessionId.startsWith("manual-") && " · regalo"}</span></span>
      <span className="text-right"><span className={`badge ${p.status === "PAID" ? "text-success" : p.status === "REFUNDED" ? "text-danger" : "text-ink-soft"}`}>{statusLabels[p.status]}</span><span className="block text-xs">{formatEuros(p.amountCents)}</span></span>
    </li>)}</ul>
  </div>;
}
