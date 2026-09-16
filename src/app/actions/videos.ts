"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { ActionState } from "@/lib/action-state";
import { videoSchema } from "@/lib/validation";
import { parseTikTokUrl, TIKTOK_URL_HINT } from "@/lib/tiktok";
import { getTripForUser } from "@/lib/trips";
import { ActionError, actionResult } from "@/lib/transactions";

const MAX_PENDING_VIDEOS = 10;
export async function submitCommunityVideo(_previous: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = videoSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const video = parseTikTokUrl(parsed.data.url);
  if (!video) return { ok: false, message: TIKTOK_URL_HINT };
  return actionResult(async () => {
    if (parsed.data.tripId && !await getTripForUser(parsed.data.tripId, user.id)) throw new ActionError("No tienes acceso a ese viaje.");
    const pending = await prisma.communityVideo.count({ where: { submittedByUserId: user.id, status: "PENDING" } });
    if (pending >= MAX_PENDING_VIDEOS) throw new ActionError("Tienes varios vídeos pendientes de aprobar. Espera a que los revisemos.");
    if (await prisma.communityVideo.findUnique({ where: { url: video.url }, select: { id: true } })) throw new ActionError("Ese vídeo ya se ha enviado.");
    await prisma.communityVideo.create({ data: { url: video.url, videoId: video.videoId, title: parsed.data.title || null, destination: parsed.data.destination || null, tripId: parsed.data.tripId, submittedByUserId: user.id } });
    revalidatePath("/comunidad");
    revalidatePath("/admin", "layout");
    if (parsed.data.tripId) revalidatePath(`/trips/${parsed.data.tripId}`);
    return { ok: true, message: "Vídeo enviado. Aparecerá en la comunidad cuando lo aprobemos." };
  });
}
