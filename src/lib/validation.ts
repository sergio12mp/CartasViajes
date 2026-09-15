import { z } from "zod";
const name = z.string().trim().min(1, "Escribe un nombre para cada participante.").max(30, "Cada nombre admite hasta 30 caracteres.");
export const tripSchema = z.object({
  name: z.string().trim().min(2, "El viaje necesita un nombre de al menos 2 caracteres.").max(60, "El nombre del viaje admite hasta 60 caracteres."),
  responseWindowMinutes: z.coerce.number().int("Usa minutos enteros.").min(1, "La ventana mínima es de 1 minuto.").max(120, "La ventana máxima es de 120 minutos."),
  poolCardTypeIds: z.array(z.string().min(1)).min(1, "Selecciona al menos un tipo de carta.").max(200, "Selecciona como máximo 200 tipos de carta."),
  dealRules: z.record(z.string().min(1).max(60), z.number().int().min(0).max(100, "Máximo 100 cartas por categoría."))
    .refine(rules => Object.values(rules).reduce((a, b) => a + b, 0) <= 200, "Máximo 200 cartas por jugador."),
  playerNames: z.array(name).min(2, "Añade al menos 2 participantes.").max(30, "El máximo es de 30 participantes.")
    .refine(names => new Set(names.map(n => n.toLocaleLowerCase("es"))).size === names.length, "Los nombres de los participantes no pueden repetirse."),
});
export type TripInput = z.infer<typeof tripSchema>;
export function parseTripForm(form: FormData) {
  let dealRules: unknown;
  try { dealRules = JSON.parse(String(form.get("dealRules") ?? "")); } catch { dealRules = null; }
  return tripSchema.safeParse({ name: form.get("name"), responseWindowMinutes: form.get("responseWindowMinutes"), poolCardTypeIds: form.getAll("poolCardTypeIds[]"), playerNames: form.getAll("playerNames[]"), dealRules });
}
export const idSchema = z.string().min(1, "Falta un identificador.").max(100, "Identificador no válido.");
