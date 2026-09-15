import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getActiveCardTypes } from "@/lib/cards";
import { TripForm } from "@/components/TripForm";
import { createTrip } from "@/app/actions/trips";
export default async function NewTripPage() {
  await requireUser();
  const cards = await getActiveCardTypes();
  return <div className="space-y-6"><Link href="/" className="text-sm text-primary">← Mis viajes</Link><div><h1>Prepara el viaje</h1><p className="mt-2 text-ink-soft">Las reglas claras. Las cartas, al azar.</p></div><TripForm cards={cards} action={createTrip} /></div>;
}
