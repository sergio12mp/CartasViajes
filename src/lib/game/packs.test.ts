import { expect, it } from "vitest";
import { formatEuros, isCardAllowed, lockedPackNamesInPool } from "./packs";
const pack = (packId: string, name: string) => ({ packId, pack: { name } });
const cards = [{ packs: [] }, { packs: [pack("erasmus", "Erasmus")] }, { packs: [pack("boda", "Despedida")] }, { packs: [pack("boda", "Despedida"), pack("erasmus", "Erasmus")] }];
it("allows free cards and cards from any unlocked pack", () => {
  const unlocked = new Set(["erasmus"]);
  expect(cards.map(c => isCardAllowed(c, unlocked))).toEqual([true, true, false, true]);
  expect(lockedPackNamesInPool(cards, unlocked)).toEqual(["Despedida"]);
  expect(lockedPackNamesInPool(cards, new Set())).toEqual(["Erasmus", "Despedida"]);
});
it("formats euro prices for Spain", () => expect(formatEuros(350)).toMatch(/3,50\s?€/));
