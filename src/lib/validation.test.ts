import { expect, it } from "vitest";
import { cardTypeSchema, parseTripForm, suggestionSchema, tripSchema } from "./validation";
const input = { name: "Viaje", responseWindowMinutes: 10, poolCardTypeIds: ["a"], legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 2, dealByCategory: false, dealRules: null, playerNames: [" Ana ", "Luis"] };
const suggestion = { name: "Karaoke", description: "Canta una canción", category: "musica", comment: "", creditName: "" };
it.each(["COMMON", "RARE", "LEGENDARY"])("preserves the proposed %s rarity", rarity => {
  expect(suggestionSchema.parse({ ...suggestion, rarity }).rarity).toBe(rarity);
});
it.each([undefined, null, "", "MYTHIC", "rara"])("rejects missing or invalid suggestion rarity: %s", rarity => {
  expect(suggestionSchema.safeParse({ ...suggestion, rarity }).success).toBe(false);
});
it("keeps custom categories and trims their surrounding whitespace", () => {
  expect(suggestionSchema.parse({ ...suggestion, rarity: "RARE", category: "  Naturaleza y montaña  " }).category).toBe("Naturaleza y montaña");
});
it("trims names and rejects case-insensitive duplicates", () => {
  expect(tripSchema.parse(input).playerNames).toEqual(["Ana", "Luis"]);
  expect(tripSchema.safeParse({ ...input, playerNames: [" Ana ", "ana"] }).success).toBe(false);
});
it("rejects malformed JSON instead of throwing", () => {
  const form = new FormData(); form.set("dealRules", "{"); form.set("dealByCategory", "on");
  expect(parseTripForm(form).success).toBe(false);
});
it("parses the deal fields from a form with defaults", () => {
  const form = new FormData();
  form.set("name", "Viaje"); form.set("responseWindowMinutes", "10"); form.append("poolCardTypeIds[]", "a"); form.append("playerNames[]", "Ana"); form.append("playerNames[]", "Luis");
  form.set("raresPerPlayer", "2"); form.set("commonsPerPlayer", "3");
  const parsed = parseTripForm(form);
  expect(parsed.success).toBe(true);
  if (parsed.success) expect(parsed.data).toMatchObject({ legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 3, dealByCategory: false });
});
it("requires deal rules only when dealing by category", () => {
  expect(tripSchema.safeParse({ ...input, dealByCategory: true }).success).toBe(false);
  expect(tripSchema.safeParse({ ...input, dealByCategory: true, dealRules: { reto: 2 } }).success).toBe(true);
  expect(tripSchema.safeParse({ ...input, dealByCategory: "on", dealRules: { reto: 1.5 } }).success).toBe(false);
});
it("bounds workload, player count and response time", () => {
  expect(tripSchema.safeParse({ ...input, playerNames: ["Solo"] }).success).toBe(false);
  expect(tripSchema.safeParse({ ...input, responseWindowMinutes: 121 }).success).toBe(false);
  expect(tripSchema.safeParse({ ...input, legendariesPerPlayer: 11 }).success).toBe(false);
  expect(tripSchema.safeParse({ ...input, raresPerPlayer: 100, commonsPerPlayer: 100, legendariesPerPlayer: 1 }).success).toBe(false);
  expect(tripSchema.safeParse({ ...input, dealByCategory: true, dealRules: { reto: 100, bebida: 100, defensa: 1 } }).success).toBe(false);
});
it("validates catalog cards", () => {
  const card = { id: "nueva-carta", name: "Nueva", description: "Una carta nueva", kind: "ATTACK", category: "Reto", rarity: "RARE", reactionEffect: "", emoji: "", isActive: "on", sortOrder: "5" };
  const parsed = cardTypeSchema.safeParse(card);
  expect(parsed.success).toBe(true);
  if (parsed.success) expect(parsed.data).toMatchObject({ category: "reto", reactionEffect: null, emoji: null, isActive: true, sortOrder: 5 });
  expect(cardTypeSchema.safeParse({ ...card, kind: "REACTION" }).success).toBe(false);
  expect(cardTypeSchema.safeParse({ ...card, reactionEffect: undefined, emoji: undefined }).success).toBe(true);
  expect(cardTypeSchema.safeParse({ ...card, kind: "REACTION", reactionEffect: "BLOCK" }).success).toBe(true);
  expect(cardTypeSchema.safeParse({ ...card, reactionEffect: "BLOCK" }).success).toBe(false);
  expect(cardTypeSchema.safeParse({ ...card, id: "Mal Id" }).success).toBe(false);
});
