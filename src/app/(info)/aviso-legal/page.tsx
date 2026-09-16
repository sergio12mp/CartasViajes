import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, InfoPage, InfoSection } from "@/components/InfoPage";
import { legalDetailsComplete, siteOperator } from "@/lib/site-info";
export const metadata: Metadata = { title: "Aviso legal", description: "Identificación del titular e información sobre el sitio Tripu.", robots: { index: legalDetailsComplete, follow: true } };

export default function LegalPage() {
  return <InfoPage eyebrow="Las cosas claras" title="Aviso legal" intro="Información sobre el titular, el propósito del sitio y las condiciones generales de acceso." legal>
    <InfoSection id="titular" title="1. Identificación del titular"><dl className="divide-y divide-border rounded-2xl border border-border bg-surface px-4">{[
      ["Nombre o razón social", siteOperator.name], ["NIF / CIF", siteOperator.taxId], ["Domicilio de contacto", siteOperator.address], ["Correo electrónico", siteOperator.email], ["Datos registrales, si procede", siteOperator.registry],
    ].map(([label, value]) => <div key={label} className="py-3 sm:grid sm:grid-cols-2 sm:gap-4"><dt className="font-semibold text-ink">{label}</dt><dd className="break-words">{value ?? "Pendiente de completar"}</dd></div>)}</dl><p>Tripu es el nombre del servicio. La identificación del titular debe completarse con los datos de quien lo presta; el nombre de la aplicación no sustituye esa información.</p></InfoSection>
    <InfoSection id="servicio" title="2. Objeto del sitio"><p>Tripu permite organizar partidas de cartas entre participantes de un viaje, gestionar invitaciones y jugadas y compartir propuestas y vídeos. Algunas funciones requieren una cuenta de Google. Las páginas informativas son de acceso público.</p><p>El uso del juego se describe en las <Link href="/condiciones">condiciones de uso</Link>. Las compras, cuando estén habilitadas, mostrarán la modalidad y el precio antes del pago.</p></InfoSection>
    <InfoSection id="contenidos" title="3. Contenidos y enlaces"><p>Respeta los derechos de autor, de imagen y demás derechos de las personas que aparezcan en contenidos compartidos. Enviar un enlace no implica que su contenido se publique automáticamente: los vídeos de Comunidad pasan por revisión.</p><p>Los contenidos de terceros, incluidos los vídeos de TikTok, pueden cambiar o dejar de estar disponibles. Sus páginas tienen sus propias condiciones. Para comunicar un contenido que consideres ilícito o que vulnere tus derechos, consulta <Link href="/contacto">Contacto</Link>.</p></InfoSection>
    <InfoSection id="disponibilidad" title="4. Disponibilidad y responsabilidad"><p>El servicio puede tener interrupciones por mantenimiento o incidencias técnicas. Los retos se realizan voluntariamente y cada grupo debe adaptarlos a su entorno. Estas indicaciones no limitan los derechos ni las responsabilidades que establezca la legislación aplicable.</p></InfoSection>
    <InfoSection id="datos" title="5. Datos personales y consultas"><p>El tratamiento de datos se explica en <Link href="/privacidad">Privacidad</Link> y el uso del navegador en <Link href="/cookies">Cookies</Link>.</p><p><ContactEmail subject="Consulta sobre el aviso legal" /></p></InfoSection>
    <p className="text-xs leading-relaxed text-muted">Referencia: <a href="https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758#a10" className="underline underline-offset-4">artículo 10 de la Ley 34/2002</a>.</p>
  </InfoPage>;
}
