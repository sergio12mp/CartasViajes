import { expect, it } from "vitest";
import { canClaimPlayer, canManageTrip, validateRetainedPlayers } from "./trips";
const players = [{ id: "a", userId: "u", displayName: "Ana" }, { id: "b", userId: null, displayName: "Luis" }];
it("restricts management to the creator and required state", () => {
  expect(canManageTrip({ creatorId: "u", status: "DRAFT" }, "u", "DRAFT").ok).toBe(true);
  expect(canManageTrip({ creatorId: "u", status: "DRAFT" }, "x", "DRAFT").ok).toBe(false);
  expect(canManageTrip({ creatorId: "u", status: "ACTIVE" }, "u", "DRAFT").ok).toBe(false);
  expect(canManageTrip({ creatorId: "u", status: "FINISHED" }, "u", "ACTIVE").ok).toBe(false);
});
it("allows claims before and after starting", () => {
  for (const status of ["DRAFT", "ACTIVE"]) expect(canClaimPlayer(status, players, "b", "new").ok).toBe(true);
});
it("rejects finished trips, unknown slots, occupied slots and duplicate memberships", () => {
  expect(canClaimPlayer("FINISHED", players, "b", "new").ok).toBe(false);
  expect(canClaimPlayer("ACTIVE", players, "x", "new").ok).toBe(false);
  expect(canClaimPlayer("ACTIVE", players, "a", "new").ok).toBe(false);
  expect(canClaimPlayer("ACTIVE", players, "b", "u").ok).toBe(false);
});
it("retains claimed names while allowing unclaimed names to change", () => {
  expect(validateRetainedPlayers(players, ["Ana", "Nuevo"]).ok).toBe(true);
  expect(validateRetainedPlayers(players, ["Luis", "Nuevo"]).ok).toBe(false);
});
