import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatEuros } from "@/lib/game/packs";
import { PackEditor } from "@/components/PackEditor";
import { StateForm } from "@/components/StateForm";
import { grantPack } from "@/app/actions/packs";
export default async function AdminPacksPage() {
  await requireAdmin();
  const packs = await prisma.cardPack.findMany({ include: { _count: { select: { cards: true, purchases: { where: { status: "PAID" } } } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return <div className="space-y-6"><div><h1>Packs de cartas</h1><p className="mt-2 text-sm text-ink-soft">Los packs agrupan cartas temáticas. Los premium se desbloquean por viaje o para siempre mediante Stripe; también puedes regalarlos a un correo.</p></div>
    <section className="panel space-y-4"><h2>Nuevo pack</h2><PackEditor /></section>
    {packs.map(pack => <details key={pack.id} className={`panel ${pack.isActive ? "" : "opacity-60"}`}><summary className="flex cursor-pointer flex-wrap items-center gap-2"><span className="text-xl" aria-hidden>{pack.emoji ?? "🎁"}</span><span className="font-semibold">{pack.name}</span><span className="badge">{pack.isPremium ? `${formatEuros(pack.priceTripCents)} / ${formatEuros(pack.priceLifetimeCents)}` : "Gratis"}</span><span className="text-xs text-muted">{pack._count.cards} cartas · {pack._count.purchases} compras · {pack.id}</span></summary>
      <div className="mt-4 space-y-5"><PackEditor pack={pack} />
        {pack.isPremium && <div className="border-t border-border pt-4"><StateForm action={grantPack} label="Regalar para siempre" secondary resetOnSuccess className="flex flex-wrap items-end gap-3"><input type="hidden" name="packId" value={pack.id} /><label className="block flex-1 space-y-2"><span>Correo del usuario</span><input name="email" type="email" required placeholder="amigo@gmail.com" /></label></StateForm></div>}
      </div>
    </details>)}
  </div>;
}
