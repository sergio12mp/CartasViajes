"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="panel space-y-4"><h1>No hemos podido cargar la página</h1><p className="text-ink-soft">Inténtalo de nuevo dentro de un momento.</p><button className="btn" onClick={reset}>Reintentar</button></section>; }
