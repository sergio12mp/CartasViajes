import { expect, it } from "vitest";
import { formatEuros, isCardAllowed, lockedPackNamesInPool } from "./packs";
const cards = [{ packId: null }, { packId: "erasmus", pack: { name: "Erasmus" } }, { packId: "boda", pack: { name: "Despedida" } }, { packId: "erasmus", pack: { name: "Erasmus" } }];
it("allows base cards and cards from unlocked packs", () => {
  const unlocked = new Set(["erasmus"]);
  expect(cards.map(c => isCardAllowed(c, unlocked))).toEqual([true, true, false, true]);
  expect(lockedPackNamesInPool(cards, unlocked)).toEqual(["Despedida"]);
  expect(lockedPackNamesInPool(cards, new Set())).toEqual(["Erasmus", "Despedida"]);
});
it("formats euro prices for Spain", () => expect(formatEuros(350)).toMatch(/3,50\s?€/));
