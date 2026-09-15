import type { CardKind, ReactionEffect } from "@prisma/client";
export interface CardTypeSeed {
  id: string; name: string; description: string; kind: CardKind; category: string;
  reactionEffect?: ReactionEffect; emoji?: string; color?: string; sortOrder: number;
}
export const CARD_CATALOG: CardTypeSeed[] = [
  { id: "copa-tiron", name: "Copa del tirón", description: "Termina tu bebida del tirón. Tú eliges la bebida y la cantidad.", kind: "ATTACK", category: "bebida", emoji: "🥤", sortOrder: 0 },
  { id: "chupito-doble", name: "Chupito doble", description: "Dos pequeños brindis, con la bebida que prefieras.", kind: "ATTACK", category: "bebida", emoji: "🥂", sortOrder: 1 },
  { id: "sin-manos", name: "Bebe sin manos", description: "Da un sorbo sin usar las manos.", kind: "ATTACK", category: "bebida", emoji: "🙌", sortOrder: 2 },
  { id: "a-correr", name: "A correr", description: "Haz una pequeña carrera hasta el punto que acuerde el grupo.", kind: "ATTACK", category: "reto", emoji: "🏃", sortOrder: 3 },
  { id: "cantar", name: "Canta una canción", description: "Interpreta el estribillo de una canción para el grupo.", kind: "ATTACK", category: "reto", emoji: "🎤", sortOrder: 4 },
  { id: "acento", name: "Habla con acento 10 min", description: "Inventa un acento y mantenlo durante diez minutos.", kind: "ATTACK", category: "reto", emoji: "🎭", sortOrder: 5 },
  { id: "foto-ridicula", name: "Foto ridícula", description: "Posa para la foto más absurda del viaje.", kind: "ATTACK", category: "reto", emoji: "📸", sortOrder: 6 },
  { id: "invita-ronda", name: "Invita a una ronda", description: "Invita al grupo a una ronda que acordéis entre todos.", kind: "ATTACK", category: "social", emoji: "🍹", sortOrder: 7 },
  { id: "cuenta-secreto", name: "Cuenta un secreto", description: "Comparte una anécdota que el grupo aún no conozca.", kind: "ATTACK", category: "social", emoji: "🤫", sortOrder: 8 },
  { id: "escudo", name: "Escudo", description: "Anula un ataque recibido antes de que termine el tiempo.", kind: "REACTION", category: "defensa", reactionEffect: "BLOCK", emoji: "🛡️", sortOrder: 9 },
  { id: "boomerang", name: "Boomerang", description: "Devuelve el ataque a quien lo lanzó. No admite otra reacción.", kind: "REACTION", category: "defensa", reactionEffect: "REFLECT", emoji: "🪃", sortOrder: 10 },
];
