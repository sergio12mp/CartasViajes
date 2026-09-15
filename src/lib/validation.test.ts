import { expect, it } from "vitest";
import { parseTripForm, tripSchema } from "./validation";
const input = { name: "Viaje", responseWindowMinutes: 10, poolCardTypeIds: ["a"], dealRules: { reto: 2 }, playerNames: [" Ana ", "Luis"] };
it("trims names and rejects case-insensitive duplicates", () => {
  expect(tripSchema.parse(input).playerNames).toEqual(["Ana", "Luis"]);
  expect(tripSchema.safeParse({ ...input, playerNames: [" Ana ", "ana"] }).success).toBe(false);
});
it("rejects malformed JSON instead of throwing", () => {
  const form = new FormData(); form.set("dealRules", "{");
  expect(parseTripForm(form).success).toBe(false);
});
it("bounds workload, player count and response time", () => {
  expect(tripSchema.safeParse({ ...input, playerNames: ["Solo"] }).success).toBe(false);
  expect(tripSchema.safeParse({ ...input, responseWindowMinutes: 121 }).success).toBe(false);
  expect(tripSchema.safeParse({ ...input, dealRules: { reto: 1.5 } }).success).toBe(false);
  expect(tripSchema.safeParse({ ...input, dealRules: { reto: 100, bebida: 100, defensa: 1 } }).success).toBe(false);
});
