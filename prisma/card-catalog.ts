import type { CardKind, Rarity, ReactionEffect } from "@prisma/client";

export interface CardTypeSeed {
  id: string; name: string; description: string; kind: CardKind; category: string; rarity: Rarity;
  reactionEffect?: ReactionEffect; emoji?: string; color?: string; sortOrder: number;
}

export const CARD_CATALOG: CardTypeSeed[] = [
  { id: "copa-tiron", name: "Copa del tirón", description: "Termina tu bebida del tirón. Tú eliges la bebida y la cantidad.", kind: "ATTACK", category: "bebida", rarity: "RARE", emoji: "🥤", sortOrder: 0 },
  { id: "chupito-doble", name: "Chupito doble", description: "Dos pequeños brindis, con la bebida que prefieras.", kind: "ATTACK", category: "bebida", rarity: "COMMON", emoji: "🥂", sortOrder: 1 },
  { id: "sin-manos", name: "Bebe sin manos", description: "Da un sorbo sin usar las manos.", kind: "ATTACK", category: "bebida", rarity: "COMMON", emoji: "🙌", sortOrder: 2 },
  { id: "cantar", name: "Canta una canción", description: "Interpreta el estribillo de una canción para el grupo.", kind: "ATTACK", category: "reto", rarity: "COMMON", emoji: "🎤", sortOrder: 4 },
  { id: "acento", name: "Habla con acento 10 min", description: "Inventa un acento y mantenlo durante diez minutos.", kind: "ATTACK", category: "reto", rarity: "COMMON", emoji: "🎭", sortOrder: 5 },
  { id: "foto-ridicula", name: "Foto ridícula", description: "Posa para la foto más absurda del viaje.", kind: "ATTACK", category: "reto", rarity: "COMMON", emoji: "📸", sortOrder: 6 },
  { id: "invita-ronda", name: "Invita a una ronda", description: "Invita al grupo a una ronda que acordéis entre todos.", kind: "ATTACK", category: "social", rarity: "RARE", emoji: "🍹", sortOrder: 7 },
  { id: "cuenta-secreto", name: "Cuenta un secreto", description: "Comparte una anécdota que el grupo aún no conozca.", kind: "ATTACK", category: "social", rarity: "COMMON", emoji: "🤫", sortOrder: 8 },

  // Decisiones
  { id: "sin-voto", name: "Sin voto", description: "Al aplicar esta carta sobre un jugador, no se tendrá en cuenta su opinión para la siguiente actividad. Si ha propuesto un sitio para comer, no se puede ir en consecuencia.", kind: "ATTACK", category: "decisiones", rarity: "RARE", emoji: "🚫", sortOrder: 20 },
  { id: "doble-voto", name: "Doble voto", description: "Al aplicar esta carta sobre un jugador, su voto vale x2 en la próxima decisión. Es acumulable con las otras cartas de voto.", kind: "ATTACK", category: "decisiones", rarity: "RARE", emoji: "✌️", sortOrder: 21 },
  { id: "ultra-voto", name: "Ultra voto", description: "Al aplicar esta carta sobre un jugador, su voto vale x3 en la próxima decisión. No se puede usar en uno mismo.", kind: "ATTACK", category: "decisiones", rarity: "LEGENDARY", emoji: "⭐", sortOrder: 22 },
  { id: "movil-out", name: "Móvil Out", description: "Juega esta carta cuando un jugador mire el móvil mientras se habla de planes. Pierde el móvil durante 2 horas.", kind: "ATTACK", category: "decisiones", rarity: "LEGENDARY", emoji: "📵", sortOrder: 23 },

  // Roles y personajes
  { id: "comunista", name: "Comunista", description: "Al aplicar esta carta sobre un jugador, durante las próximas 2 horas se transforma en comunista y todas sus opiniones deben seguir el régimen.", kind: "ATTACK", category: "roles", rarity: "RARE", emoji: "🚩", sortOrder: 30 },
  { id: "xokas", name: "Xokas", description: "Al aplicar esta carta sobre un jugador, durante las próximas 2 horas se transforma en experto de todo y su opinión va a misa.", kind: "ATTACK", category: "roles", rarity: "RARE", emoji: "🧠", sortOrder: 31 },
  { id: "freetour", name: "Freetour", description: "Al aplicar esta carta sobre un jugador, durante las próximas 2 horas se transforma en guía y debe ir comentando el paisaje, la arquitectura y soltando datos.", kind: "ATTACK", category: "roles", rarity: "RARE", emoji: "🗺️", sortOrder: 32 },
  { id: "dj", name: "DJ", description: "Al aplicar esta carta sobre un jugador, se convierte en el DJ del grupo durante el día y decide la música sin protestas.", kind: "ATTACK", category: "roles", rarity: "RARE", emoji: "🎧", sortOrder: 33 },
  { id: "lola-lolita", name: "Lola Lolita", description: "Obligas a alguien a grabar un TikTok de baile y subirlo a la cuenta de la corte.", kind: "ATTACK", category: "roles", rarity: "LEGENDARY", emoji: "🕺", sortOrder: 34 },
  { id: "profeta", name: "Profeta", description: "Al aplicar esta carta sobre un jugador, durante las próximas 2 horas debe predecir con seguridad cómo saldrá cualquier plan o decisión. Si se equivoca, el grupo decide un castigo.", kind: "ATTACK", category: "roles", rarity: "RARE", emoji: "🔮", sortOrder: 35 },

  // Bebida y fiesta
  { id: "hidalgo", name: "Hidalgo", description: "Juega esta carta cuando un jugador esté bebiendo. Le obligas a terminar la bebida y pedirse otra.", kind: "ATTACK", category: "bebida", rarity: "LEGENDARY", emoji: "🍺", sortOrder: 40 },
  { id: "gorron", name: "Gorrón", description: "Juega esta carta sobre ti mismo. El grupo te paga una bebida.", kind: "ATTACK", category: "bebida", rarity: "RARE", emoji: "💸", sortOrder: 41 },
  { id: "abstemio", name: "Abstemio", description: "Al aplicar esta carta sobre un jugador, durante las próximas 2 horas no podrá beber alcohol. No se puede usar de fiesta.", kind: "ATTACK", category: "bebida", rarity: "LEGENDARY", emoji: "🚫🍷", sortOrder: 42 },

  // Defensa e interacción
  { id: "escudo", name: "Escudo", description: "Bloqueas el efecto de cualquier carta que te lancen.", kind: "REACTION", category: "defensa", rarity: "RARE", reactionEffect: "BLOCK", emoji: "🛡️", sortOrder: 50 },
  { id: "rebote", name: "Rebote", description: "Juega esta carta cuando te lancen una carta. El efecto se devuelve al jugador que la ha jugado. No puede usarse contra otro Rebote.", kind: "REACTION", category: "defensa", rarity: "LEGENDARY", reactionEffect: "REFLECT", emoji: "🪞", sortOrder: 51 },
  { id: "robo", name: "Robo", description: "Al aplicar esta carta sobre un jugador, le robas una carta genérica al azar.", kind: "ATTACK", category: "defensa", rarity: "LEGENDARY", emoji: "🃏", sortOrder: 52 },

  // Logística y movimiento
  { id: "a-comprar", name: "A comprar", description: "Mandas a 2 personas a hacer la compra para el grupo.", kind: "ATTACK", category: "logistica", rarity: "RARE", emoji: "🛒", sortOrder: 60 },
  { id: "carrera", name: "Carrera", description: "Al aplicar esta carta sobre un jugador, debe correr de forma desesperada hacia donde se esté dirigiendo el grupo.", kind: "ATTACK", category: "logistica", rarity: "COMMON", emoji: "🏃", sortOrder: 61 },
];
