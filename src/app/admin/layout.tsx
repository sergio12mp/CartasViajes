import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
export const dynamic = "force-dynamic";
const sections = [["/admin", "Resumen"], ["/admin/cards", "Cartas"], ["/admin/videos", "Vídeos"], ["/admin/feedback", "Valoraciones"], ["/admin/sugerencias", "Sugerencias"], ["/admin/stats", "Estadísticas"]];
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Administración</p><nav aria-label="Administración" className="mt-2 flex flex-wrap gap-1">{sections.map(([href, label]) => <Link key={href} href={href} className="nav-link border border-border">{label}</Link>)}</nav></div>
    {children}
  </div>;
}
