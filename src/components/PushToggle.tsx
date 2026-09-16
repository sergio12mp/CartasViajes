"use client";
import { useEffect, useState } from "react";
import { subscribePush, unsubscribePush } from "@/app/actions/push";
type Status = "checking" | "unsupported" | "needs-install" | "denied" | "off" | "on" | "busy";
function toKey(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}
export function PushToggle({ publicKey }: { publicKey: string | null }) {
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) { setStatus("unsupported"); return; }
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    if (ios && !standalone) { setStatus("needs-install"); return; }
    navigator.serviceWorker.register("/sw.js").then(async registration => {
      const existing = await registration.pushManager.getSubscription();
      setStatus(existing ? "on" : Notification.permission === "denied" ? "denied" : "off");
    }).catch(() => setStatus("unsupported"));
  }, [publicKey]);
  async function enable() {
    setStatus("busy"); setMessage("");
    try {
      if (await Notification.requestPermission() !== "granted") { setStatus("denied"); return; }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(publicKey!) });
      const result = await subscribePush({ ...subscription.toJSON(), userAgent: navigator.userAgent.slice(0, 300) });
      if (!result.ok) { await subscription.unsubscribe(); setStatus("off"); setMessage(result.message); return; }
      setStatus("on"); setMessage(result.message);
    } catch { setStatus("off"); setMessage("No se pudieron activar las notificaciones en este dispositivo."); }
  }
  async function disable() {
    setStatus("busy"); setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) { await unsubscribePush(subscription.endpoint); await subscription.unsubscribe(); }
      setStatus("off"); setMessage("Notificaciones desactivadas.");
    } catch { setStatus("on"); setMessage("No se pudieron desactivar. Inténtalo de nuevo."); }
  }
  if (status === "checking" || status === "unsupported") return null;
  return <section className="panel flex flex-wrap items-center justify-between gap-3">
    <div className="min-w-0 flex-1"><p className="font-semibold">🔔 Notificaciones</p>
      <p className="text-sm text-ink-soft">{status === "needs-install" ? "En iPhone, añade CartasViajes a la pantalla de inicio (Compartir → Añadir a pantalla de inicio) y ábrela desde ahí para recibir avisos." : status === "denied" ? "Has bloqueado las notificaciones. Actívalas en los ajustes del navegador para este sitio." : status === "on" ? "Te avisaremos cuando te lancen una carta o respondan a la tuya." : "Recibe un aviso cuando te lancen una carta, aunque tengas la app cerrada."}</p>
      {message && <p role="status" className="mt-1 text-xs text-muted">{message}</p>}
    </div>
    {status === "off" && <button type="button" className="btn" onClick={enable}>Activar</button>}
    {status === "on" && <button type="button" className="btn-secondary" onClick={disable}>Desactivar</button>}
    {status === "busy" && <button type="button" className="btn-secondary" disabled>Un momento…</button>}
  </section>;
}
