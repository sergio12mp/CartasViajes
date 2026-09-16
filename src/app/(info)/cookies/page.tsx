import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { legalContentReviewed } from "@/lib/site-info";

export const metadata: Metadata = { title: "Cookies", description: "Cookies de Tripu, vídeos externos y tus opciones.", robots: { index: legalContentReviewed, follow: true } };
const cookies = [
  ["Sesión", "authjs.session-token", "Mantiene tu sesión iniciada.", "Hasta 30 días, renovables con la actividad."],
  ["Acceso y seguridad", "authjs.callback-url / authjs.csrf-token", "Permiten volver a la app y protegen el acceso.", "Sesión del navegador."],
  ["Identificación con Google", "authjs.pkce.code_verifier / authjs.state", "Protegen el inicio de sesión.", "Hasta 15 minutos; se retiran al completar el acceso."],
];

export default function CookiesPage() {
  return <InfoPage eyebrow="Tú eliges qué se carga" title="Política de cookies" intro="Las cookies guardan información en tu navegador. En Tripu permiten iniciar sesión; los vídeos externos requieren tu autorización." legal>
    <InfoSection id="necesarias" title="1. Cookies necesarias"><p>Tripu utiliza cookies propias de sesión y seguridad. Bloquearlas puede impedir el acceso a tu cuenta.</p><details className="rounded-xl border border-border bg-surface p-4"><summary className="cursor-pointer font-semibold text-ink">Ver cookies y duración</summary><dl className="mt-4 space-y-4">{cookies.map(([label, name, purpose, duration]) => <div key={name}><dt className="font-semibold text-ink">{label}</dt><dd><p>{purpose} {duration}</p><p className="break-all text-xs text-muted">{name}</p></dd></div>)}</dl></details><p>No usamos cookies propias de publicidad o analítica. Las estadísticas de actividad se explican en <Link href="/privacidad#datos">Privacidad</Link>.</p></InfoSection>
    <InfoSection id="videos" title="2. Vídeos y servicios externos"><p>TikTok solo carga su reproductor al pulsar «Permitir y cargar vídeo». Entonces puede recibir tu dirección IP y datos de navegación y utilizar cookies según sus políticas de <a href="https://www.tiktok.com/legal/page/eea/privacy-policy/es">privacidad</a> y <a href="https://www.tiktok.com/legal/page/global/cookie-policy/es">cookies</a>.</p><p>La autorización se aplica a cada vídeo y no se guarda para futuras visitas. También puedes abrir el enlace directamente en TikTok. Google y Stripe pueden utilizar sus propias cookies cuando visitas sus páginas de acceso o pago.</p></InfoSection>
    <InfoSection id="control" title="3. Cómo gestionarlas"><p>«Ocultar vídeo» cierra el reproductor, pero no borra las cookies que TikTok haya creado. Puedes borrar o bloquear cookies desde los ajustes de tu navegador; si eliminas las de Tripu, puede cerrarse tu sesión.</p><p>Puedes jugar sin cargar vídeos. Las notificaciones se activan con un permiso independiente del navegador.</p><p>Para otras consultas, tienes disponible nuestro <Link href="/contacto">contacto</Link>.</p></InfoSection>
  </InfoPage>;
}
