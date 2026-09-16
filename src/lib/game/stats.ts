export interface PlayForStats { status: "PENDING" | "ACCEPTED" | "BLOCKED" | "REFLECTED"; card: { cardTypeId: string }; reactionCard: { cardTypeId: string } | null; events: { type: string }[] }
export interface CardStats { cardTypeId: string; played: number; pending: number; accepted: number; expired: number; blocked: number; reflected: number; reactions: Record<string, number>; usedAsReaction: number; favorites: number }
function empty(cardTypeId: string): CardStats { return { cardTypeId, played: 0, pending: 0, accepted: 0, expired: 0, blocked: 0, reflected: 0, reactions: {}, usedAsReaction: 0, favorites: 0 }; }
export function aggregateCardStats(plays: PlayForStats[], favorites: { cardTypeId: string; count: number }[] = []): CardStats[] {
  const stats = new Map<string, CardStats>();
  const get = (id: string) => { let entry = stats.get(id); if (!entry) { entry = empty(id); stats.set(id, entry); } return entry; };
  for (const play of plays) {
    const entry = get(play.card.cardTypeId);
    entry.played++;
    if (play.status === "PENDING") entry.pending++;
    else if (play.status === "ACCEPTED") { if (play.events.some(e => e.type === "PLAY_EXPIRED")) entry.expired++; else entry.accepted++; }
    else if (play.status === "BLOCKED") entry.blocked++;
    else entry.reflected++;
    if (play.reactionCard) {
      const reactionId = play.reactionCard.cardTypeId;
      entry.reactions[reactionId] = (entry.reactions[reactionId] ?? 0) + 1;
      get(reactionId).usedAsReaction++;
    }
  }
  for (const favorite of favorites) get(favorite.cardTypeId).favorites += favorite.count;
  return [...stats.values()].sort((a, b) => b.played - a.played || b.usedAsReaction - a.usedAsReaction || a.cardTypeId.localeCompare(b.cardTypeId));
}
