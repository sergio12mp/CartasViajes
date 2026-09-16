import Link from "next/link";
import type { ReactNode } from "react";
import { legalContentReviewed, legalReviewDate, siteOperator } from "@/lib/site-info";

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
    {legal && !legalContentReviewed && <p className="text-sm text-muted">Información en revisión. <Link href="/privacidad#revision" className="text-primary underline underline-offset-4">Consulta los puntos pendientes de privacidad.</Link></p>}
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
