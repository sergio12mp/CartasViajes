export interface DealInput {
  playerIds: string[];
  pool: { cardTypeId: string; category: string }[];
  rules: { category: string; cardsPerPlayer: number }[];
  rng?: () => number;
}
export type DealResult = { playerId: string; cardTypeId: string }[];
export function validateDealConfig(pool: DealInput["pool"], rules: DealInput["rules"]): string | null {
  if (new Set(rules.map(r => r.category)).size !== rules.length) return "No repitas categorías en el reparto.";
  for (const rule of rules) {
    if (!Number.isSafeInteger(rule.cardsPerPlayer) || rule.cardsPerPlayer < 0) return "El número de cartas debe ser un entero igual o mayor que cero.";
    if (!pool.some(c => c.category === rule.category)) return `No hay cartas seleccionadas en la categoría ${rule.category}.`;
  }
  if (rules.reduce((sum, r) => sum + r.cardsPerPlayer, 0) === 0) return "Reparte al menos una carta por jugador.";
  return null;
}
export function dealCards({ playerIds, pool, rules, rng = Math.random }: DealInput): DealResult {
  const error = validateDealConfig(pool, rules);
  if (error) throw new Error(error);
  if (new Set(playerIds).size !== playerIds.length) throw new Error("Los jugadores no pueden repetirse.");
  const result: DealResult = [];
  for (const playerId of playerIds) {
    for (const rule of rules) {
      const options = pool.filter(c => c.category === rule.category);
      for (let i = 0; i < rule.cardsPerPlayer; i++) {
        const random = rng();
        if (!Number.isFinite(random) || random < 0 || random >= 1) throw new Error("El valor aleatorio debe estar entre 0 y 1, sin incluir 1.");
        result.push({ playerId, cardTypeId: options[Math.floor(random * options.length)].cardTypeId });
      }
    }
  }
  return result;
}
