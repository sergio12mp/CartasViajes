import Link from "next/link";
import type { ReactNode } from "react";
import { legalDetailsComplete, legalReviewDate, siteOperator } from "@/lib/site-info";

export function InfoPage({ eyebrow, title, intro, legal = false, children }: {
  eyebrow: string; title: string; intro: string; legal?: boolean; children: ReactNode;
}) {
  return <article className="space-y-7">
    <header className="space-y-3 border-b border-border pb-7">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h1 className="text-3xl sm:text-4xl">{title}</h1>
      <p className="max-w-xl text-base leading-relaxed text-ink-soft">{intro}</p>
      {legal && <p className="text-xs text-muted">Última revisión: {legalReviewDate}</p>}
    </header>
    {legal && !legalDetailsComplete && <aside className="rounded-2xl border border-warning/30 bg-accent/10 p-4 text-sm leading-relaxed text-ink-soft"><p className="font-semibold text-ink">Información legal en preparación</p><p className="mt-1">Falta publicar la identificación y el contacto del titular. Este texto describe el servicio actual y deberá completarse con esos datos.</p></aside>}
    {children}
  </article>;
}

export function InfoSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-heading`} className="info-copy scroll-mt-36"><h2 id={`${id}-heading`}>{title}</h2>{children}</section>;
}

export function ContactEmail({ subject = "Consulta sobre Tripu" }: { subject?: string }) {
  return siteOperator.email
    ? <a href={`mailto:${siteOperator.email}?subject=${encodeURIComponent(subject)}`} className="break-words text-primary underline underline-offset-4">{siteOperator.email}</a>
    : <span>Correo de contacto pendiente de publicar. Consulta las actualizaciones en <Link href="/contacto" className="text-primary underline underline-offset-4">Contacto</Link>.</span>;
}
