import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { initialActionState } from "@/lib/action-state";
import { createTrip, claimPlayer, startTrip, finishTrip, updateTripSettings } from "./trips";
import { acceptPlay, playCard, reactToPlay } from "./plays";
import { getTripBoard, getTripForUser, getTripHistory } from "@/lib/trips";
import { resolveExpiredPlays } from "@/lib/plays";
vi.mock("@/lib/session", () => ({ requireUser: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
const enabled = process.env.RUN_DB_TESTS === "1";
describe.skipIf(!enabled)("PostgreSQL action integration", () => {
  const prefix = `test-${randomUUID()}`;
  const userIds = [0, 1, 2, 3].map(i => `${prefix}-user-${i}`);
  const cardIds = ["attack", "block", "reflect"].map(suffix => `${prefix}-${suffix}`);
  let tripId = "";
  function asUser(index: number) { vi.mocked(requireUser).mockResolvedValue({ id: userIds[index], name: `Test ${index}`, email: null, image: null }); }
  function form(values: Record<string, string | string[]>) {
    const data = new FormData();
    for (const [key, value] of Object.entries(values)) for (const item of Array.isArray(value) ? value : [value]) data.append(key, item);
    return data;
  }
  const config = { name: prefix, responseWindowMinutes: "2", "poolCardTypeIds[]": cardIds, dealRules: JSON.stringify({ attack: 5, block: 1, reflect: 1 }), "playerNames[]": ["Ana", "Luis", "Tarde"] };
  beforeAll(async () => {
    await prisma.user.createMany({ data: userIds.map(id => ({ id, name: "Integration test" })) });
    await prisma.cardType.createMany({ data: [
      { id: cardIds[0], name: "Test attack", description: "Test", kind: "ATTACK", category: "attack" },
      { id: cardIds[1], name: "Test shield", description: "Test", kind: "REACTION", category: "block", reactionEffect: "BLOCK" },
      { id: cardIds[2], name: "Test boomerang", description: "Test", kind: "REACTION", category: "reflect", reactionEffect: "REFLECT" },
    ] });
  }, 30_000);
  afterAll(async () => {
    // Delete only fixtures created by this run, never catalog or user-owned rows.
    if (tripId) await prisma.trip.deleteMany({ where: { id: tripId, creatorId: userIds[0], name: prefix } });
    await prisma.cardType.deleteMany({ where: { id: { in: cardIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  }, 30_000);
  it("enforces membership, deals once, resolves competing responses once, and finishes atomically", async () => {
    asUser(0);
    const created = await createTrip(initialActionState, form(config));
    expect(created.ok, created.message).toBe(true);
    tripId = created.redirectTo!.split("/").at(-1)!;
    const trip = await prisma.trip.findUniqueOrThrow({ where: { id: tripId }, include: { players: true } });
    const a = trip.players.find(p => p.displayName === "Ana")!;
    const b = trip.players.find(p => p.displayName === "Luis")!;
    const late = trip.players.find(p => p.displayName === "Tarde")!;
    const claim = (playerId: string, code = trip.code) => form({ tripId, playerId, code });
    expect((await claimPlayer(initialActionState, claim(a.id))).ok).toBe(true);
    asUser(1);
    expect((await claimPlayer(initialActionState, claim(b.id, "AAAAAA"))).ok).toBe(false);
    const claims = await Promise.all([claimPlayer(initialActionState, claim(b.id)), claimPlayer(initialActionState, claim(b.id))]);
    expect(claims.filter(r => r.ok)).toHaveLength(1);
    expect(await getTripForUser(tripId, userIds[3])).toBeNull();
    expect(await getTripBoard(tripId, a.id, userIds[1])).toBeNull();
    expect((await startTrip(initialActionState, form({ tripId }))).ok).toBe(false);
    asUser(0);
    expect((await updateTripSettings(initialActionState, form({ ...config, tripId, "playerNames[]": ["Ana", "Nuevo"] }))).ok).toBe(false);
    const starts = await Promise.all([startTrip(initialActionState, form({ tripId })), startTrip(initialActionState, form({ tripId }))]);
    expect(starts.filter(r => r.ok)).toHaveLength(1);
    expect(await prisma.playerCard.count({ where: { tripId } })).toBe(21);
    expect(await prisma.tripEvent.count({ where: { tripId, type: "TRIP_STARTED" } })).toBe(1);
    asUser(2);
    expect((await claimPlayer(initialActionState, claim(late.id))).ok).toBe(true);
    expect(await prisma.playerCard.count({ where: { tripId, playerId: late.id } })).toBe(7);
    const attacks = await prisma.playerCard.findMany({ where: { tripId, playerId: a.id, cardTypeId: cardIds[0] }, orderBy: { id: "asc" } });
    const reflection = await prisma.playerCard.findFirstOrThrow({ where: { tripId, playerId: b.id, cardTypeId: cardIds[2] } });
    const block = await prisma.playerCard.findFirstOrThrow({ where: { tripId, playerId: b.id, cardTypeId: cardIds[1] } });
    const attackForm = (index: number, targetPlayerId = b.id) => form({ tripId, cardId: attacks[index].id, targetPlayerId });
    asUser(0);
    expect((await playCard(initialActionState, attackForm(0, a.id))).ok).toBe(false);
    const attacksRace = await Promise.all([playCard(initialActionState, attackForm(0)), playCard(initialActionState, attackForm(0))]);
    expect(attacksRace.filter(r => r.ok)).toHaveLength(1);
    const first = await prisma.play.findUniqueOrThrow({ where: { cardId: attacks[0].id } });
    asUser(3);
    expect((await acceptPlay(initialActionState, form({ tripId, playId: first.id }))).ok).toBe(false);
    asUser(1);
    const responses = await Promise.all([0, 1].map(() => reactToPlay(initialActionState, form({ tripId, playId: first.id, reactionCardId: reflection.id }))));
    expect(responses.filter(r => r.ok)).toHaveLength(1);
    expect(await prisma.play.findUniqueOrThrow({ where: { id: first.id } })).toMatchObject({ status: "REFLECTED", finalTargetId: a.id });
    expect(await prisma.tripEvent.count({ where: { playId: first.id, type: "PLAY_REFLECTED" } })).toBe(1);
    expect(await prisma.playerCard.count({ where: { id: { in: [attacks[0].id, reflection.id] }, status: "LOCKED" } })).toBe(2);
    asUser(0);
    expect((await reactToPlay(initialActionState, form({ tripId, playId: first.id, reactionCardId: block.id }))).ok).toBe(false);
    expect((await playCard(initialActionState, attackForm(1))).ok).toBe(true);
    const second = await prisma.play.findUniqueOrThrow({ where: { cardId: attacks[1].id } });
    asUser(1);
    expect((await reactToPlay(initialActionState, form({ tripId, playId: second.id, reactionCardId: block.id }))).ok).toBe(true);
    expect(await prisma.play.findUniqueOrThrow({ where: { id: second.id } })).toMatchObject({ status: "BLOCKED", finalTargetId: null });
    asUser(0);
    expect((await playCard(initialActionState, attackForm(2))).ok).toBe(true);
    const third = await prisma.play.update({ where: { cardId: attacks[2].id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    await Promise.all([resolveExpiredPlays(tripId, userIds[0]), resolveExpiredPlays(tripId, userIds[1])]);
    expect(await prisma.tripEvent.count({ where: { playId: third.id, type: "PLAY_EXPIRED" } })).toBe(1);
    expect(await prisma.play.findUniqueOrThrow({ where: { id: third.id } })).toMatchObject({ status: "ACCEPTED", finalTargetId: b.id });
    expect((await playCard(initialActionState, attackForm(3))).ok).toBe(true);
    const fourth = await prisma.play.findUniqueOrThrow({ where: { cardId: attacks[3].id } });
    asUser(1);
    const accepts = await Promise.all([0, 1].map(() => acceptPlay(initialActionState, form({ tripId, playId: fourth.id }))));
    expect(accepts.filter(r => r.ok)).toHaveLength(1);
    asUser(0);
    expect((await playCard(initialActionState, attackForm(4))).ok).toBe(true);
    const finishes = await Promise.all([finishTrip(initialActionState, form({ tripId })), finishTrip(initialActionState, form({ tripId }))]);
    expect(finishes.filter(r => r.ok)).toHaveLength(1);
    expect(await prisma.play.count({ where: { tripId, status: "PENDING" } })).toBe(0);
    expect(await prisma.tripEvent.count({ where: { tripId, type: "TRIP_FINISHED" } })).toBe(1);
    expect(await getTripHistory(tripId, userIds[0])).toHaveLength(5);
    asUser(2);
    const lateCard = await prisma.playerCard.findFirstOrThrow({ where: { tripId, playerId: late.id, cardTypeId: cardIds[0] } });
    expect((await playCard(initialActionState, form({ tripId, cardId: lateCard.id, targetPlayerId: a.id }))).ok).toBe(false);
    expect(await prisma.playerCard.findUniqueOrThrow({ where: { id: lateCard.id } })).toMatchObject({ status: "AVAILABLE" });
  }, 120_000);
});
