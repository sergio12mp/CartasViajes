import { ImageResponse } from "next/og";
import { requireUser } from "@/lib/session";
import { getTripForUser, getTripHistory } from "@/lib/trips";
import { Badge, colors, Footer, Frame, OG_SIZE } from "@/lib/og";
export const dynamic = "force-dynamic";
const dateFormat = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });
export async function GET(_request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const user = await requireUser();
  const { tripId } = await params;
  const access = await getTripForUser(tripId, user.id);
  if (!access || access.trip.status !== "FINISHED") return new Response("Not found", { status: 404 });
  const { trip } = access;
  const plays = (await getTripHistory(tripId, user.id)) ?? [];
  const count = (pick: (play: (typeof plays)[number]) => string | null) => { const map = new Map<string, number>(); for (const play of plays) { const key = pick(play); if (key) map.set(key, (map.get(key) ?? 0) + 1); } return [...map.entries()].sort((a, b) => b[1] - a[1]); };
  const name = (id: string) => trip.players.find(p => p.id === id)?.displayName ?? "?";
  const suffered = count(p => p.finalTargetId).slice(0, 3);
  const [mvp] = count(p => p.attackerId);
  const [topCard] = count(p => p.card.cardType.id);
  const topCardType = topCard ? plays.find(p => p.card.cardType.id === topCard[0])?.card.cardType : null;
  const medals = ["🥇", "🥈", "🥉"];
  return new ImageResponse(
    <Frame>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Badge>Viaje finalizado</Badge><span style={{ fontSize: 28, color: colors.soft }}>{trip.startedAt ? dateFormat.format(trip.startedAt) : ""}</span></div>
      <div style={{ display: "flex", fontSize: 88, fontWeight: 800, lineHeight: 1.05, marginTop: 36 }}>{trip.name}</div>
      <div style={{ display: "flex", fontSize: 34, color: colors.soft, marginTop: 16 }}>{trip.players.length} tripulantes · {plays.length} jugadas</div>
      <div style={{ display: "flex", flexDirection: "column", background: colors.surface, borderRadius: 40, border: `4px solid ${colors.border}`, padding: 44, marginTop: 56 }}>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: colors.soft }}>Quien más cartas ha sufrido</div>
        {suffered.length === 0 && <div style={{ display: "flex", fontSize: 40, marginTop: 20 }}>Nadie recibió una carta. ¡Qué paz!</div>}
        {suffered.map(([id, n], i) => <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 48, marginTop: 22 }}><span style={{ display: "flex", gap: 20 }}><span>{medals[i]}</span><span style={{ fontWeight: 700 }}>{name(id)}</span></span><span style={{ color: colors.primary, fontWeight: 800 }}>{n} cartas</span></div>)}
      </div>
      <div style={{ display: "flex", gap: 28, marginTop: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: colors.surface, borderRadius: 40, border: `4px solid ${colors.border}`, padding: 36 }}><span style={{ fontSize: 26, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: colors.soft }}>MVP del viaje</span><span style={{ fontSize: 44, fontWeight: 800, marginTop: 12 }}>{mvp ? name(mvp[0]) : "—"}</span><span style={{ fontSize: 28, color: colors.soft }}>{mvp ? `${mvp[1]} cartas lanzadas` : "sin jugadas"}</span></div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: colors.surface, borderRadius: 40, border: `4px solid ${colors.accent}`, padding: 36 }}><span style={{ fontSize: 26, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: colors.soft }}>Carta del viaje</span><span style={{ fontSize: 44, fontWeight: 800, marginTop: 12 }}>{topCardType ? `${topCardType.emoji ?? ""} ${topCardType.name}` : "—"}</span><span style={{ fontSize: 28, color: colors.soft }}>{topCard ? `jugada ${topCard[1]} veces` : ""}</span></div>
      </div>
      <Footer text="tripu · el viaje se pone en juego" />
    </Frame>,
    { ...OG_SIZE, headers: { "Cache-Control": "private, no-store" } },
  );
}
