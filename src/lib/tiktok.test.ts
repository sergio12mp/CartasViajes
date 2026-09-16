import { expect, it } from "vitest";
import { parseTikTokUrl } from "./tiktok";
it("accepts full video links and normalizes them", () => {
  expect(parseTikTokUrl(" https://www.tiktok.com/@cartas.viajes/video/7301234567890123456?lang=es ")).toEqual({ url: "https://www.tiktok.com/@cartas.viajes/video/7301234567890123456", videoId: "7301234567890123456", handle: "cartas.viajes" });
  expect(parseTikTokUrl("https://tiktok.com/@ana_1/video/12345")?.videoId).toBe("12345");
});
it("rejects short links, other hosts and non-https", () => {
  expect(parseTikTokUrl("https://vm.tiktok.com/ZGeAbc123/")).toBeNull();
  expect(parseTikTokUrl("http://www.tiktok.com/@ana/video/12345")).toBeNull();
  expect(parseTikTokUrl("https://www.tiktok.com.evil.com/@ana/video/12345")).toBeNull();
  expect(parseTikTokUrl("https://www.youtube.com/watch?v=x")).toBeNull();
  expect(parseTikTokUrl("javascript:alert(1)")).toBeNull();
});
