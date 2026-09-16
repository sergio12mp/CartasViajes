import { prisma } from "./db";
import { paymentsEnabled } from "./stripe";
export async function getUnlockedPackIds(userId: string, tripId?: string | null) {
  if (!paymentsEnabled()) return new Set((await prisma.cardPack.findMany({ select: { id: true } })).map(p => p.id));
  const [free, purchases] = await Promise.all([
    prisma.cardPack.findMany({ where: { isPremium: false }, select: { id: true } }),
    prisma.packPurchase.findMany({ where: { status: "PAID", OR: [{ userId, scope: "LIFETIME" }, ...(tripId ? [{ tripId, scope: "TRIP" as const }] : [])] }, select: { packId: true } }),
  ]);
  return new Set([...free.map(p => p.id), ...purchases.map(p => p.packId)]);
}
export async function getActivePacks() {
  return prisma.cardPack.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}
