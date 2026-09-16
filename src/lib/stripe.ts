import Stripe from "stripe";
export function stripeConfigured() { return Boolean(process.env.STRIPE_SECRET_KEY); }
// Payments stay off (every pack open to everyone) until PAYMENTS_ENABLED="true" and Stripe is configured.
export function paymentsEnabled() { return process.env.PAYMENTS_ENABLED === "true" && stripeConfigured(); }
let client: Stripe | null = null;
export function stripe() {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
export function appUrl(path = "/") {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";
  return new URL(path, base).href;
}
