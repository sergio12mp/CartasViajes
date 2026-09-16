import type { RarityKey } from "./rarity";
export interface PoolCard { cardTypeId: string; category: string; rarity: RarityKey }
export interface DealRule { category: string; cardsPerPlayer: number }
export interface DealConfig { legendariesPerPlayer: number; raresPerPlayer: number; commonsPerPlayer: number; dealByCategory: boolean; rules: DealRule[] }
export interface DealInput { playerIds: string[]; pool: PoolCard[]; config: DealConfig; rng?: () => number }
export type DealResult = { playerId: string; cardTypeId: string }[];
export const MAX_LEGENDARIES_PER_PLAYER = 10;
export const MAX_CARDS_PER_PLAYER = 200;
// A player who misses a legendary gets it replaced by a rare plus one extra rare.
export const RARES_PER_MISSING_LEGENDARY = 2;
export function missingLegendaries(pool: PoolCard[], config: DealConfig, playerCount: number) {
  const legendaries = pool.filter(c => c.rarity === "LEGENDARY").length;
  return Math.max(0, playerCount * config.legendariesPerPlayer - legendaries);
}
const isCount = (n: number) => Number.isSafeInteger(n) && n >= 0;
export function totalCardsPerPlayer(config: DealConfig) {
  const rest = config.dealByCategory ? config.rules.reduce((sum, r) => sum + r.cardsPerPlayer, 0) : config.raresPerPlayer + config.commonsPerPlayer;
  return config.legendariesPerPlayer + rest;
}
export function suggestSplit(remaining: number) {
  const safe = Math.max(0, Math.floor(remaining));
  const rares = Math.round(safe * 0.4);
  return { rares, commons: safe - rares };
}
export function validateDealConfig(pool: PoolCard[], config: DealConfig, playerCount: number): string | null {
  const { legendariesPerPlayer: k, raresPerPlayer, commonsPerPlayer, dealByCategory, rules } = config;
  if (![k, raresPerPlayer, commonsPerPlayer, ...rules.map(r => r.cardsPerPlayer)].every(isCount)) return "El número de cartas debe ser un entero igual o mayor que cero.";
  if (k > MAX_LEGENDARIES_PER_PLAYER) return `Máximo ${MAX_LEGENDARIES_PER_PLAYER} legendarias por jugador.`;
  const total = totalCardsPerPlayer(config);
  if (total === 0) return "Reparte al menos una carta por jugador.";
  if (total > MAX_CARDS_PER_PLAYER) return `Máximo ${MAX_CARDS_PER_PLAYER} cartas por jugador.`;
  const rest = pool.filter(c => c.rarity !== "LEGENDARY");
  if (missingLegendaries(pool, config, playerCount) > 0 && rest.length === 0) return "No hay legendarias para todos y el mazo no tiene cartas raras o comunes con las que compensar.";
  if (dealByCategory) {
    if (new Set(rules.map(r => r.category)).size !== rules.length) return "No repitas categorías en el reparto.";
    for (const rule of rules) if (!rest.some(c => c.category === rule.category)) return `No hay cartas comunes o raras seleccionadas en la categoría ${rule.category}.`;
  } else {
    if (raresPerPlayer > 0 && !rest.some(c => c.rarity === "RARE")) return "No hay cartas raras en el mazo.";
    if (commonsPerPlayer > 0 && !rest.some(c => c.rarity === "COMMON")) return "No hay cartas comunes en el mazo.";
  }
  return null;
}
function random(rng: () => number, n: number) {
  const value = rng();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("El valor aleatorio debe estar entre 0 y 1, sin incluir 1.");
  return Math.floor(value * n);
}
function shuffle<T>(items: T[], rng: () => number) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = random(rng, i + 1); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
// Draw without repetition while the options last; refill only when a hand needs more than the pool offers.
function drawN(options: PoolCard[], n: number, rng: () => number) {
  const result: string[] = [];
  let remaining: PoolCard[] = [];
  for (let i = 0; i < n; i++) {
    if (remaining.length === 0) remaining = [...options];
    const [picked] = remaining.splice(random(rng, remaining.length), 1);
    result.push(picked.cardTypeId);
  }
  return result;
}
export function dealCards({ playerIds, pool, config, rng = Math.random }: DealInput): DealResult {
  const error = validateDealConfig(pool, config, playerIds.length);
  if (error) throw new Error(error);
  if (new Set(playerIds).size !== playerIds.length) throw new Error("Los jugadores no pueden repetirse.");
  const result: DealResult = [];
  const k = config.legendariesPerPlayer;
  const legendaries = shuffle(pool.filter(c => c.rarity === "LEGENDARY"), rng);
  const rest = pool.filter(c => c.rarity !== "LEGENDARY");
  const rares = rest.filter(c => c.rarity === "RARE");
  const compensation = rares.length > 0 ? rares : rest;
  // Legendaries are handed out in a shuffled player order so nobody is systematically left without one.
  const order = shuffle(playerIds, rng);
  order.forEach((playerId, index) => {
    const own = legendaries.slice(index * k, (index + 1) * k);
    for (const card of own) result.push({ playerId, cardTypeId: card.cardTypeId });
    const missing = k - own.length;
    const drawn = config.dealByCategory
      ? config.rules.flatMap(rule => drawN(rest.filter(c => c.category === rule.category), rule.cardsPerPlayer, rng))
      : [...drawN(rares, config.raresPerPlayer, rng), ...drawN(rest.filter(c => c.rarity === "COMMON"), config.commonsPerPlayer, rng)];
    if (missing > 0) drawn.push(...drawN(compensation, missing * RARES_PER_MISSING_LEGENDARY, rng));
    for (const cardTypeId of drawn) result.push({ playerId, cardTypeId });
  });
  const position = new Map(playerIds.map((id, i) => [id, i]));
  return result.sort((a, b) => position.get(a.playerId)! - position.get(b.playerId)!);
}
