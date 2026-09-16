"use client";
import Link from "next/link";
import { useState } from "react";
export function TikTokEmbed({ url, videoId, title }: { url: string; videoId: string; title?: string | null }) {
  // Consent applies only to the selected video and is never persisted.
  const [allowedVideo, setAllowedVideo] = useState<string | null>(null);
  const allowed = allowedVideo === videoId;
  return <div className="mx-auto w-full max-w-[325px] space-y-3">
    {allowed ? <>
      <iframe src={`https://www.tiktok.com/player/v1/${encodeURIComponent(videoId)}?autoplay=0`} title={title ? `Vídeo de TikTok: ${title}` : "Vídeo de TikTok"} className="aspect-[9/16] w-full rounded-xl border-0 bg-ink" allow="fullscreen" allowFullScreen referrerPolicy="no-referrer" />
      <button type="button" className="btn-secondary w-full" onClick={() => setAllowedVideo(null)}>Ocultar vídeo</button>
    </> : <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-bg p-5 text-center">
      <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-xl text-primary">▶</span>
      <p className="font-semibold">Tú decides si darle al play</p>
      <p className="text-xs leading-relaxed text-ink-soft">Al cargar este vídeo, TikTok recibe datos de tu conexión y puede usar cookies. Solo se activará este reproductor.</p>
      <Link href="/cookies#videos" className="text-xs text-primary underline underline-offset-4">Información sobre las cookies de TikTok</Link>
      <button type="button" className="btn w-full" onClick={() => setAllowedVideo(videoId)}>Permitir y cargar vídeo</button>
    </div>}
    <a href={url} target="_blank" rel="noopener noreferrer" className="block py-2 text-center text-xs font-medium text-primary underline underline-offset-4">Abrir en TikTok ↗</a>
  </div>;
}
