import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "CartasViajes", description: "Un viaje, tus amigos y una mano de cartas." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><main className="mx-auto max-w-3xl px-4 py-8">{children}</main></body></html>;
}
