export interface PackRef { packId: string | null; pack?: { name: string } | null }
export function isCardAllowed(card: PackRef, unlockedPackIds: ReadonlySet<string>) {
  return card.packId === null || card.packId === undefined || unlockedPackIds.has(card.packId);
}
export function lockedPackNamesInPool(cards: PackRef[], unlockedPackIds: ReadonlySet<string>) {
  return [...new Set(cards.filter(c => !isCardAllowed(c, unlockedPackIds)).map(c => c.pack?.name ?? c.packId!))];
}
export function formatEuros(cents: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100);
}
