import { z } from "zod";
const name = z.string().trim().min(1, "Escribe un nombre para cada participante.").max(30, "Cada nombre admite hasta 30 caracteres.");
const count = (max: number, label: string) => z.coerce.number().int(`Usa un número entero de ${label}.`).min(0, `Las ${label} no pueden ser negativas.`).max(max, `Máximo ${max} ${label} por jugador.`);
const checkbox = z.preprocess(value => value === "on" || value === "true" || value === true, z.boolean());
export const tripSchema = z.object({
  name: z.string().trim().min(2, "El viaje necesita un nombre de al menos 2 caracteres.").max(60, "El nombre del viaje admite hasta 60 caracteres."),
  responseWindowMinutes: z.coerce.number().int("Usa minutos enteros.").min(1, "La ventana mínima es de 1 minuto.").max(120, "La ventana máxima es de 120 minutos."),
  poolCardTypeIds: z.array(z.string().min(1)).min(1, "Selecciona al menos un tipo de carta.").max(200, "Selecciona como máximo 200 tipos de carta."),
  legendariesPerPlayer: count(10, "legendarias"),
  raresPerPlayer: count(100, "raras"),
  commonsPerPlayer: count(100, "comunes"),
  dealByCategory: checkbox,
  dealRules: z.record(z.string().min(1).max(60), z.number().int().min(0).max(100, "Máximo 100 cartas por categoría.")).nullable().optional(),
  packId: z.preprocess(v => (v == null || v === "" ? null : v), z.string().regex(/^[a-z0-9-]{2,60}$/, "Pack no válido.").nullable()),
  playerNames: z.array(name).min(2, "Añade al menos 2 participantes.").max(30, "El máximo es de 30 participantes.")
    .refine(names => new Set(names.map(n => n.toLocaleLowerCase("es"))).size === names.length, "Los nombres de los participantes no pueden repetirse."),
}).superRefine((trip, ctx) => {
  if (trip.dealByCategory && !trip.dealRules) ctx.addIssue({ code: "custom", path: ["dealRules"], message: "Configura el reparto por categoría." });
  const rest = trip.dealByCategory ? Object.values(trip.dealRules ?? {}).reduce((a, b) => a + b, 0) : trip.raresPerPlayer + trip.commonsPerPlayer;
  if (trip.legendariesPerPlayer + rest > 200) ctx.addIssue({ code: "custom", path: ["dealRules"], message: "Máximo 200 cartas por jugador." });
});
export type TripInput = z.infer<typeof tripSchema>;
export function parseTripForm(form: FormData) {
  let dealRules: unknown;
  try { dealRules = JSON.parse(String(form.get("dealRules") ?? "")); } catch { dealRules = null; }
  return tripSchema.safeParse({
    name: form.get("name"), responseWindowMinutes: form.get("responseWindowMinutes"), poolCardTypeIds: form.getAll("poolCardTypeIds[]"), playerNames: form.getAll("playerNames[]"),
    legendariesPerPlayer: form.get("legendariesPerPlayer") ?? 1, raresPerPlayer: form.get("raresPerPlayer") ?? 0, commonsPerPlayer: form.get("commonsPerPlayer") ?? 0,
    dealByCategory: form.get("dealByCategory") ?? false, dealRules, packId: form.get("packId"),
  });
}
export const idSchema = z.string().min(1, "Falta un identificador.").max(100, "Identificador no válido.");
export const cardTypeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,60}$/, "El identificador solo admite minúsculas, números y guiones (2-60 caracteres)."),
  name: z.string().trim().min(2, "El nombre necesita al menos 2 caracteres.").max(60, "El nombre admite hasta 60 caracteres."),
  description: z.string().trim().min(5, "Describe la carta con al menos 5 caracteres.").max(500, "La descripción admite hasta 500 caracteres."),
  kind: z.enum(["ATTACK", "REACTION"], { message: "Elige si es ataque o reacción." }),
  category: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,60}$/, "La categoría solo admite minúsculas, números y guiones."),
  rarity: z.enum(["COMMON", "RARE", "LEGENDARY"], { message: "Elige una rareza." }),
  reactionEffect: z.preprocess(v => (v == null || v === "" ? null : v), z.enum(["BLOCK", "REFLECT"]).nullable()),
  emoji: z.preprocess(v => (v == null || (typeof v === "string" && v.trim() === "") ? null : v), z.string().trim().max(8, "El emoji es demasiado largo.").nullable()),
  isActive: checkbox,
  sortOrder: z.coerce.number().int("Usa un orden entero.").min(0).max(10_000),
  packIds: z.array(z.string().regex(/^[a-z0-9-]{2,60}$/)).max(50).default([]),
  creditName: z.preprocess(v => (v == null || (typeof v === "string" && v.trim() === "") ? null : v), z.string().trim().max(40, "El crédito admite hasta 40 caracteres.").nullable()),
  suggestionId: z.preprocess(v => (v == null || v === "" ? null : v), idSchema.nullable()),
}).superRefine((card, ctx) => {
  if (card.kind === "REACTION" && !card.reactionEffect) ctx.addIssue({ code: "custom", path: ["reactionEffect"], message: "Una reacción necesita efecto: bloquear o devolver." });
  if (card.kind === "ATTACK" && card.reactionEffect) ctx.addIssue({ code: "custom", path: ["reactionEffect"], message: "Un ataque no tiene efecto de reacción." });
});
export type CardTypeInput = z.infer<typeof cardTypeSchema>;
export const feedbackSchema = z.object({
  tripId: idSchema,
  rating: z.coerce.number().int("Elige una nota entera.").min(1, "La nota mínima es 1.").max(5, "La nota máxima es 5."),
  favoriteCardTypeId: z.preprocess(v => (v === "" ? null : v), idSchema.nullable()),
  comment: z.string().trim().max(500, "El comentario admite hasta 500 caracteres."),
});
export const suggestionSchema = z.object({
  name: z.string().trim().min(2, "El nombre necesita al menos 2 caracteres.").max(60, "El nombre admite hasta 60 caracteres."),
  description: z.string().trim().min(5, "Describe la carta con al menos 5 caracteres.").max(500, "La descripción admite hasta 500 caracteres."),
  category: z.string().trim().min(2, "Indica una categoría.").max(60, "La categoría admite hasta 60 caracteres."),
  rarity: z.enum(["COMMON", "RARE", "LEGENDARY"], { message: "Elige una rareza para la carta." }),
  comment: z.string().trim().max(500, "El comentario admite hasta 500 caracteres."),
  creditName: z.string().trim().max(40, "El nombre para el crédito admite hasta 40 caracteres."),
});
const euros = (label: string) => z.coerce.number().min(0, `El precio ${label} no puede ser negativo.`).max(500, `El precio ${label} es demasiado alto.`).transform(value => Math.round(value * 100));
export const packSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,60}$/, "El identificador solo admite minúsculas, números y guiones (2-60 caracteres)."),
  name: z.string().trim().min(2, "El nombre necesita al menos 2 caracteres.").max(60, "El nombre admite hasta 60 caracteres."),
  description: z.string().trim().min(5, "Describe el pack con al menos 5 caracteres.").max(300, "La descripción admite hasta 300 caracteres."),
  emoji: z.preprocess(v => (v == null || (typeof v === "string" && v.trim() === "") ? null : v), z.string().trim().max(8).nullable()),
  isPremium: checkbox,
  priceTripCents: euros("por viaje"),
  priceLifetimeCents: euros("para siempre"),
  isActive: checkbox,
  sortOrder: z.coerce.number().int("Usa un orden entero.").min(0).max(10_000),
  legendariesPerPlayer: count(10, "legendarias"),
  raresPerPlayer: count(100, "raras"),
  commonsPerPlayer: count(100, "comunes"),
  responseWindowMinutes: z.coerce.number().int("Usa minutos enteros.").min(1, "La ventana mínima es de 1 minuto.").max(120, "La ventana máxima es de 120 minutos."),
}).superRefine((pack, ctx) => {
  if (pack.isPremium && pack.priceTripCents === 0 && pack.priceLifetimeCents === 0) ctx.addIssue({ code: "custom", path: ["priceLifetimeCents"], message: "Un pack premium necesita al menos un precio." });
});
export const videoSchema = z.object({
  url: z.string().trim().url("Pega un enlace válido.").max(300, "El enlace es demasiado largo."),
  title: z.string().trim().max(80, "El título admite hasta 80 caracteres."),
  destination: z.string().trim().max(60, "El destino admite hasta 60 caracteres."),
  tripId: z.preprocess(v => (v === "" || v === null ? null : v), idSchema.nullable()),
});
