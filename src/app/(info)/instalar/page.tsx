import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/InfoPage";
import { InstallApp } from "@/components/InstallApp";

export const metadata: Metadata = {
  title: "Instalar en el móvil",
  description: "Añade Tripu a la pantalla de inicio de tu iPhone o Android. Una guía paso a paso para entrar a tus viajes desde su icono.",
};

const guides = [
  {
    id: "iphone", title: "iPhone", browser: "Con Safari", steps: [
      ["Abre Tripu en Safari", "Si has llegado desde WhatsApp, Instagram u otra app, copia el enlace y pégalo en Safari."],
      ["Abre el menú Compartir", "Busca el icono del cuadrado con una flecha hacia arriba. Según tu versión de Safari, puede estar dentro del botón Más (…)."],
      ["Elige Añadir a pantalla de inicio", "Desplázate por las opciones de Compartir. Si no aparece, entra en Editar acciones para añadirla."],
      ["Confirma y abre Tripu", "Si aparece Abrir como app web, actívalo. Pulsa Añadir y busca el icono de Tripu en la pantalla de inicio."],
    ],
    source: "https://support.apple.com/es-es/guide/iphone/iphea86e5236/ios", sourceLabel: "Ayuda de Apple",
  },
  {
    id: "android", title: "Android", browser: "Con Google Chrome", steps: [
      ["Abre Tripu en Chrome", "Si el enlace se ha abierto dentro de otra app, copia la dirección y ábrela en Chrome."],
      ["Toca el menú de tres puntos ⋮", "Lo encontrarás junto a la barra de direcciones del navegador."],
      ["Elige Instalar y crear acceso directo", "Después pulsa Instalar. Según la versión, esta opción puede llamarse Añadir a pantalla de inicio o Instalar aplicación."],
      ["Confirma y busca el icono", "Acepta el diálogo que muestre tu móvil. Abre Tripu desde la pantalla de inicio o la lista de aplicaciones."],
    ],
    source: "https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=es", sourceLabel: "Ayuda de Chrome",
  },
];

export default function InstallPage() {
  return <InfoPage eyebrow="Llévate Tripu contigo" title="Tus viajes, en la pantalla de inicio" intro="Guarda Tripu junto a tus otras apps y vuelve a la partida con un toque. Puedes hacerlo directamente desde el navegador de tu móvil.">
    <InstallApp guide />
    <div id="pasos" className="scroll-mt-36 space-y-3">
      <h2>Elige tu móvil</h2>
      <nav aria-label="Guías de instalación" className="flex flex-wrap gap-3"><a href="#iphone" className="btn-secondary">Tengo un iPhone</a><a href="#android" className="btn-secondary">Tengo un Android</a></nav>
    </div>
    {guides.map(guide => <section key={guide.id} id={guide.id} aria-labelledby={`${guide.id}-title`} className="scroll-mt-36 rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2"><h2 id={`${guide.id}-title`}>{guide.title}</h2><span className="badge">{guide.browser}</span></div>
      <ol className="space-y-6">{guide.steps.map(([title, description], index) => <li key={title} className="flex gap-4">
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</span>
        <div className="space-y-1"><h3 className="font-semibold">{title}</h3><p className="text-sm leading-relaxed text-ink-soft">{description}</p></div>
      </li>)}</ol>
      <a href={guide.source} className="mt-6 inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4">{guide.sourceLabel} ↗</a>
    </section>)}
    <InfoSection id="despues" title="¿Y después de instalarla?"><p>Abre el icono de Tripu. Si te pide identificarte, entra con la misma cuenta de Google para encontrar tus viajes. La instalación no crea una cuenta nueva.</p><p>Necesitarás conexión a internet para consultar las partidas y jugar cartas. Si quieres recibir avisos, entra en un viaje y activa «Notificaciones» cuando esté disponible; instalar la app no activa ese permiso automáticamente.</p></InfoSection>
    <InfoSection id="ayuda" title="¿No aparece la opción?"><ul>
      <li>Abre el enlace en Safari o Chrome, fuera del navegador integrado de otras aplicaciones.</li>
      <li>Prueba en una ventana normal, fuera del modo privado o incógnito, y actualiza el navegador.</li>
      <li>Comprueba si el icono de Tripu ya está en tu pantalla de inicio o en la lista de aplicaciones.</li>
      <li>Los nombres de los menús pueden variar según el móvil. Si solo aparece «Crear acceso directo», también te servirá para volver a Tripu más rápido.</li>
    </ul><p>Puedes seguir jugando desde el navegador. Si necesitas ayuda, <Link href="/contacto">escríbenos</Link> indicando tu móvil y navegador.</p></InfoSection>
    <Link href="/" className="btn">Volver a mis viajes →</Link>
  </InfoPage>;
}
