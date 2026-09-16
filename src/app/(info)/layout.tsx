import Link from "next/link";
import type { ReactNode } from "react";

// These informational pages are public, including before Google sign-in.
export default function InformationLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-2xl space-y-7"><Link href="/" className="inline-flex min-h-10 items-center text-sm font-medium text-primary">← Volver a Tripu</Link>{children}</div>;
}
