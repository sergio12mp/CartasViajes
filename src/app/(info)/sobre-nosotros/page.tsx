import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { siteOperator } from "@/lib/site-info";
export const metadata: Metadata = { title: "Sobre Tripu", description: "Un juego de cartas para convertir los viajes entre amigos en historias compartidas." };

export default function AboutPage() {
  return <InfoPage eyebrow="La idea detrás del viaje" title="La mejor carta es tu gente" intro="Tripu pone un juego en medio del viaje para que tengáis una excusa más para reíros, improvisar y recordar lo que pasó.">
    <div className="rounded-3xl bg-ink p-7 text-surface sm:p-9"><p className="text-xs uppercase tracking-widest text-accent">Nuestro punto de partida</p><p className="mt-4 text-2xl font-semibold leading-snug sm:text-3xl">Un grupo de amigos.<br />Un destino.<br /><span className="text-accent">Unas cuantas cartas que lo cambian todo.</span></p></div>
    <InfoSection id="origen" title="Un proyecto personal para compartir"><p>Tripu es un proyecto personal de {siteOperator.name}, creado desde {siteOperator.country}. Nació para compartir viajes y partidas con amigos y está abierto a cualquier persona que tenga la URL de la aplicación.</p></InfoSection>
    <InfoSection id="idea" title="Un juego que cabe en el bolsillo"><p>Organiza el viaje, invita a la tripulación y reparte las cartas. A partir de ahí, cada ataque, defensa y devolución suma una historia al grupo. Tripu guarda las jugadas para que podáis volver a ellas después.</p><p>Los packs ayudan a empezar rápido y la configuración manual permite adaptar el juego a vuestra forma de viajar.</p></InfoSection>
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Cómo entendemos el juego">{[
      ["Juntos", "El grupo decide el tono. Una buena partida deja espacio para todo el mundo."],
      ["A vuestro ritmo", "El móvil acompaña el viaje. Lo importante sigue pasando entre vosotros."],
      ["Con imaginación", "Las ideas de la comunidad pueden convertirse en las próximas cartas."],
    ].map(([title, text]) => <div key={title} className="panel space-y-3"><h2 className="text-base">{title}</h2><p className="text-sm leading-relaxed text-ink-soft">{text}</p></div>)}</section>
    <InfoSection id="participar" title="También se construye con tus ideas"><p>¿Se te ha ocurrido un reto que encajaría con tu grupo? Puedes proponerlo en <Link href="/sugerencias">Sugerencias</Link>. Y si os apetece compartir una aventura, tenéis vuestro espacio en <Link href="/comunidad">Comunidad</Link>.</p></InfoSection>
    <div className="flex flex-wrap gap-3"><Link href="/trips/new" className="btn">Prepara tu viaje →</Link><Link href="/faq" className="btn-secondary">Cómo se juega</Link></div>
  </InfoPage>;
}
