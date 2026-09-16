"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/action-state";
import { suggestionSchema } from "@/lib/validation";
import { ActionError, actionResult } from "@/lib/transactions";

const MAX_OPEN_SUGGESTIONS = 20;
export async function submitCardSuggestion(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = suggestionSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return actionResult(async () => {
    const open = await prisma.cardSuggestion.count({ where: { userId: user.id, status: "NEW" } });
    if (open >= MAX_OPEN_SUGGESTIONS) throw new ActionError("Tienes muchas sugerencias pendientes de revisar. ¡Gracias! Espera a que las revisemos.");
    await prisma.cardSuggestion.create({ data: { userId: user.id, ...parsed.data, comment: parsed.data.comment || null, creditName: parsed.data.creditName || user.name || null } });
    revalidatePath("/sugerencias");
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Sugerencia enviada. La revisaremos pronto." };
  });
}
