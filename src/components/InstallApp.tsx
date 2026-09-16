"use client";

import Image from "next/image";
import Link from "next/link";
import { useInstall } from "@/components/InstallProvider";

export function InstallApp({ guide = false }: { guide?: boolean }) {
  const { ready, mobile, installed, available, busy, message, install } = useInstall();
  if (!ready || !mobile || (!guide && installed)) return null;

  return <section aria-label="Instalar Tripu" className="rounded-2xl border border-primary/20 bg-accent/10 p-5 sm:p-6">
    <div className="flex items-start gap-4">
      <Image src="/apple-icon.png" alt="" width={56} height={56} className="shrink-0 rounded-2xl" />
      <div className="min-w-0 space-y-2">
        <h2 className="text-lg">{installed ? "Tripu ya está lista en tu dispositivo" : "Tu próxima partida, a un toque"}</h2>
        <p className="text-sm leading-relaxed text-ink-soft">{installed ? "Abre Tripu desde su icono y entra con tu cuenta de Google para ver tus viajes." : "Añade Tripu a tu pantalla de inicio y entra directamente desde su icono."}</p>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-3">
      {!installed && (available || busy) && <button type="button" className="btn" onClick={install} disabled={busy}>{busy ? "Abriendo instalación…" : "Instalar Tripu"}</button>}
      {!guide && <Link href="/instalar" className="btn-secondary">Cómo instalar en el móvil →</Link>}
      {guide && !installed && <a href="#pasos" className="btn-secondary">Ver pasos para mi móvil ↓</a>}
      {guide && installed && <Link href="/" className="btn">Ir a mis viajes →</Link>}
    </div>
    {guide && !installed && !available && !busy && !message && <p className="mt-3 text-sm text-ink-soft">La instalación se hace desde el menú del navegador. Sigue los pasos de iPhone o Android que tienes debajo.</p>}
    <p role="status" className="mt-3 text-sm text-ink-soft">{!installed ? message : ""}</p>
  </section>;
}
