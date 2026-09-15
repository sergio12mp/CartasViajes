import { prisma } from "./db";
export async function getActiveCardTypes() {
  return prisma.cardType.findMany({ where: { isActive: true }, orderBy: [{ category: "asc" }, { sortOrder: "asc" }] });
}
export function groupByCategory<T extends { category: string }>(cards: T[]): Record<string, T[]> {
  const result: Record<string, T[]> = Object.create(null);
  for (const card of cards) (result[card.category] ??= []).push(card);
  return result;
}
