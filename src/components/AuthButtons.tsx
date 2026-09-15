import Image from "next/image";
import { auth, signIn, signOut } from "@/auth";
export async function AuthButtons() {
  const session = await auth();
  return session?.user?.id ? <div className="flex items-center gap-3">
    {session.user.image && <Image src={session.user.image} width={32} height={32} alt={session.user.name ?? "Tu avatar"} className="rounded-full" />}
    <span className="hidden text-sm sm:inline">{session.user.name}</span>
    <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="btn-secondary">Salir</button></form>
  </div> : <form action={async () => { "use server"; await signIn("google"); }}><button className="btn">Entrar con Google</button></form>;
}
