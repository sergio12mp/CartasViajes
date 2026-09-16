import { PrismaClient } from "@prisma/client";
import { CARD_CATALOG } from "./card-catalog";
import { CARD_PACKS, PACK_CARDS } from "./card-packs";
const prisma = new PrismaClient();
const cards = [...CARD_CATALOG, ...PACK_CARDS];
try {
  const duplicates = cards.map(c => c.id).filter((id, i, all) => all.indexOf(id) !== i);
  if (duplicates.length) throw new Error(`Identificadores repetidos: ${duplicates.join(", ")}`);
  for (const pack of CARD_PACKS) for (const id of pack.cardIds) if (!cards.some(c => c.id === id)) throw new Error(`El pack ${pack.id} referencia la carta desconocida ${id}`);
  await prisma.$transaction(async (tx) => {
    for (const card of cards) {
      const data = { ...card, reactionEffect: card.reactionEffect ?? null, emoji: card.emoji ?? null, color: card.color ?? null, isActive: true };
      await tx.cardType.upsert({ where: { id: card.id }, create: data, update: data });
    }
    for (const { cardIds, ...pack } of CARD_PACKS) {
      await tx.cardPack.upsert({ where: { id: pack.id }, create: pack, update: pack });
      await tx.cardPackCard.deleteMany({ where: { packId: pack.id } });
      await tx.cardPackCard.createMany({ data: cardIds.map((cardTypeId, sortOrder) => ({ packId: pack.id, cardTypeId, sortOrder })) });
    }
  }, { timeout: 60_000 });
  console.log(`Catálogo actualizado: ${cards.length} tipos de carta y ${CARD_PACKS.length} packs.`);
} catch (error) {
  console.error("No se pudo actualizar el catálogo.", error instanceof Error ? error.message : "");
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
