import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { markPurchasePaid } from "@/lib/purchases";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigured() || !secret) return new Response("Stripe not configured", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  let event: Stripe.Event;
  try { event = stripe().webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return new Response("Invalid signature", { status: 400 }); }
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object;
      const purchaseId = session.metadata?.purchaseId;
      if (purchaseId && session.payment_status === "paid") await markPurchasePaid(purchaseId, typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id);
    } else if (event.type === "checkout.session.expired") {
      const purchaseId = event.data.object.metadata?.purchaseId;
      if (purchaseId) await prisma.packPurchase.deleteMany({ where: { id: purchaseId, status: "PENDING" } });
    } else if (event.type === "charge.refunded") {
      const paymentIntent = event.data.object.payment_intent;
      const id = typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id;
      if (id) await prisma.packPurchase.updateMany({ where: { stripePaymentIntentId: id, status: "PAID" }, data: { status: "REFUNDED" } });
    }
  } catch { return new Response("Handler error", { status: 500 }); }
  return new Response("ok");
}
