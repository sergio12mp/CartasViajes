import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { colors } from "@/lib/og";
export const alt = "Tripu · El viaje se pone en juego";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpenGraphImage() {
  const [fan, wordmark] = await Promise.all(["fan.png", "wordmark.png"].map(async file => `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public", "brand", file))).toString("base64")}`));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: colors.bg, color: colors.ink, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "72px 0 72px 80px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={wordmark} alt="Tripu" width={340} height={149} />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 58, fontWeight: 800, lineHeight: 1.1, marginTop: 36 }}><span>El viaje se pone</span><span style={{ color: colors.primary }}>en juego.</span></div>
        <div style={{ display: "flex", fontSize: 28, color: colors.soft, marginTop: 24, maxWidth: 520 }}>Reúne a tu tripu, reparte las cartas y deja que el viaje haga el resto.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 520, background: colors.primary }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fan} alt="" width={520} height={520} />
      </div>
    </div>,
    size,
  );
}
