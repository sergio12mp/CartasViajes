import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { Badge, colors, Footer, Frame, OG_SIZE, rarityColor, rarityLabel } from "@/lib/og";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-z0-9-]{2,60}$/.test(id)) return new Response("Not found", { status: 404 });
  const card = await prisma.cardType.findUnique({ where: { id }, include: { packs: { include: { pack: { select: { name: true } } }, orderBy: { pack: { sortOrder: "asc" } }, take: 1 } } });
  if (!card) return new Response("Not found", { status: 404 });
  const color = rarityColor[card.rarity];
  return new ImageResponse(
    <Frame style={{ padding: 60 }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, borderRadius: 48, border: `18px solid ${color}`, background: colors.surface, padding: 64, ...(card.rarity === "LEGENDARY" ? { boxShadow: `0 0 0 14px ${color}44` } : {}) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Badge color={color}>{rarityLabel[card.rarity]}</Badge><Badge color={card.kind === "ATTACK" ? colors.primary : "#24734f"}>{card.kind === "ATTACK" ? "Ataque" : "Reacción"}</Badge></div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", fontSize: 300, margin: "40px 0" }}>{card.emoji ?? "🃏"}</div>
        <div style={{ display: "flex", fontSize: 34, color: colors.soft, textTransform: "capitalize" }}>{card.category}{card.packs[0] ? ` · ${card.packs[0].pack.name}` : ""}</div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>{card.name}</div>
        <div style={{ display: "flex", fontSize: 40, lineHeight: 1.35, marginTop: 28, color: colors.ink }}>{card.description}</div>
        {card.creditName && <div style={{ display: "flex", fontSize: 30, marginTop: 28, color: colors.soft }}>Propuesta por {card.creditName}</div>}
        <Footer text="tripu · el viaje se pone en juego" />
      </div>
    </Frame>,
    { ...OG_SIZE, headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
