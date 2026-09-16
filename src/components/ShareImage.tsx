"use client";
import { useState } from "react";
import { recordShare } from "@/app/actions/share";
type Props = { src: string; filename: string; title: string; text?: string; label: string; kind: "SUMMARY" | "CARD"; tripId?: string; cardTypeId?: string; secondary?: boolean };
export function ShareImage({ src, filename, title, text, label, kind, tripId, cardTypeId, secondary = false }: Props) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  async function share() {
    setState("busy");
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title, text });
      else { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }
      void recordShare({ kind, tripId, cardTypeId });
      setState("done");
    } catch (error) { setState((error as { name?: string }).name === "AbortError" ? "idle" : "error"); }
  }
  return <div className="space-y-1"><button type="button" className={secondary ? "btn-secondary" : "btn"} onClick={share} disabled={state === "busy"}>{state === "busy" ? "Preparando imagen…" : label}</button>
    {state === "done" && <p role="status" className="text-xs text-success">¡Listo para presumir!</p>}
    {state === "error" && <p role="status" className="text-xs text-danger">No se pudo generar la imagen. Inténtalo de nuevo.</p>}</div>;
}
