"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") router.refresh(); };
    const interval = setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", refresh); };
  }, [intervalMs, router]);
  return null;
}
