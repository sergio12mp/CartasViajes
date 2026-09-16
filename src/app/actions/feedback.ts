"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/action-state";
import { feedbackSchema } from "@/lib/validation";
import { ActionError, actionResult, inTripTransaction } from "@/lib/transactions";

export async function submitTripFeedback(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = feedbackSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { tripId, rating, favoriteCardTypeId, comment } = parsed.data;
  return actionResult(async () => {
    await inTripTransaction(tripId, user.id, async (tx, trip) => {
      if (trip.status !== "FINISHED") throw new ActionError("Podrás valorar el viaje cuando haya finalizado.");
      if (favoriteCardTypeId && !trip.pool.some(p => p.cardTypeId === favoriteCardTypeId)) throw new ActionError("Esa carta no formaba parte de este viaje.");
      const data = { rating, favoriteCardTypeId, comment: comment || null };
      await tx.tripFeedback.upsert({ where: { tripId_userId: { tripId, userId: user.id } }, create: { tripId, userId: user.id, ...data }, update: data });
    });
    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "¡Gracias! Tu valoración ayuda a mejorar el juego." };
  });
}
