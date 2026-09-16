import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getTripForUser } from "@/lib/trips";
import { getActiveCardTypes } from "@/lib/cards";
import { getActivePacks, getUnlockedPackIds } from "@/lib/packs";
import { paymentsEnabled } from "@/lib/stripe";
import { TripForm } from "@/components/TripForm";
import { CheckoutNotice } from "@/components/CheckoutNotice";
import { updateTripSettings } from "@/app/actions/trips";
export const dynamic = "force-dynamic";
export default async function SettingsPage({ params, searchParams }: { params: Promise<{ tripId: string }>; searchParams: Promise<{ checkout?: string }> }) {
  const user = await requireUser();
  const { tripId } = await params;
  const { checkout } = await searchParams;
  const access = await getTripForUser(tripId, user.id);
  if (!access) notFound();
  if (!access.isCreator || access.trip.status !== "DRAFT") redirect(`/trips/${tripId}`);
  const { trip } = access;
  // Confirm a returning checkout before computing what is unlocked.
  const notice = <CheckoutNotice checkout={checkout} userId={user.id} />;
  const [cards, packs, unlocked] = await Promise.all([getActiveCardTypes(), getActivePacks(), getUnlockedPackIds(user.id, tripId)]);
  return <div className="space-y-6"><Link href={`/trips/${tripId}`} className="text-sm text-primary">← Volver al viaje</Link><h1>Configura {trip.name}</h1>{notice}<TripForm cards={cards} packs={packs} unlockedPackIds={[...unlocked]} stripeEnabled={paymentsEnabled()} action={updateTripSettings} initialValues={{ tripId, name: trip.name, responseWindowMinutes: trip.responseWindowMinutes, poolCardTypeIds: trip.pool.map(p => p.cardTypeId), legendariesPerPlayer: trip.legendariesPerPlayer, raresPerPlayer: trip.raresPerPlayer, commonsPerPlayer: trip.commonsPerPlayer, dealByCategory: trip.dealByCategory, dealRules: Object.fromEntries(trip.dealRules.map(r => [r.category, r.cardsPerPlayer])), players: trip.players.map(p => ({ name: p.displayName, claimed: Boolean(p.userId) })) }} /></div>;
}
