import type { ReactNode } from "react";

export function PageHero({ kicker, title, subtitle, children }: { kicker?: string; title: ReactNode; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 pitch-lines opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {kicker && <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{kicker}</div>}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-4">{title}</h1>
        {subtitle && <div className="text-lg md:text-xl text-muted-foreground max-w-3xl">{subtitle}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
