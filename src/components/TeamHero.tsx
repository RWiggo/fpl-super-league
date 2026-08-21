import type { ReactNode } from "react";

type QuickFact = { label: string; value: ReactNode };

export function TeamHero({
  managerName,
  teamName,
  badge,
  primary,
  nickname,
  formerlyKnownAs,
  facts,
  secondaryFacts,
  extras,
  slogan,
  stadium,
  anthem,
}: {
  managerName: string;
  teamName: string;
  badge?: string;
  primary?: string;
  nickname?: string | null;
  formerlyKnownAs?: string[];
  facts: QuickFact[];
  secondaryFacts?: QuickFact[];
  extras?: ReactNode;
  slogan?: string;
  stadium?: { name: string; capacity?: string };
  anthem?: { title: string; artist?: string };
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0 sm:pt-14 md:pt-20">
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-silver/80 mb-1.5 sm:mb-3">
          <span className="inline-block w-6 h-px bg-silver/60" />
          The FPL Super League · Club
        </div>
        {extras && <div className="mb-2 sm:mb-6">{extras}</div>}

        <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr] gap-4 sm:gap-6 md:gap-10 items-center">
          {badge && (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-60"
                style={{ background: `radial-gradient(circle, ${tint} 0%, transparent 70%)` }}
              />
              <img
                src={badge}
                alt={`${teamName} badge`}
                className="relative w-28 h-28 sm:w-28 sm:h-28 md:w-40 md:h-40 lg:w-48 lg:h-48 drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
              />
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-silver/70 mb-1 sm:mb-2">{managerName}</div>
            <h1
              className="font-display text-5xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.95] sm:leading-[0.9] uppercase"
              style={{ color: "var(--foreground)" }}
            >
              {teamName}
            </h1>
            <div className="mt-2 sm:mt-4 h-[2px] w-16 sm:w-20" style={{ background: tint }} />
            {nickname && (
              <div className="mt-2 sm:mt-4 text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em]">
                <span className="text-silver/70">Known as </span>
                <span style={{ color: tint }}>{nickname}</span>
              </div>
            )}
            {slogan && (
              <div className="mt-1.5 sm:mt-3 text-lg md:text-base italic text-silver/80">
                “{slogan}”
              </div>
            )}
            {(stadium || anthem) && (
              <div className="mt-2 sm:mt-5 flex flex-wrap gap-x-4 sm:gap-x-8 gap-y-1 sm:gap-y-2">
                {stadium && (
                  <div className="text-sm sm:text-xs">
                    <span className="uppercase tracking-[0.15em] sm:tracking-[0.2em] text-silver/60">Ground </span>
                    <span className="text-silver/90">
                      {stadium.name}
                      {stadium.capacity && <span className="text-silver/60"> · Cap. {stadium.capacity}</span>}
                    </span>
                  </div>
                )}
                {anthem && (
                  <div className="text-sm sm:text-xs">
                    <span className="uppercase tracking-[0.15em] sm:tracking-[0.2em] text-silver/60">Anthem </span>
                    <span className="text-silver/90">
                      “{anthem.title}”
                      {anthem.artist && <span className="text-silver/60"> — {anthem.artist}</span>}
                    </span>
                  </div>
                )}
              </div>
            )}
            {formerlyKnownAs && formerlyKnownAs.length > 0 && (
              <div className="mt-2 sm:mt-5 max-w-2xl">
                <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-silver/60 mb-1 sm:mb-1.5">Formerly Known As</div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {formerlyKnownAs.map((name, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm bg-black/30 border border-white/10 text-[10px] sm:text-[11px] tracking-wide text-silver/90 backdrop-blur-sm"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick facts strip - UCL "club info" row */}
        {facts.length > 0 && (
          <div className="relative mt-4 sm:mt-10 md:mt-14 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-white/10 bg-black/30 backdrop-blur-sm">
            <div
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid divide-x divide-white/10"
              style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}
            >
              {facts.map((f, i) => (
                <div key={i} className="py-2.5 sm:py-4 md:py-5 px-1 sm:px-2 md:px-5 first:pl-0 flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.25em] text-silver/60 leading-tight">{f.label}</div>
                  <div className="font-display text-3xl sm:text-2xl md:text-3xl lg:text-4xl mt-1 sm:mt-2 leading-none whitespace-nowrap" style={{ color: tint }}>
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
                  <div key={i} className="py-2 sm:py-3 md:py-4 px-1 sm:px-2 md:px-5 first:pl-0 flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                    <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.08em] sm:tracking-[0.22em] text-silver/50 leading-tight">{f.label}</div>
                    <div className="font-display text-xl sm:text-lg md:text-xl lg:text-2xl mt-0.5 sm:mt-1 leading-none whitespace-nowrap" style={{ color: tint }}>
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
