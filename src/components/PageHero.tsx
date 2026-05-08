import type { ReactNode } from "react";

export function PageHero({ kicker, title, subtitle, children }: { kicker?: string; title: ReactNode; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      {/* Star field + soft radial glow evoke the UCL hero treatment.
          On team pages, --primary and --gold are overridden so the glow
          and accents take on the team's primary colour. */}
      <div className="absolute inset-0 ucl-stars opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 65%)" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {kicker && <div className="text-xs uppercase tracking-[0.35em] text-gold mb-4">{kicker}</div>}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-4">{title}</h1>
        <div className="h-px w-24 bg-gold/60 my-6" />
        {subtitle && <div className="text-lg md:text-xl text-muted-foreground max-w-3xl">{subtitle}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
