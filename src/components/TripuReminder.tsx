export function TripuReminder({ reaction = false }: { reaction?: boolean }) {
  return <aside className="rounded-xl border border-primary/20 bg-accent/15 p-4 text-sm">
    <p className="font-bold text-primary">{reaction ? "Al usar una reacción, grita «¡Tripu!»" : "Al jugar una carta, grita «¡Tripu!»"}</p>
    <p className="mt-1 leading-relaxed text-ink-soft">Es la señal para que el grupo se entere de la jugada. ¡Que se note que estáis jugando!</p>
  </aside>;
}
