import { prisma } from "./db";
export async function getActiveCardTypes() {
  return prisma.cardType.findMany({ where: { isActive: true, OR: [{ packId: null }, { pack: { isActive: true } }] }, include: { pack: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
}
export type CardTypeWithPack = Awaited<ReturnType<typeof getActiveCardTypes>>[number];
export async function getCommunityCardTypes() {
  return prisma.cardType.findMany({ where: { isActive: true, creditName: { not: null } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}
export function groupByCategory<T extends { category: string }>(cards: T[]): Record<string, T[]> {
  const result: Record<string, T[]> = Object.create(null);
  for (const card of cards) (result[card.category] ??= []).push(card);
  return result;
}
