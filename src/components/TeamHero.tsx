import type { ReactNode } from "react";

type QuickFact = { label: string; value: ReactNode };

export function TeamHero({
  managerName,
  teamName,
  badge,
  primary,
  nickname,
  seasonsBadges,
  facts,
  secondaryFacts,
}: {
  managerName: string;
  teamName: string;
  badge?: string;
  primary?: string;
  nickname?: string | null;
  seasonsBadges?: { season: string; team: string }[];
  facts: QuickFact[];
  secondaryFacts?: QuickFact[];
}) {
  // UCL-style team hero: dark navy base, diagonal team-colour wash on the
  // right, oversized faded crest watermark, crest + name on the left, and
  // a hairline-divided quick-fact strip across the bottom.
  const tint = primary ?? "var(--color-primary)";
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      {/* Base navy + UCL star pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.05_265)] to-[oklch(0.11_0.04_265)]" />
      <div className="absolute inset-0 ucl-stars opacity-50" />

      {/* Diagonal team-colour wash on the right */}
      <div
        className="absolute inset-y-0 right-0 w-[70%] pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 0%, transparent 25%, color-mix(in oklab, ${tint} 28%, transparent) 60%, color-mix(in oklab, ${tint} 45%, transparent) 100%)`,
        }}
      />

      {/* Oversized crest watermark */}
      {badge && (
        <img
          src={badge}
          alt=""
          aria-hidden
          className="absolute -right-16 md:-right-10 top-1/2 -translate-y-1/2 w-[420px] md:w-[560px] lg:w-[680px] opacity-[0.08] pointer-events-none select-none"
        />
      )}

      {/* Top hairline accent bar in team colour */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${tint}, transparent 70%)` }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-0 md:pt-20">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-silver/80 mb-6">
          <span className="inline-block w-6 h-px bg-silver/60" />
          The FPL Super League · Club
        </div>

        <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
          {badge && (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-60"
                style={{ background: `radial-gradient(circle, ${tint} 0%, transparent 70%)` }}
              />
              <img
                src={badge}
                alt={`${teamName} badge`}
                className="relative w-28 h-28 md:w-40 md:h-40 lg:w-48 lg:h-48 drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.3em] text-silver/70 mb-2">{managerName}</div>
            <h1
              className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] uppercase"
              style={{ color: "var(--foreground)" }}
            >
              {teamName}
            </h1>
            <div className="mt-4 h-[2px] w-20" style={{ background: tint }} />
            {seasonsBadges && seasonsBadges.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {seasonsBadges.map((b, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-sm bg-black/30 border border-white/10 text-[10px] uppercase tracking-[0.18em] text-silver/90 backdrop-blur-sm"
                  >
                    <span style={{ color: tint }} className="mr-1.5 font-semibold">{b.season}</span>
                    {b.team}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick facts strip — UCL "club info" row */}
        {facts.length > 0 && (
          <div className="relative mt-10 md:mt-14 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-white/10 bg-black/30 backdrop-blur-sm">
            <div
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid divide-x divide-white/10"
              style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}
            >
              {facts.map((f, i) => (
                <div key={i} className="py-4 md:py-5 px-3 md:px-5 first:pl-0">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-silver/60 leading-tight">{f.label}</div>
                  <div className="font-display text-2xl md:text-3xl lg:text-4xl mt-1" style={{ color: tint }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
            {secondaryFacts && secondaryFacts.length > 0 && (
              <div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid divide-x divide-white/10 border-t border-white/10"
                style={{ gridTemplateColumns: `repeat(${secondaryFacts.length}, minmax(0, 1fr))` }}
              >
                {secondaryFacts.map((f, i) => (
                  <div key={i} className="py-3 md:py-4 px-3 md:px-5 first:pl-0">
                    <div className="text-[9px] uppercase tracking-[0.22em] text-silver/50 leading-tight">{f.label}</div>
                    <div className="font-display text-lg md:text-xl lg:text-2xl mt-0.5" style={{ color: tint }}>
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
