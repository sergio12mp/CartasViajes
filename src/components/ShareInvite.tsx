"use client";
import { useState } from "react";
import { recordShare } from "@/app/actions/share";
export function ShareInvite({ tripId, tripName, code }: { tripId: string; tripName: string; code: string }) {
  const [message, setMessage] = useState("");
  async function share() {
    const url = new URL(`/join/${code}`, window.location.origin).href;
    const text = `Te espero en «${tripName}» en Tripu. Entra, elige tu nombre y prepárate: ${url}`;
    try {
      if (navigator.share) { await navigator.share({ title: `Únete a ${tripName}`, text, url }); setMessage("Invitación compartida."); }
      else { await navigator.clipboard.writeText(text); setMessage("Invitación copiada."); }
      void recordShare({ kind: "INVITE", tripId });
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") return;
      setMessage(`Copia este enlace: ${url}`);
    }
  }
  return <div className="space-y-2"><button className="btn" onClick={share}>Invitar amigos ↗</button>{message && <p className="break-all text-sm" role="status">{message}</p>}</div>;
}
