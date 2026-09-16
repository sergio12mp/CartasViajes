export interface PackRef { packs: { packId: string; pack?: { name: string } | null }[] }
// A card is free when it belongs to no pack; otherwise any unlocked pack grants it.
export function isCardAllowed(card: PackRef, unlockedPackIds: ReadonlySet<string>) {
  return card.packs.length === 0 || card.packs.some(p => unlockedPackIds.has(p.packId));
}
export function lockedPackNamesInPool(cards: PackRef[], unlockedPackIds: ReadonlySet<string>) {
  return [...new Set(cards.filter(c => !isCardAllowed(c, unlockedPackIds)).map(c => c.packs[0]?.pack?.name ?? c.packs[0]?.packId ?? "?"))];
}
export function formatEuros(cents: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
}
