"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};
type InstallContextValue = {
  ready: boolean;
  installed: boolean;
  available: boolean;
  busy: boolean;
  message: string;
  install: () => Promise<void>;
};
const InstallContext = createContext<InstallContextValue | null>(null);

// Keep the browser's one-use prompt across client-side navigation.
export function InstallProvider({ children }: { children: ReactNode }) {
  const promptRef = useRef<InstallPromptEvent | null>(null);
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    function clearPrompt() {
      promptRef.current = null;
      setAvailable(false);
    }
    function updateDisplayMode() {
      const standalone = displayMode.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setInstalled(standalone);
      if (standalone) clearPrompt();
    }
    function onInstallPrompt(event: Event) {
      event.preventDefault();
      promptRef.current = event as InstallPromptEvent;
      setAvailable(true);
      setMessage("");
    }
    function onInstalled() {
      clearPrompt();
      setInstalled(true);
      setMessage("");
    }
    updateDisplayMode();
    setReady(true);
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    displayMode.addEventListener("change", updateDisplayMode);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener("change", updateDisplayMode);
    };
  }, []);

  async function install() {
    const prompt = promptRef.current;
    if (!prompt) return;
    promptRef.current = null;
    setAvailable(false);
    setBusy(true);
    setMessage("");
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setMessage(choice.outcome === "accepted"
        ? "Instalación solicitada. Cuando termine, busca el icono de Tripu en tu dispositivo."
        : "Puedes instalar Tripu más adelante desde el menú de tu navegador. La guía te muestra cómo.");
    } catch {
      setMessage("No se pudo abrir la instalación. Sigue los pasos de la guía desde el menú de tu navegador.");
    } finally {
      setBusy(false);
    }
  }

  return <InstallContext.Provider value={{ ready, installed, available, busy, message, install }}>{children}</InstallContext.Provider>;
}

export function useInstall() {
  const context = useContext(InstallContext);
  if (!context) throw new Error("La instalación necesita su proveedor de contexto.");
  return context;
}
