import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthButtons } from "@/components/AuthButtons";
import { SiteNav } from "@/components/SiteNav";
export const metadata: Metadata = { title: "CartasViajes", description: "Un viaje, tus amigos y una mano de cartas.", icons: { icon: "/icon-192.png", apple: "/apple-icon.png" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur"><div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3"><Link href="/" className="font-bold tracking-tight">🃏 CartasViajes</Link><AuthButtons /></div><SiteNav /></header><main className="mx-auto max-w-3xl px-4 py-8">{children}</main></body></html>;
}
