import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getActiveCardTypes } from "@/lib/cards";
import { getActivePacks, getUnlockedPackIds } from "@/lib/packs";
import { paymentsEnabled } from "@/lib/stripe";
import { TripForm } from "@/components/TripForm";
import { CheckoutNotice } from "@/components/CheckoutNotice";
import { createTrip } from "@/app/actions/trips";
export const dynamic = "force-dynamic";
export default async function NewTripPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const user = await requireUser();
  const { checkout } = await searchParams;
  const notice = <CheckoutNotice checkout={checkout} userId={user.id} />;
  const [cards, packs, unlocked] = await Promise.all([getActiveCardTypes(), getActivePacks(), getUnlockedPackIds(user.id)]);
  return <div className="space-y-6"><Link href="/" className="text-sm text-primary">← Mis viajes</Link><div><h1>Prepara el viaje</h1><p className="mt-2 text-ink-soft">Las reglas claras. Las cartas, al azar.</p></div>{notice}<TripForm cards={cards} packs={packs} unlockedPackIds={[...unlocked]} stripeEnabled={paymentsEnabled()} action={createTrip} /></div>;
}
