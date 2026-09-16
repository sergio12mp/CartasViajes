import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { legalContentReviewed } from "@/lib/site-info";
import { paymentsEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Condiciones de uso", description: "Participación, convivencia y uso de Tripu.", robots: { index: legalContentReviewed, follow: true } };

export default function TermsPage() {
  const paidPacks = paymentsEnabled();
  return <InfoPage eyebrow="Un buen viaje para todos" title="Condiciones de uso" intro="Tripu es un juego para compartir con amigos. Estas son las condiciones para participar." legal>
    <InfoSection id="participacion" title="1. Cuenta y partidas"><p>Para crear o participar en un viaje necesitas identificarte con Google. Utiliza tu propia cuenta y reclama solo tu nombre. El creador configura la partida y decide cuándo empieza y termina.</p><p>Al usar una carta, grita «¡Tripu!» para avisar al grupo, también si es una reacción. Consulta el reparto, los turnos de respuesta y las demás <Link href="/faq#jugar">reglas del juego</Link>.</p></InfoSection>
    <InfoSection id="limites" title="2. Convivencia"><p>Los retos son voluntarios. Acordad los límites del grupo y adaptad o saltad cualquier propuesta que incomode a alguien. Una carta aceptada en la app no obliga a realizarla.</p><p>No utilices Tripu para acosar, discriminar, humillar o poner en peligro a nadie. Nadie está obligado a consumir alcohol, gastar dinero ni revelar información personal. Las propuestas con alcohol se limitan a quienes tengan la edad legal y pueden adaptarse a bebidas sin alcohol.</p></InfoSection>
    <InfoSection id="comunidad" title="3. Contenido compartido"><p>Publica solo contenido propio o para el que tengas permiso, incluido el de las personas que aparecen. Las propuestas y vídeos pasan por revisión; los aprobados pueden mostrar públicamente su autor y los datos que los acompañen.</p><p>Respeta la privacidad al compartir invitaciones, imágenes y resúmenes. Comunica contenidos inapropiados o que vulneren tus derechos en <Link href="/contacto">Contacto</Link>.</p></InfoSection>
    <InfoSection id="packs" title={paidPacks ? "4. Packs y pagos" : "4. Acceso durante la beta"}>
      {paidPacks ? <><p>Antes de comprar un pack se muestran el precio y si el acceso corresponde a un viaje o a tu cuenta. Stripe gestiona el pago.</p><p>La información de contratación, duración del acceso, desistimiento y devoluciones está pendiente de completar. Estas condiciones no limitan los derechos legales de los consumidores.</p></> : <p>Actualmente los packs están abiertos durante las pruebas y no se realizan cobros desde Tripu. Cualquier futura oferta de pago deberá indicar su precio y condiciones antes de contratarla.</p>}
    </InfoSection>
    <InfoSection id="disponibilidad" title="5. Disponibilidad y cambios"><p>Necesitas conexión a internet. La app y el catálogo pueden cambiar o sufrir interrupciones por mantenimiento o incidencias. Los cambios relevantes en estas condiciones se comunicarán de forma accesible, respetando tus derechos.</p><p>El uso de datos se explica en <Link href="/privacidad">Privacidad</Link>. Estas condiciones no excluyen las responsabilidades establecidas por la legislación aplicable.</p></InfoSection>
  </InfoPage>;
}
