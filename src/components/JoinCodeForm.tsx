"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function JoinCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  return <form onSubmit={event => { event.preventDefault(); router.push(`/join/${code.trim().toUpperCase()}`); }} className="panel space-y-3"><label htmlFor="join-code" className="block font-bold">¿Tienes un código de viaje?</label><div className="flex gap-2"><input id="join-code" value={code} onChange={e => setCode(e.target.value.toUpperCase().trim())} className="min-w-0 font-mono tracking-widest" required minLength={6} maxLength={6} pattern="[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}" title="6 letras o números del código de invitación" placeholder="ABC234" autoCapitalize="characters" autoComplete="off" /><button className="btn">Unirme</button></div></form>;
}
