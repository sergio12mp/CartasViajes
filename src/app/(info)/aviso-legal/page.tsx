import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, InfoPage, InfoSection } from "@/components/InfoPage";
import { legalContentReviewed, siteOperator } from "@/lib/site-info";

export const metadata: Metadata = { title: "Aviso legal", description: "Titular y contacto de Tripu.", robots: { index: legalContentReviewed, follow: true } };

export default function LegalPage() {
  return <InfoPage eyebrow="Las cosas claras" title="Aviso legal" intro="Quién está detrás de Tripu y cómo contactar." legal>
    <InfoSection id="titular" title="1. Titular"><dl className="divide-y divide-border rounded-2xl border border-border bg-surface px-4">{[
      ["Titular", siteOperator.name], ["País", siteOperator.country], ["NIF", siteOperator.taxId], ["Domicilio de contacto", siteOperator.address], ["Datos registrales", siteOperator.registry],
    ].filter(([, value]) => Boolean(value)).map(([label, value]) => <div key={label} className="py-3 sm:grid sm:grid-cols-2 sm:gap-4"><dt className="font-semibold text-ink">{label}</dt><dd className="break-words">{value}</dd></div>)}<div className="py-3 sm:grid sm:grid-cols-2 sm:gap-4"><dt className="font-semibold text-ink">Correo electrónico</dt><dd><ContactEmail /></dd></div></dl><p>Tripu es un proyecto personal gestionado desde {siteOperator.country}.</p></InfoSection>
    <InfoSection id="servicio" title="2. El servicio"><p>Tripu es una aplicación para jugar cartas durante viajes con amigos. La web y su colección de cartas son públicas; para crear o participar en una partida necesitas una cuenta de Google.</p><p>Consulta las <Link href="/condiciones">condiciones de uso</Link> y las <Link href="/faq">reglas del juego</Link>.</p></InfoSection>
    <InfoSection id="contenidos" title="3. Contenidos y enlaces"><p>Respeta los derechos de autor y de imagen de los contenidos compartidos. Los servicios enlazados tienen sus propias condiciones. Puedes comunicar contenidos que vulneren tus derechos a través de <Link href="/contacto">Contacto</Link>.</p></InfoSection>
    <InfoSection id="datos" title="4. Privacidad y cookies"><p>Explicamos el uso de tus datos en la <Link href="/privacidad">política de privacidad</Link> y el almacenamiento en tu navegador en la <Link href="/cookies">política de cookies</Link>.</p></InfoSection>
  </InfoPage>;
}
