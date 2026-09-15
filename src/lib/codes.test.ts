import { Prisma } from "@prisma/client";
import { expect, it, vi } from "vitest";
import { createTripWithUniqueCode, generateTripCode } from "./codes";
function uniqueError(target: string) { return new Prisma.PrismaClientKnownRequestError("Unique constraint", { code: "P2002", clientVersion: "6", meta: { target: [target] } }); }
it("generates six unambiguous characters", () => {
  for (let i = 0; i < 100; i++) expect(generateTripCode()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
});
it("retries code collisions and returns the created trip", async () => {
  const create = vi.fn().mockRejectedValueOnce(uniqueError("code")).mockResolvedValue({ id: "trip" });
  expect(await createTripWithUniqueCode(create)).toEqual({ id: "trip" });
  expect(create).toHaveBeenCalledTimes(2);
});
it("stops after five collisions", async () => {
  const create = vi.fn().mockRejectedValue(uniqueError("code"));
  await expect(createTripWithUniqueCode(create)).rejects.toThrow();
  expect(create).toHaveBeenCalledTimes(5);
});
it("does not retry unrelated unique constraints or connectivity errors", async () => {
  for (const error of [uniqueError("email"), new Error("Connection failed")]) {
    const create = vi.fn().mockRejectedValue(error);
    await expect(createTripWithUniqueCode(create)).rejects.toThrow();
    expect(create).toHaveBeenCalledTimes(1);
  }
});
