import { prisma } from "./db";
export const videoInclude = { trip: { select: { id: true, name: true } }, submittedBy: { select: { name: true, image: true } } };
export async function getApprovedVideos() {
  return prisma.communityVideo.findMany({ where: { status: "APPROVED" }, include: videoInclude, orderBy: [{ reviewedAt: "desc" }, { createdAt: "desc" }], take: 100 });
}
export async function getVideosForUser(userId: string) {
  return prisma.communityVideo.findMany({ where: { submittedByUserId: userId }, include: videoInclude, orderBy: { createdAt: "desc" }, take: 20 });
}
export async function getVideosForTrip(tripId: string) {
  return prisma.communityVideo.findMany({ where: { tripId, status: "APPROVED" }, include: videoInclude, orderBy: { createdAt: "desc" } });
}
