import { prisma } from "@/lib/db";

// Public catalog only: never include suggestions, users, purchases or dealt hands.
export async function getPublicCards() {
  return prisma.cardType.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      kind: true,
      rarity: true,
      emoji: true,
      creditName: true,
      packs: {
        where: { pack: { isActive: true } },
        select: { pack: { select: { id: true, name: true, emoji: true } } },
        orderBy: { pack: { sortOrder: "asc" } },
      },
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export type PublicCard = Awaited<ReturnType<typeof getPublicCards>>[number];
