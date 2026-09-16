import { describe, expect, it } from "vitest";
import { dealCards, missingLegendaries, suggestSplit, totalCardsPerPlayer, validateDealConfig, type DealConfig, type PoolCard } from "./deal";
const pool: PoolCard[] = [
  { cardTypeId: "l1", category: "roles", rarity: "LEGENDARY" }, { cardTypeId: "l2", category: "roles", rarity: "LEGENDARY" }, { cardTypeId: "l3", category: "defensa", rarity: "LEGENDARY" },
  { cardTypeId: "r1", category: "reto", rarity: "RARE" }, { cardTypeId: "r2", category: "reto", rarity: "RARE" },
  { cardTypeId: "c1", category: "reto", rarity: "COMMON" }, { cardTypeId: "c2", category: "bebida", rarity: "COMMON" }, { cardTypeId: "s", category: "defensa", rarity: "COMMON" },
];
const byRarity: DealConfig = { legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 2, dealByCategory: false, rules: [] };
const byCategory: DealConfig = { legendariesPerPlayer: 1, raresPerPlayer: 0, commonsPerPlayer: 0, dealByCategory: true, rules: [{ category: "reto", cardsPerPlayer: 3 }, { category: "defensa", cardsPerPlayer: 1 }] };
function seeded(seed = 1) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const rarityOf = (id: string) => pool.find(c => c.cardTypeId === id)!.rarity;
describe("dealCards", () => {
  it("deals one distinct legendary per player, never repeated across the trip", () => {
    const cards = dealCards({ playerIds: ["ana", "luis", "late"], pool, config: byRarity, rng: seeded() });
    expect(cards).toHaveLength(15);
    const legendaries = cards.filter(c => rarityOf(c.cardTypeId) === "LEGENDARY");
    expect(legendaries).toHaveLength(3);
    expect(new Set(legendaries.map(c => c.cardTypeId)).size).toBe(3);
    for (const playerId of ["ana", "luis", "late"]) {
      const hand = cards.filter(c => c.playerId === playerId).map(c => rarityOf(c.cardTypeId));
      expect(hand.filter(r => r === "LEGENDARY")).toHaveLength(1);
      expect(hand.filter(r => r === "RARE")).toHaveLength(2);
      expect(hand.filter(r => r === "COMMON")).toHaveLength(2);
    }
  });
  it("draws without repetition until the pool is exhausted, then refills", () => {
    const cards = dealCards({ playerIds: ["ana"], pool, config: { ...byRarity, raresPerPlayer: 2, commonsPerPlayer: 5 }, rng: seeded(7) });
    const rares = cards.filter(c => rarityOf(c.cardTypeId) === "RARE").map(c => c.cardTypeId).sort();
    expect(rares).toEqual(["r1", "r2"]);
    const commons = cards.filter(c => rarityOf(c.cardTypeId) === "COMMON").map(c => c.cardTypeId);
    expect(commons).toHaveLength(5);
    expect(new Set(commons.slice(0, 3)).size).toBe(3);
  });
  it("supports a configurable number of legendaries per player", () => {
    const cards = dealCards({ playerIds: ["ana"], pool, config: { ...byRarity, legendariesPerPlayer: 3, raresPerPlayer: 0, commonsPerPlayer: 0 }, rng: seeded(3) });
    expect(cards.map(c => c.cardTypeId).sort()).toEqual(["l1", "l2", "l3"]);
  });
  it("deals by category when enabled, still giving the mandatory legendaries", () => {
    const cards = dealCards({ playerIds: ["ana", "luis"], pool, config: byCategory, rng: seeded(5) });
    expect(cards).toHaveLength(10);
    for (const playerId of ["ana", "luis"]) {
      const hand = cards.filter(c => c.playerId === playerId).map(c => pool.find(p => p.cardTypeId === c.cardTypeId)!);
      expect(hand.filter(c => c.rarity === "LEGENDARY")).toHaveLength(1);
      expect(hand.filter(c => c.rarity !== "LEGENDARY" && c.category === "reto")).toHaveLength(3);
      expect(hand.filter(c => c.rarity !== "LEGENDARY" && c.category === "defensa")).toHaveLength(1);
    }
  });
  it("is deterministic for the same rng", () => {
    expect(dealCards({ playerIds: ["ana", "luis"], pool, config: byRarity, rng: seeded(9) })).toEqual(dealCards({ playerIds: ["ana", "luis"], pool, config: byRarity, rng: seeded(9) }));
  });
  it("returns no cards for no players", () => expect(dealCards({ playerIds: [], pool, config: byRarity })).toEqual([]));
  it("compensates players without a legendary with two extra rares", () => {
    const players = ["a", "b", "c", "d", "e"];
    const cards = dealCards({ playerIds: players, pool, config: byRarity, rng: seeded(11) });
    const hands = players.map(id => cards.filter(c => c.playerId === id).map(c => rarityOf(c.cardTypeId)));
    const withLegendary = hands.filter(h => h.includes("LEGENDARY"));
    const without = hands.filter(h => !h.includes("LEGENDARY"));
    expect(withLegendary).toHaveLength(3);
    expect(without).toHaveLength(2);
    for (const hand of withLegendary) expect(hand).toHaveLength(5);
    for (const hand of without) { expect(hand).toHaveLength(6); expect(hand.filter(r => r === "RARE")).toHaveLength(4); }
    expect(new Set(cards.filter(c => rarityOf(c.cardTypeId) === "LEGENDARY").map(c => c.cardTypeId)).size).toBe(3);
  });
  it("compensates in category mode too and falls back to commons when there are no rares", () => {
    const cards = dealCards({ playerIds: ["a", "b", "c", "d"], pool, config: byCategory, rng: seeded(2) });
    expect(cards).toHaveLength(3 * 5 + 6);
    const noRares = pool.filter(c => c.rarity !== "RARE");
    const fallback = dealCards({ playerIds: ["a", "b", "c", "d"], pool: noRares, config: { ...byRarity, raresPerPlayer: 0 }, rng: seeded(4) });
    expect(fallback).toHaveLength(3 * 3 + 4);
    expect(fallback.every(c => noRares.some(p => p.cardTypeId === c.cardTypeId))).toBe(true);
  });
  it("keeps the output grouped in the original player order", () => {
    const cards = dealCards({ playerIds: ["z", "a", "m"], pool, config: byRarity, rng: seeded(6) });
    expect([...new Set(cards.map(c => c.playerId))]).toEqual(["z", "a", "m"]);
  });
  it("rejects invalid configuration and duplicate players", () => {
    expect(() => dealCards({ playerIds: ["a", "b"], pool: pool.filter(c => c.rarity === "LEGENDARY").slice(0, 1), config: { ...byRarity, raresPerPlayer: 0, commonsPerPlayer: 0 } })).toThrow(/compensar/);
    expect(() => dealCards({ playerIds: ["a", "a"], pool, config: byRarity })).toThrow(/repetirse/);
  });
  it.each([-0.1, 1, NaN, Infinity])("rejects invalid random value %s", rng => {
    expect(() => dealCards({ playerIds: ["a"], pool, config: byRarity, rng: () => rng })).toThrow();
  });
});
describe("validateDealConfig", () => {
  it("accepts valid configurations", () => {
    expect(validateDealConfig(pool, byRarity, 3)).toBeNull();
    expect(validateDealConfig(pool, byCategory, 3)).toBeNull();
    expect(validateDealConfig(pool, { ...byRarity, legendariesPerPlayer: 0 }, 30)).toBeNull();
  });
  it("allows fewer legendaries than players and reports how many are missing", () => {
    expect(validateDealConfig(pool, { ...byRarity, legendariesPerPlayer: 2 }, 2)).toBeNull();
    expect(missingLegendaries(pool, { ...byRarity, legendariesPerPlayer: 2 }, 2)).toBe(1);
    expect(missingLegendaries(pool, byRarity, 2)).toBe(0);
  });
  it.each([-1, 0.5, NaN, Infinity])("rejects invalid count %s", count => {
    expect(validateDealConfig(pool, { ...byRarity, raresPerPlayer: count }, 1)).toBeTruthy();
    expect(validateDealConfig(pool, { ...byCategory, rules: [{ category: "reto", cardsPerPlayer: count }] }, 1)).toBeTruthy();
  });
  it("rejects missing categories, missing rarities, zero totals and duplicates", () => {
    expect(validateDealConfig(pool, { ...byCategory, rules: [{ category: "missing", cardsPerPlayer: 0 }] }, 1)).toMatch(/No hay cartas/);
    expect(validateDealConfig(pool, { ...byCategory, rules: [{ category: "roles", cardsPerPlayer: 1 }] }, 1)).toMatch(/No hay cartas/);
    expect(validateDealConfig(pool.filter(c => c.rarity !== "RARE"), byRarity, 1)).toMatch(/raras/);
    expect(validateDealConfig(pool, { ...byRarity, legendariesPerPlayer: 0, raresPerPlayer: 0, commonsPerPlayer: 0 }, 1)).toMatch(/al menos/);
    expect(validateDealConfig(pool, { ...byCategory, rules: [byCategory.rules[0], byCategory.rules[0]] }, 1)).toMatch(/repitas/);
    expect(validateDealConfig(pool, { ...byRarity, legendariesPerPlayer: 11 }, 1)).toMatch(/Máximo 10/);
    expect(validateDealConfig(pool, { ...byRarity, commonsPerPlayer: 199 }, 1)).toMatch(/Máximo 200/);
  });
});
describe("helpers", () => {
  it("totals the right portion depending on the mode", () => {
    expect(totalCardsPerPlayer(byRarity)).toBe(5);
    expect(totalCardsPerPlayer(byCategory)).toBe(5);
  });
  it("suggests a ~40/60 rare/common split", () => {
    expect(suggestSplit(4)).toEqual({ rares: 2, commons: 2 });
    expect(suggestSplit(5)).toEqual({ rares: 2, commons: 3 });
    expect(suggestSplit(0)).toEqual({ rares: 0, commons: 0 });
    expect(suggestSplit(-3)).toEqual({ rares: 0, commons: 0 });
  });
});
