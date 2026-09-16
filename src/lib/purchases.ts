import { prisma } from "./db";
import { stripe, stripeConfigured } from "./stripe";
// Marks a purchase as paid once; safe to call from the webhook and from the success page.
export async function markPurchasePaid(purchaseId: string, paymentIntentId?: string | null) {
  const updated = await prisma.packPurchase.updateMany({ where: { id: purchaseId, status: "PENDING" }, data: { status: "PAID", paidAt: new Date(), stripePaymentIntentId: paymentIntentId ?? undefined } });
  return updated.count === 1;
}
export async function confirmPurchase(purchaseId: string, userId: string) {
  const purchase = await prisma.packPurchase.findFirst({ where: { id: purchaseId, userId }, include: { pack: true } });
  if (!purchase) return null;
  if (purchase.status === "PENDING" && stripeConfigured() && !purchase.stripeSessionId.startsWith("manual-")) {
    try {
      const session = await stripe().checkout.sessions.retrieve(purchase.stripeSessionId);
      if (session.payment_status === "paid") { await markPurchasePaid(purchase.id, typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id); purchase.status = "PAID"; }
    } catch { /* the webhook will confirm it */ }
  }
  return purchase;
}
