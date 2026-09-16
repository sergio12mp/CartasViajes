const categoryPresentation: Record<string, { label: string; emoji: string }> = {
  bebida: { label: "Bebida", emoji: "🥤" },
  carretera: { label: "Carretera", emoji: "🛣️" },
  cocina: { label: "Cocina", emoji: "🍳" },
  complicidad: { label: "Complicidad", emoji: "🤝" },
  confesiones: { label: "Confesiones", emoji: "🤫" },
  cultura: { label: "Cultura", emoji: "🏛️" },
  decisiones: { label: "Decisiones", emoji: "🧭" },
  defensa: { label: "Defensa", emoji: "🛡️" },
  despedida: { label: "Despedida", emoji: "🎉" },
  familia: { label: "Familia", emoji: "🏡" },
  fiesta: { label: "Fiesta", emoji: "🪩" },
  idiomas: { label: "Idiomas", emoji: "💬" },
  juegos: { label: "Juegos", emoji: "🎲" },
  logistica: { label: "Logística", emoji: "🧳" },
  magia: { label: "Magia", emoji: "🪄" },
  musica: { label: "Música", emoji: "🎵" },
  paradas: { label: "Paradas", emoji: "📍" },
  picante: { label: "Picante", emoji: "🌶️" },
  recuerdos: { label: "Recuerdos", emoji: "📸" },
  reto: { label: "Reto", emoji: "🎯" },
  retos: { label: "Retos", emoji: "🎯" },
  roles: { label: "Roles", emoji: "🎭" },
  romantico: { label: "Romántico", emoji: "❤️" },
  social: { label: "Social", emoji: "👋" },
};

export function getCategoryPresentation(category: string) {
  const known = Object.hasOwn(categoryPresentation, category) ? categoryPresentation[category] : undefined;
  const words = category.replace(/[-_]+/g, " ");
  return known ?? { label: words.charAt(0).toLocaleUpperCase("es") + words.slice(1), emoji: "🃏" };
}
