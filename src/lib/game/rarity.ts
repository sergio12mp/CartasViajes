export type RarityKey = "COMMON" | "RARE" | "LEGENDARY";
export const rarityOrder: RarityKey[] = ["LEGENDARY", "RARE", "COMMON"];
export const rarityLabels: Record<RarityKey, string> = { COMMON: "Común", RARE: "Rara", LEGENDARY: "Legendaria" };
export const rarityPluralLabels: Record<RarityKey, string> = { COMMON: "comunes", RARE: "raras", LEGENDARY: "legendarias" };
export const rarityClass: Record<RarityKey, string> = { COMMON: "card-common", RARE: "card-rare", LEGENDARY: "card-legendary" };
export const rarityBadgeClass: Record<RarityKey, string> = { COMMON: "badge-common", RARE: "badge-rare", LEGENDARY: "badge-legendary" };
