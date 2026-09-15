"use client";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initialActionState, type FormAction } from "@/lib/action-state";
export function ActionForm({ action, fields, label, confirmMessage, secondary = false, disabled = false }: {
  action: FormAction; fields: Record<string, string>; label: string; confirmMessage?: string; secondary?: boolean; disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const router = useRouter();
  useEffect(() => { if (state.ok) { if (state.redirectTo) router.push(state.redirectTo); router.refresh(); } }, [state, router]);
  return <form action={formAction} onSubmit={e => { if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault(); }} className="space-y-2">
    {Object.entries(fields).map(([key, value]) => <input type="hidden" key={key} name={key} value={value} />)}
    <button disabled={pending || disabled} className={secondary ? "btn-secondary" : "btn"}>{pending ? "Un momento…" : label}</button>
    {state.message && <p role="status" className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
  </form>;
}
