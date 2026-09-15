import { PrismaClient } from "@prisma/client";
import { CARD_CATALOG } from "./card-catalog";
const prisma = new PrismaClient();
try {
  await prisma.$transaction(async (tx) => {
    for (const card of CARD_CATALOG) {
      const data = { ...card, reactionEffect: card.reactionEffect ?? null, emoji: card.emoji ?? null, color: card.color ?? null, isActive: true };
      await tx.cardType.upsert({ where: { id: card.id }, create: data, update: data });
    }
    await tx.cardType.updateMany({ where: { id: { notIn: CARD_CATALOG.map(c => c.id) } }, data: { isActive: false } });
  });
  console.log(`Catálogo actualizado: ${CARD_CATALOG.length} tipos de carta.`);
} catch {
  console.error("No se pudo actualizar el catálogo. Revisa la conexión y el esquema de la base de datos.");
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
