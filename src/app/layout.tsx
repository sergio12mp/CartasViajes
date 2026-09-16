import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { AuthButtons } from "@/components/AuthButtons";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: { default: "Tripu", template: "%s · Tripu" },
  description: "El viaje se pone en juego. Un viaje, tus amigos y una mano de cartas.",
  icons: { icon: [{ url: "/favicon-32.png", sizes: "32x32" }, { url: "/icon-192.png", sizes: "192x192" }], apple: "/apple-icon.png" },
  openGraph: { title: "Tripu", description: "El viaje se pone en juego. Un viaje, tus amigos y una mano de cartas.", siteName: "Tripu", locale: "es_ES", type: "website" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body className="flex min-h-dvh flex-col">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-surface focus:p-3">Saltar al contenido</a>
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Tripu, inicio"><Image src="/brand/mark.png" alt="" width={32} height={33} priority /><Image src="/brand/wordmark.png" alt="Tripu" width={70} height={31} priority /></Link>
        <Suspense fallback={<div aria-hidden="true" className="loading-skeleton h-11 w-32 rounded-xl bg-border/40" />}><AuthButtons /></Suspense>
      </div>
      <Suspense fallback={<div aria-hidden="true" className="h-11" />}><SiteNav /></Suspense>
    </header>
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
    <SiteFooter />
  </body></html>;
}
