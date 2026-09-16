import type { Metadata } from "next";
import Link from "next/link";
import { ContactEmail, InfoPage, InfoSection } from "@/components/InfoPage";
import { siteOperator } from "@/lib/site-info";
export const metadata: Metadata = { title: "Contacto", description: "Ayuda con tus viajes, propuestas de cartas y consultas de privacidad en Tripu." };

export default function ContactPage() {
  return <InfoPage eyebrow="Estamos al otro lado" title="Hablemos de tu viaje" intro="Una duda, una idea o algo que no ha salido como esperabas. Encuentra el lugar para contarlo.">
    <div className="grid gap-4 sm:grid-cols-2"><section className="panel space-y-3"><h2 className="text-lg">Dudas sobre el juego</h2><p className="text-sm leading-relaxed text-ink-soft">Reparto, invitaciones, cartas y notificaciones, explicados paso a paso.</p><Link className="btn-secondary" href="/faq">Consultar las FAQ</Link></section><section className="panel space-y-3"><h2 className="text-lg">Una idea de carta</h2><p className="text-sm leading-relaxed text-ink-soft">Propón el próximo reto del grupo desde tu cuenta.</p><Link className="btn-secondary" href="/sugerencias">Enviar una propuesta</Link></section></div>
    <InfoSection id="soporte" title="Soporte y consultas generales"><p><ContactEmail /></p>{siteOperator.email ? <p>Cuéntanos qué estabas intentando hacer, qué ocurrió y qué dispositivo usabas. No incluyas contraseñas, datos de tarjeta ni códigos de acceso de Google.</p> : <p>El canal de atención directa aún está pendiente de habilitar. Las sugerencias de cartas no son un canal para enviar documentación personal ni reclamaciones.</p>}</InfoSection>
    <InfoSection id="datos" title="Privacidad y contenido publicado"><p>Para solicitar acceso, rectificación o supresión de tus datos, o comunicar un problema con un vídeo, escribe a <ContactEmail subject="Privacidad y contenido publicado" />. Si se trata de un contenido, indica el enlace para poder identificarlo.</p><p>Consulta qué información se trata y quién puede verla en la <Link href="/privacidad">política de privacidad</Link>.</p></InfoSection>
  </InfoPage>;
}
