import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getTripForUser } from "@/lib/trips";
import { getActiveCardTypes } from "@/lib/cards";
import { TripForm } from "@/components/TripForm";
import { updateTripSettings } from "@/app/actions/trips";
export default async function SettingsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const user = await requireUser();
  const { tripId } = await params;
  const access = await getTripForUser(tripId, user.id);
  if (!access) notFound();
  if (!access.isCreator || access.trip.status !== "DRAFT") redirect(`/trips/${tripId}`);
  const { trip } = access;
  const cards = await getActiveCardTypes();
  return <div className="space-y-6"><Link href={`/trips/${tripId}`} className="text-sm text-primary">← Volver al viaje</Link><h1>Configura {trip.name}</h1><TripForm cards={cards} action={updateTripSettings} initialValues={{ tripId, name: trip.name, responseWindowMinutes: trip.responseWindowMinutes, poolCardTypeIds: trip.pool.map(p => p.cardTypeId), legendariesPerPlayer: trip.legendariesPerPlayer, raresPerPlayer: trip.raresPerPlayer, commonsPerPlayer: trip.commonsPerPlayer, dealByCategory: trip.dealByCategory, dealRules: Object.fromEntries(trip.dealRules.map(r => [r.category, r.cardsPerPlayer])), players: trip.players.map(p => ({ name: p.displayName, claimed: Boolean(p.userId) })) }} /></div>;
}
