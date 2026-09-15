import { describe, expect, it } from "vitest";
import { dealCards, validateDealConfig } from "./deal";
const pool = [{ cardTypeId: "a", category: "reto" }, { cardTypeId: "b", category: "reto" }, { cardTypeId: "s", category: "defensa" }];
const rules = [{ category: "reto", cardsPerPlayer: 3 }, { category: "defensa", cardsPerPlayer: 1 }];
describe("dealCards", () => {
  it("deals the configured categories to every player, including unclaimed slots", () => {
    const cards = dealCards({ playerIds: ["ana", "luis", "late"], pool, rules, rng: () => 0.9 });
    expect(cards).toHaveLength(12);
    for (const playerId of ["ana", "luis", "late"]) expect(cards.filter(c => c.playerId === playerId).map(c => c.cardTypeId)).toEqual(["b", "b", "b", "s"]);
  });
  it("is deterministic and samples with replacement", () => {
    const input = { playerIds: ["ana"], pool, rules, rng: () => 0 };
    expect(dealCards(input)).toEqual(dealCards(input));
    expect(dealCards(input).map(c => c.cardTypeId)).toEqual(["a", "a", "a", "s"]);
  });
  it("ignores pool categories without a rule", () => {
    expect(dealCards({ playerIds: ["a"], pool, rules: [rules[1]], rng: () => 0 })).toEqual([{ playerId: "a", cardTypeId: "s" }]);
  });
  it("returns no cards for no players", () => expect(dealCards({ playerIds: [], pool, rules })).toEqual([]));
  it("rejects invalid configuration and duplicate players", () => {
    expect(() => dealCards({ playerIds: ["a"], pool, rules: [] })).toThrow();
    expect(() => dealCards({ playerIds: ["a", "a"], pool, rules })).toThrow();
  });
  it.each([-0.1, 1, NaN, Infinity])("rejects invalid random value %s", rng => {
    expect(() => dealCards({ playerIds: ["a"], pool, rules, rng: () => rng })).toThrow();
  });
});
describe("validateDealConfig", () => {
  it("accepts valid configuration", () => expect(validateDealConfig(pool, rules)).toBeNull());
  it.each([-1, 0.5, NaN, Infinity])("rejects invalid count %s", count => expect(validateDealConfig(pool, [{ category: "reto", cardsPerPlayer: count }])).toBeTruthy());
  it("rejects missing categories, even with zero cards", () => {
    expect(validateDealConfig(pool, [{ category: "missing", cardsPerPlayer: 0 }, ...rules])).toMatch(/No hay cartas/);
  });
  it("rejects a zero total", () => expect(validateDealConfig(pool, [{ category: "reto", cardsPerPlayer: 0 }])).toMatch(/al menos/));
  it("rejects duplicate rules", () => expect(validateDealConfig(pool, [rules[0], rules[0]])).toMatch(/repitas/));
});
