import type { CSSProperties, ReactNode } from "react";
export const OG_SIZE = { width: 1080, height: 1350 };
export const colors = { primary: "#b93823", accent: "#f8c451", ink: "#30251f", soft: "#65564c", surface: "#fffdf8", bg: "#f7f2e8", border: "#ded4c4", common: "#9a9a9a", rare: "#2f6fd6", legendary: "#d4a017" };
export const rarityColor = { COMMON: colors.common, RARE: colors.rare, LEGENDARY: colors.legendary } as const;
export const rarityLabel = { COMMON: "Común", RARE: "Rara", LEGENDARY: "Legendaria" } as const;
const base: CSSProperties = { width: "100%", height: "100%", display: "flex", flexDirection: "column", background: colors.bg, color: colors.ink, fontFamily: "sans-serif", padding: 72 };
export function Frame({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...base, ...style }}>{children}</div>;
}
export function Footer({ text = "Jugado con Tripu" }: { text?: string }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", fontSize: 30, color: colors.soft }}>
    <span style={{ display: "flex", alignItems: "center", gap: 14 }}><span style={{ fontSize: 40 }}>🃏</span><span style={{ fontWeight: 700, color: colors.primary }}>Tripu</span></span><span>{text}</span>
  </div>;
}
export function Badge({ children, color = colors.primary }: { children: ReactNode; color?: string }) {
  return <span style={{ display: "flex", alignItems: "center", padding: "10px 22px", borderRadius: 999, background: `${color}22`, color, fontSize: 26, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{children}</span>;
}
