import Link from "next/link";
import { informationLinks, legalLinks } from "@/lib/site-info";

export function SiteFooter() {
  return <footer className="mt-auto border-t border-border bg-surface">
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <div className="grid gap-7 sm:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-2"><Link href="/" className="text-xl font-bold tracking-tight">Tripu<span className="text-primary">.</span></Link><p className="max-w-56 text-sm leading-relaxed text-ink-soft">Buenas cartas.<br />Mejores historias juntos.</p></div>
        {[{ title: "A bordo", links: informationLinks }, { title: "Las cosas claras", links: legalLinks }].map(group => <nav key={group.title} aria-label={group.title}>
          <h2 className="mb-3 text-xs uppercase tracking-widest text-muted">{group.title}</h2>
          <ul className="space-y-1">{group.links.map(link => <li key={link.href}><Link href={link.href} className="inline-flex min-h-9 items-center text-sm text-ink-soft underline-offset-4 hover:text-primary hover:underline">{link.label}</Link></li>)}</ul>
        </nav>)}
      </div>
      <p className="mt-7 border-t border-border pt-4 text-xs leading-relaxed text-muted">El mejor plan es que todo el mundo se lo pase bien. Jugad a vuestro ritmo.</p>
    </div>
  </footer>;
}
