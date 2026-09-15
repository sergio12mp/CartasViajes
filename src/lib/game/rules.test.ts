import { describe, expect, it } from "vitest";
import { buildEventMessage, canPlayAttack, canReact, canRespond, computeExpiry, resolveReaction, type GameEventType, type ResponseInput } from "./rules";
const attack = { trip: { status: "ACTIVE" as const }, card: { status: "AVAILABLE" as const, kind: "ATTACK" as const, playerId: "a" }, attackerPlayerId: "a", targetPlayerId: "b" };
const response: ResponseInput = { trip: { status: "ACTIVE" }, play: { status: "PENDING", targetId: "b", expiresAt: new Date("2026-01-01T12:10:00Z") }, responderPlayerId: "b", now: new Date("2026-01-01T12:00:00Z") };
const reaction = { ...response, reactionCard: { status: "AVAILABLE" as const, kind: "REACTION" as const, playerId: "b" } };
describe("canPlayAttack", () => {
  it("accepts a valid attack", () => expect(canPlayAttack(attack)).toEqual({ ok: true }));
  it.each(["DRAFT", "FINISHED"] as const)("rejects %s trips", status => expect(canPlayAttack({ ...attack, trip: { status } }).ok).toBe(false));
  it("rejects another player's card", () => expect(canPlayAttack({ ...attack, attackerPlayerId: "c" }).ok).toBe(false));
  it("rejects locked cards", () => expect(canPlayAttack({ ...attack, card: { ...attack.card, status: "LOCKED" } }).ok).toBe(false));
  it("rejects reactions", () => expect(canPlayAttack({ ...attack, card: { ...attack.card, kind: "REACTION" } }).ok).toBe(false));
  it("rejects self attacks", () => expect(canPlayAttack({ ...attack, targetPlayerId: "a" }).ok).toBe(false));
});
describe("canRespond", () => {
  it("accepts the target before expiry", () => expect(canRespond(response)).toEqual({ ok: true }));
  it.each(["DRAFT", "FINISHED"] as const)("rejects %s", status => expect(canRespond({ ...response, trip: { status } }).ok).toBe(false));
  it.each(["ACCEPTED", "BLOCKED", "REFLECTED"] as const)("rejects resolved %s plays", status => expect(canRespond({ ...response, play: { ...response.play, status } }).ok).toBe(false));
  it("rejects an unrelated responder", () => expect(canRespond({ ...response, responderPlayerId: "a" }).ok).toBe(false));
  it.each([0, 1])("rejects at and after the expiry boundary (+%s ms)", offset => {
    expect(canRespond({ ...response, now: new Date(response.play.expiresAt.getTime() + offset) })).toEqual({ ok: false, message: "La jugada ha expirado y se ha aplicado." });
  });
});
describe("canReact", () => {
  it("accepts a valid reaction", () => expect(canReact(reaction)).toEqual({ ok: true }));
  it("propagates response failure", () => expect(canReact({ ...reaction, trip: { status: "FINISHED" } }).ok).toBe(false));
  it("rejects another player's reaction", () => expect(canReact({ ...reaction, reactionCard: { ...reaction.reactionCard, playerId: "a" } }).ok).toBe(false));
  it("rejects a locked reaction", () => expect(canReact({ ...reaction, reactionCard: { ...reaction.reactionCard, status: "LOCKED" } }).ok).toBe(false));
  it("rejects attack cards", () => expect(canReact({ ...reaction, reactionCard: { ...reaction.reactionCard, kind: "ATTACK" } }).ok).toBe(false));
});
describe("resolution and expiry", () => {
  it("blocks with no final target", () => expect(resolveReaction("BLOCK", { attackerId: "a", targetId: "b" })).toEqual({ status: "BLOCKED", finalTargetId: null }));
  it("reflects to the attacker", () => expect(resolveReaction("REFLECT", { attackerId: "a", targetId: "b" })).toEqual({ status: "REFLECTED", finalTargetId: "a" }));
  it("computes expiry without mutating the input date", () => {
    const date = new Date("2026-01-01T12:00:00Z");
    expect(computeExpiry(date, 10)).toEqual(response.play.expiresAt);
    expect(date.toISOString()).toBe("2026-01-01T12:00:00.000Z");
  });
  it.each([0, -1, 121, 1.5, NaN])("rejects invalid window %s", value => expect(() => computeExpiry(new Date(), value)).toThrow());
  it("rejects invalid dates", () => expect(() => computeExpiry(new Date(NaN), 10)).toThrow());
});
describe("event messages", () => {
  const ctx = { attackerName: "Ana", targetName: "Luis", cardName: "A correr" };
  it.each([
    ["TRIP_STARTED", "comenzado"], ["TRIP_FINISHED", "finalizado"], ["PLAYER_JOINED", "Luis se ha unido"],
    ["CARD_PLAYED", "Ana jugó A correr contra Luis"], ["PLAY_ACCEPTED", "Luis aceptó"],
    ["PLAY_BLOCKED", "Escudo"], ["PLAY_REFLECTED", "Boomerang"], ["PLAY_EXPIRED", "se aplica a Luis"],
  ] as [GameEventType, string][])("renders %s in Spanish", (type, expected) => expect(buildEventMessage(type, ctx)).toContain(expected));
  it.each(["PLAY_BLOCKED", "PLAY_REFLECTED"] as const)("uses the reaction name for %s", type => expect(buildEventMessage(type, { ...ctx, reactionName: "Especial" })).toContain("Especial"));
});
