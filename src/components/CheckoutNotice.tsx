import { confirmPurchase } from "@/lib/purchases";
export async function CheckoutNotice({ checkout, userId }: { checkout?: string; userId: string }) {
  if (!checkout) return null;
  if (checkout === "cancelled") return <p role="status" className="panel text-sm text-ink-soft">Pago cancelado. Puedes volver a intentarlo cuando quieras.</p>;
  const purchase = await confirmPurchase(checkout, userId);
  if (!purchase) return null;
  if (purchase.status === "PAID") return <p role="status" className="panel text-sm text-success">¡{purchase.pack.emoji} {purchase.pack.name} desbloqueado {purchase.scope === "LIFETIME" ? "para siempre" : "para este viaje"}! Ya puedes elegir sus cartas.</p>;
  return <p role="status" className="panel text-sm text-warning">Estamos confirmando tu pago. Si no aparece desbloqueado en unos segundos, recarga la página.</p>;
}
