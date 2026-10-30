import type { ReactNode } from "react";

export function StatTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-xs transition-all duration-200 hover:border-accent/40 hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">{label}</span>
        {icon && <div className="text-accent/80">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-2">{sub}</div>}
    </div>
  );
}
