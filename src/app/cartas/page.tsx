import type { Metadata } from "next";
import Link from "next/link";
import { CardCatalog } from "@/components/CardCatalog";
import { getPublicCards } from "@/lib/public-cards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Colección de cartas",
  description: "Descubre las cartas de Tripu: retos, ataques y reacciones. Consulta sus efectos, rarezas y packs sin iniciar sesión.",
};

// Browsing the published catalog is public; playing still requires trip membership.
export default async function CardsPage() {
  const cards = await getPublicCards();
  return <div className="space-y-7">
    <header className="space-y-3"><span className="badge text-primary">Colección abierta · Beta</span><h1>Colección de cartas</h1><p className="max-w-xl leading-relaxed text-ink-soft">Descubre qué puede pasar en tu próximo viaje. Explora los retos, conoce las reacciones y encuentra las cartas que encajan con tu grupo.</p><p className="text-sm text-muted">Puedes ver toda la colección publicada sin iniciar sesión. Durante la beta iremos ajustando y añadiendo cartas.</p></header>
    <CardCatalog cards={cards} />
    <aside className="panel space-y-3"><h2>¿Listos para ponerlas en juego?</h2><p className="text-sm text-ink-soft">Entra con Google para crear un viaje y elegir las cartas de vuestra partida. Acordad los límites del grupo: todos los retos son voluntarios.</p><div className="flex flex-wrap gap-3"><Link href="/trips/new" className="btn">Crear un viaje →</Link><Link href="/faq" className="btn-secondary">Cómo se juega</Link></div></aside>
  </div>;
}
