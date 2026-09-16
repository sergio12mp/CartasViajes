"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { idSchema } from "@/lib/validation";

const schema = z.object({ kind: z.enum(["SUMMARY", "CARD", "INVITE"]), tripId: idSchema.optional(), cardTypeId: idSchema.optional() });
export async function recordShare(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return;
  const session = await auth();
  try { await prisma.shareEvent.create({ data: { ...parsed.data, userId: session?.user?.id ?? null } }); } catch { /* analytics only */ }
}
