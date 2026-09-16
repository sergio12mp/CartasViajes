import Link from "next/link";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
export async function SiteNav() {
  const session = await auth();
  const links = [["/", "Mis viajes"], ["/comunidad", "Comunidad"], ["/sugerencias", "Sugerencias"]];
  if (isAdmin(session?.user?.email)) links.push(["/admin", "Admin"]);
  return <nav aria-label="Secciones" className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 pb-2">{links.map(([href, label]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}</nav>;
}
