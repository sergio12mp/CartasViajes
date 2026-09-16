import { expect, it } from "vitest";
import { slugify } from "./slug";
it("normalizes accents, spaces and symbols", () => {
  expect(slugify("  Copa del tirón!  ")).toBe("copa-del-tiron");
  expect(slugify("Móvil Out 2.0")).toBe("movil-out-2-0");
  expect(slugify("¡¡¡")).toBe("");
  expect(slugify("a".repeat(80))).toHaveLength(60);
});
