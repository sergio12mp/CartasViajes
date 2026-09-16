import { beforeEach, expect, it, vi } from "vitest";
import { submitCardSuggestion } from "./suggestions";
import { initialActionState } from "@/lib/action-state";

const mocks = vi.hoisted(() => ({ user: vi.fn(), lock: vi.fn(), count: vi.fn(), create: vi.fn(), transaction: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireUser: mocks.user }));
vi.mock("@/lib/db", () => ({ prisma: { $transaction: mocks.transaction } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.user.mockResolvedValue({ id: "member", name: "Ana" });
  mocks.lock.mockResolvedValue([{ id: "member" }]);
  mocks.count.mockResolvedValue(0);
  mocks.create.mockResolvedValue({ id: "suggestion" });
  mocks.transaction.mockImplementation(work => work({ $queryRaw: mocks.lock, cardSuggestion: { count: mocks.count, create: mocks.create } }));
});
function form(rarity = "LEGENDARY") {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: "Karaoke", description: "Canta una canción", category: "musica", rarity, comment: "", creditName: "", userId: "forged" })) data.set(key, value);
  return data;
}
it("stores the proposed rarity for the authenticated user inside the transaction", async () => {
  expect((await submitCardSuggestion(initialActionState, form())).ok).toBe(true);
  expect(mocks.create).toHaveBeenCalledWith({ data: expect.objectContaining({ userId: "member", rarity: "LEGENDARY", creditName: "Ana" }) });
  expect(mocks.lock.mock.invocationCallOrder[0]).toBeLessThan(mocks.count.mock.invocationCallOrder[0]);
});
it("rejects invalid rarity before accessing the database", async () => {
  expect((await submitCardSuggestion(initialActionState, form("MYTHIC"))).ok).toBe(false);
  expect(mocks.transaction).not.toHaveBeenCalled();
});
it("refuses submissions once the pending limit is reached", async () => {
  mocks.count.mockResolvedValue(20);
  expect((await submitCardSuggestion(initialActionState, form())).ok).toBe(false);
  expect(mocks.create).not.toHaveBeenCalled();
});
it("does not create a suggestion when the authenticated account no longer exists", async () => {
  mocks.lock.mockResolvedValue([]);
  expect((await submitCardSuggestion(initialActionState, form())).ok).toBe(false);
  expect(mocks.create).not.toHaveBeenCalled();
});
