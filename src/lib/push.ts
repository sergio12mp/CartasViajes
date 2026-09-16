import webpush from "web-push";
import { prisma } from "./db";
import type { PushPayload } from "./game/notifications";
export function pushConfigured() { return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY); }
let configured = false;
function setup() {
  if (configured) return;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@cartasviajes.app", process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  configured = true;
}
export type Notification = { userIds: (string | null | undefined)[]; payload: PushPayload };
// Never lets a delivery problem break the game action that triggered it.
export async function sendNotifications(notifications: Notification[]) {
  if (!pushConfigured() || notifications.length === 0) return;
  try {
    setup();
    const userIds = [...new Set(notifications.flatMap(n => n.userIds).filter((id): id is string => Boolean(id)))];
    if (userIds.length === 0) return;
    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId: { in: userIds } } });
    const stale: string[] = [];
    await Promise.all(notifications.flatMap(n => subscriptions.filter(s => n.userIds.includes(s.userId)).map(async s => {
      try { await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(n.payload), { TTL: 3600, urgency: "high" }); }
      catch (error) { const status = (error as { statusCode?: number }).statusCode; if (status === 404 || status === 410) stale.push(s.id); }
    })));
    if (stale.length) await prisma.pushSubscription.deleteMany({ where: { id: { in: stale } } });
  } catch { /* delivery is best-effort */ }
}
