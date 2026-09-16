type LoadingVariant = "trips" | "board" | "form" | "feed";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`loading-skeleton rounded-lg bg-border/50 ${className}`} />;
}

export function LoadingScreen({ title = "Tu próxima aventura, en un momento", description = "Estamos cargando tus viajes y poniendo todo a punto.", variant = "trips" }: {
  title?: string;
  description?: string;
  variant?: LoadingVariant;
}) {
  return <section className="space-y-8" aria-busy="true" aria-label="Cargando contenido">
    <div className="rounded-3xl border border-border bg-surface px-5 py-8 text-center sm:py-10">
      <div aria-hidden="true" className="loading-deck relative mx-auto mb-6 h-24 w-32">
        <span className="loading-card loading-card-left absolute left-4 top-3 h-20 w-14 rounded-xl border-2 border-surface bg-accent shadow-sm" />
        <span className="loading-card loading-card-right absolute right-4 top-3 h-20 w-14 rounded-xl border-2 border-surface bg-ink shadow-sm" />
        <span className="loading-card loading-card-center absolute left-9 top-1 flex h-20 w-14 items-center justify-center rounded-xl border-2 border-surface bg-primary text-2xl text-white shadow-md">✦</span>
      </div>
      <div role="status" aria-live="polite" aria-atomic="true" className="mx-auto max-w-sm space-y-2">
        <h2 className="text-xl sm:text-2xl">{title}</h2>
        <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
      </div>
      <div aria-hidden="true" className="mx-auto mt-5 flex w-fit gap-1.5">
        {[0, 1, 2].map(i => <span key={i} className="loading-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: `${i * 160}ms` }} />)}
      </div>
    </div>
    <div aria-hidden="true" className="space-y-4">
      <div className="flex items-center justify-between"><Skeleton className="h-6 w-36" /><Skeleton className="h-4 w-20" /></div>
      {variant === "form" ? <div className="panel space-y-5">{[0, 1, 2].map(i => <div key={i} className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-12 w-full" /></div>)}</div>
        : variant === "feed" ? <div className="panel space-y-6">{[0, 1, 2].map(i => <div key={i} className="flex gap-3"><Skeleton className="h-10 w-10 shrink-0 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>)}</div>
          : <div className={`grid grid-cols-2 gap-3 ${variant === "board" ? "sm:grid-cols-3" : ""}`}>
            {Array.from({ length: variant === "board" ? 6 : 2 }, (_, i) => <div key={i} className={`panel space-y-4 ${variant === "board" ? "min-h-48" : "min-h-32"}`}>
              <Skeleton className="h-8 w-8" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" />
            </div>)}
          </div>}
    </div>
  </section>;
}
