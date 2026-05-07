import type { ReactNode } from "react";

export function StatCard({ label, value, sub, icon, align = "left" }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; align?: "left" | "center" }) {
  const isCenter = align === "center";
  return (
    <div className="premium-card rounded-lg p-6 group hover:border-gold/50 transition-all hover:-translate-y-1">
      <div className={`flex items-start mb-3 ${isCenter ? "justify-center relative" : "justify-between"}`}>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        {icon && <span className={`text-gold opacity-60 group-hover:opacity-100 transition ${isCenter ? "absolute right-0" : ""}`}>{icon}</span>}
      </div>
      <div className={`font-display text-3xl md:text-4xl gold-gradient ${isCenter ? "text-center" : ""}`}>{value}</div>
      {sub && <div className={`text-xs text-muted-foreground mt-2 ${isCenter ? "text-center" : ""}`}>{sub}</div>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted/40 rounded ${className}`} />;
}
