"use client";
import { useEffect } from "react";
const SCRIPT = "https://www.tiktok.com/embed.js";
// TikTok's script scans the DOM once on load, so it is re-inserted after each mount to catch client navigations.
export function TikTokEmbed({ url, videoId, title }: { url: string; videoId: string; title?: string | null }) {
  useEffect(() => {
    document.querySelector(`script[src="${SCRIPT}"]`)?.remove();
    const script = document.createElement("script");
    script.src = SCRIPT; script.async = true;
    document.body.appendChild(script);
  }, [videoId]);
  return <blockquote className="tiktok-embed mx-auto w-full max-w-[325px]" cite={url} data-video-id={videoId} style={{ minHeight: 500 }}>
    <section><a href={url} target="_blank" rel="noopener noreferrer">{title ?? "Ver en TikTok"}</a></section>
  </blockquote>;
}
