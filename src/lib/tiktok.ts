const pattern = /^https:\/\/(?:www\.)?tiktok\.com\/@([\w.-]{1,64})\/video\/(\d{5,25})(?:[/?#].*)?$/i;
export const TIKTOK_URL_HINT = "Pega el enlace completo del vídeo (tiktok.com/@usuario/video/…).";
export function parseTikTokUrl(input: string): { url: string; videoId: string; handle: string } | null {
  const match = pattern.exec(input.trim());
  if (!match) return null;
  const [, handle, videoId] = match;
  return { url: `https://www.tiktok.com/@${handle}/video/${videoId}`, videoId, handle };
}
