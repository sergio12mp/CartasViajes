"use client";
export function DealRulesEditor({ categories, rules, onChange }: { categories: string[]; rules: Record<string, number>; onChange: (category: string, value: number) => void }) {
  const total = categories.reduce((sum, category) => sum + (rules[category] ?? 0), 0);
  return <div className="space-y-3">{categories.length === 0 && <p className="text-sm text-muted">Selecciona cartas para configurar el reparto.</p>}
    {categories.map(category => <label key={category} className="flex items-center justify-between gap-4"><span className="capitalize">{category}</span><span className="flex items-center gap-2"><input className="max-w-24" type="number" min={0} max={100} value={rules[category] ?? 0} onChange={e => onChange(category, Number(e.target.value))} aria-label={`Cartas de ${category} por jugador`} /><span className="text-xs text-muted">por jugador</span></span></label>)}
    <p className="rounded-xl bg-bg p-3 text-sm font-semibold">{total} cartas por jugador · reparto al azar, con repetición</p>
  </div>;
}
