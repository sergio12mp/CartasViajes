import { expect, it, vi } from "vitest";
import { isAdmin, parseAdminEmails } from "./admin";
vi.mock("./session", () => ({ requireUser: vi.fn() }));
it("parses a comma-separated list, trimming and lowercasing", () => {
  expect([...parseAdminEmails(" Ana@Example.com, luis@example.com ,, ")]).toEqual(["ana@example.com", "luis@example.com"]);
  expect(parseAdminEmails(undefined).size).toBe(0);
});
it("matches emails case-insensitively and rejects missing emails", () => {
  const admins = parseAdminEmails("admin@example.com");
  expect(isAdmin("ADMIN@example.com", admins)).toBe(true);
  expect(isAdmin("other@example.com", admins)).toBe(false);
  expect(isAdmin(null, admins)).toBe(false);
  expect(isAdmin(undefined, admins)).toBe(false);
});
