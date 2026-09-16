import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/InfoPage";
import { InstallApp } from "@/components/InstallApp";

export const metadata: Metadata = { title: "Preguntas frecuentes", description: "Cómo empezar en Tripu, unirte a un viaje, jugar tus cartas y resolver las dudas de tu grupo." };
const groups = [
  { id: "empezar", title: "Antes de salir", questions: [
    ["¿Qué necesito para jugar?", "Una cuenta de Google, conexión a internet y un grupo de amigos. Tripu funciona desde el navegador del móvil; no necesitas descargar una aplicación."],
    ["¿Cómo creo un viaje?", "Entra con Google y pulsa «Crear viaje». Elige un pack o configura las cartas a mano, ajusta el reparto y el tiempo de respuesta, y añade entre 2 y 30 nombres, incluido el tuyo. Después comparte la invitación y reclama tu nombre."],
    ["¿Cómo me uno a un viaje?", "Abre el enlace que te envíe el creador o introduce el código de seis caracteres en «Mis viajes». Entra con Google y elige tu nombre. Cada cuenta puede reclamar un solo nombre en ese viaje."],
    ["¿Qué pasa si llego cuando el viaje ya ha empezado?", "Puedes reclamar un nombre libre mientras el viaje siga activo. Al empezar se reparten cartas a todos los nombres, así que encontrarás la mano que ya te correspondía."],
  ] },
  { id: "jugar", title: "Con las cartas en la mano", questions: [
    ["¿Cuándo hay que gritar «¡Tripu!»?", "Cada vez que uses una carta, grita «¡Tripu!» al jugarla. Vale tanto para los ataques como para las reacciones, como Escudo o Rebote. Es la señal para avisar al resto del grupo de que hay una jugada. Y si alguien de alrededor pregunta qué estáis haciendo, ¡contadle que estáis jugando a Tripu!"],
    ["¿Cómo se reparten las cartas?", "El creador elige cuántas cartas comunes, raras y legendarias recibe cada persona. Las legendarias no se repiten entre jugadores del mismo viaje. Las demás evitan repetirse dentro de una mano mientras el mazo lo permita. Si faltan legendarias, se compensan con cartas del resto del mazo."],
    ["¿Cómo lanzo un ataque?", "Toca una carta de ataque disponible en tu mano, elige a otra persona y confirma. Tu carta quedará usada y el objetivo tendrá el tiempo configurado para responder. No puedes atacarte a ti mismo."],
    ["¿Para qué sirven las cartas de reacción?", "Se usan desde el ataque que has recibido, antes de que venza el tiempo. Un Escudo bloquea el efecto; una carta de devolución lo dirige a quien lo lanzó. No se puede reaccionar de nuevo a una devolución."],
    ["¿Qué pasa si no respondo a tiempo?", "El ataque se aplica automáticamente al llegar al vencimiento. El resultado aparece cuando alguien carga la partida o realiza una acción. Mientras tengas la página visible, se actualiza aproximadamente cada cinco segundos."],
    ["¿Puedo recuperar una carta usada o cambiar el reparto?", "Una carta jugada queda usada durante ese viaje. El creador puede editar la configuración antes de empezar; después, el reparto queda cerrado."],
    ["¿Y si alguien no quiere hacer un reto?", "La participación es voluntaria. Acordad los límites antes de empezar y adaptad o saltad cualquier reto que incomode a alguien. Que una carta figure como aceptada en la app no obliga a nadie a realizarla."],
    ["¿Qué ocurre al finalizar el viaje?", "El creador cierra la partida. Los ataques pendientes se aplican a sus objetivos, ya no se admiten nuevas jugadas y podéis consultar el ranking, el historial y compartir un resumen."],
  ] },
  { id: "cuenta", title: "Packs, avisos y comunidad", questions: [
    ["¿Tripu tiene packs de pago?", "Durante la fase de pruebas, con los pagos desactivados, los packs están abiertos. Cuando se active la venta, la pantalla de compra indicará el precio y si el desbloqueo sirve para ese viaje o para tu cuenta. Los pagos se tramitan en Stripe."],
    ["¿Cómo activo o desactivo las notificaciones?", "Si están disponibles, utiliza el control «Notificaciones» de tu viaje y acepta el permiso del navegador. Puedes desactivarlas desde el mismo control o desde los ajustes del dispositivo. En iPhone, puede ser necesario añadir Tripu a la pantalla de inicio."],
    ["¿Quién puede ver mi viaje?", "La mesa y la mano requieren acceso al viaje. Quien tenga la invitación puede ver su nombre, participantes y resumen del reparto, así que comparte el código solo con tu grupo. Los vídeos aprobados en Comunidad y las imágenes que compartas tienen otra visibilidad."],
    ["¿Por qué un TikTok me pide permiso antes de cargar?", "El reproductor lo ofrece TikTok y puede usar cookies y recibir datos de tu conexión. Tú decides si cargar cada vídeo dentro de Tripu o abrir el enlace en TikTok. Puedes ocultar el reproductor cuando quieras."],
    ["¿Cómo propongo una carta o comparto un vídeo?", "Envía una carta desde Sugerencias o un enlace de TikTok desde Comunidad. Ambos pasan por revisión. Elige con cuidado el nombre que quieres mostrar como autor y comparte solo contenido para el que tengas permiso."],
  ] },
];

export default function FaqPage() {
  return <InfoPage eyebrow="Una mano con tus dudas" title="Preguntas frecuentes" intro="Desde el primer código hasta la última carta. Lo que conviene saber para empezar a jugar.">
    <nav aria-label="Temas de ayuda" className="flex flex-wrap gap-2">{groups.map(group => <a className="btn-secondary" href={`#${group.id}`} key={group.id}>{group.title}</a>)}</nav>
    <InstallApp />
    {groups.map(group => <section id={group.id} key={group.id} className="scroll-mt-36 space-y-4" aria-labelledby={`${group.id}-title`}>
      <h2 id={`${group.id}-title`}>{group.title}</h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">{group.questions.map(([question, answer]) => <details key={question} className="group">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-sm font-semibold [&::-webkit-details-marker]:hidden"><span>{question}</span><span aria-hidden="true" className="text-lg leading-5 text-primary group-open:rotate-45">+</span></summary>
        <p className="px-5 pb-5 text-sm leading-7 text-ink-soft">{answer}</p>
      </details>)}</div>
    </section>)}
    <aside className="panel space-y-3"><h2>¿Te queda alguna duda?</h2><p className="text-sm text-ink-soft">Encuentra cómo trasladarnos una consulta o una incidencia.</p><Link href="/contacto" className="btn-secondary">Ir a contacto →</Link></aside>
  </InfoPage>;
}
