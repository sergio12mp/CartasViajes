"use client";
import { useState } from "react";
export function CopyButton({ path }: { path: string }) {
  const [message, setMessage] = useState("");
  return <div className="space-y-2"><button className="btn-secondary" onClick={async () => {
    const url = new URL(path, window.location.origin).href;
    try { await navigator.clipboard.writeText(url); setMessage("Enlace copiado."); }
    catch { setMessage(`Copia este enlace: ${url}`); }
  }}>Copiar invitación ↗</button>{message && <p className="break-all text-sm" role="status">{message}</p>}</div>;
}
