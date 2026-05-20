import type { ReactNode, MouseEventHandler } from "react";

export function StatCard({
  label,
  value,
  sub,
  icon,
  align = "left",
  onClick,
  hint,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  align?: "left" | "center";
  onClick?: MouseEventHandler<HTMLDivElement>;
  hint?: string;
}) {
  const isCenter = align === "center";
  const clickable = typeof onClick === "function";
  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={`premium-card rounded-lg p-6 group transition-all ${
        clickable ? "cursor-pointer hover:border-gold/70 hover:-translate-y-1" : "hover:border-gold/50 hover:-translate-y-1"
      }`}
    >
      {isCenter ? (
        <div className="flex flex-col items-center text-center">
          {icon && <span className="text-gold opacity-70 mb-2 group-hover:opacity-100 transition">{icon}</span>}
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
          <div className="font-display text-3xl md:text-4xl gold-gradient mt-2">{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-2">{sub}</div>}
          {clickable && hint && (
            <div className="text-[9px] uppercase tracking-[0.25em] text-gold/70 mt-3">{hint}</div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
            {icon && <span className="text-gold opacity-60 group-hover:opacity-100 transition">{icon}</span>}
          </div>
          <div className="font-display text-3xl md:text-4xl gold-gradient">{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-2">{sub}</div>}
          {clickable && hint && (
            <div className="text-[9px] uppercase tracking-[0.25em] text-gold/70 mt-3">{hint}</div>
          )}
        </>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/40 rounded ${className}`} />;
}
