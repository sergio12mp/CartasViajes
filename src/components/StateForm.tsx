"use client";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { initialActionState, type FormAction } from "@/lib/action-state";
export function StateForm({ action, label, pendingLabel = "Guardando…", children, resetOnSuccess = false, className = "space-y-4", secondary = false }: {
  action: FormAction; label: string; pendingLabel?: string; children: ReactNode; resetOnSuccess?: boolean; className?: string; secondary?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => { if (state.ok) { if (resetOnSuccess) form.current?.reset(); if (state.redirectTo) router.push(state.redirectTo); router.refresh(); } }, [state, router, resetOnSuccess]);
  return <form ref={form} action={formAction} className={className}>
    {children}
    {state.message && <p role="status" className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
    <button className={secondary ? "btn-secondary" : "btn"} disabled={pending}>{pending ? pendingLabel : label}</button>
  </form>;
}
