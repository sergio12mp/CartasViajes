import Link from "next/link";
export default function NotFound() { return <section className="panel space-y-4"><h1>No encontramos esta página</h1><p className="text-ink-soft">El viaje no existe o no tienes acceso. Utiliza el enlace de invitación para unirte.</p><Link className="btn" href="/">Volver al inicio</Link></section>; }
