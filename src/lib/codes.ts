import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateTripCode(): string {
  return Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
}
export async function createTripWithUniqueCode<T>(create: (code: string) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try { return await create(generateTripCode()); }
    catch (error) {
      const target = error instanceof Prisma.PrismaClientKnownRequestError ? error.meta?.target : null;
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002" || !Array.isArray(target) || !target.includes("code") || attempt === 4) throw error;
    }
  }
  throw new Error("No se pudo generar un código de viaje.");
}
