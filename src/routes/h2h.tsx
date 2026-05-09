import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { getBranding } from "@/lib/managerBranding";
import { Swords, ChevronDown } from "lucide-react";
import logo from "@/assets/fpl-super-league-logo.png";

export const Route = createFileRoute("/h2h")({
  component: H2HPage,
  head: () => ({
    meta: [
      { title: "All-Time H2H Records — FPL Super League" },
      { name: "description", content: "Every head-to-head record between every manager across the league's history." },
    ],
  }),
});

function H2HPage() {
  const [d, setD] = useState<any>(null);
  const [openMgr, setOpenMgr] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("managers").select("*"),
      supabase.from("h2h_records").select("*"),
    ]).then(([m, h]) => {
      const managers = (m.data ?? []).slice().sort((a: any, b: any) => (a.name ?? "").localeCompare(b.name ?? ""));
      setD({ managers, h2h: h.data ?? [] });
      if (managers[0]) setOpenMgr(managers[0].id);
    });
  }, []);

  const recordsByManager = useMemo(() => {
    if (!d) return new Map();
    const map = new Map<string, any[]>();
    for (const m of d.managers) map.set(m.id, []);
    for (const r of d.h2h) {
      // Each h2h row is one pair. Compose from the perspective of A and B.
      const aRow = {
        opponent_id: r.manager_b_id,
        wins: r.manager_a_wins ?? 0,
        losses: r.manager_b_wins ?? 0,
        draws: r.draws ?? 0,
      };
      const bRow = {
        opponent_id: r.manager_a_id,
        wins: r.manager_b_wins ?? 0,
        losses: r.manager_a_wins ?? 0,
        draws: r.draws ?? 0,
      };
      map.get(r.manager_a_id)?.push(aRow);
      map.get(r.manager_b_id)?.push(bRow);
    }
    return map;
  }, [d]);

  if (!d) return <div className="max-w-7xl mx-auto px-4 py-20"><Skeleton className="h-96" /></div>;

  const mById = (id: string) => d.managers.find((m: any) => m.id === id);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 ucl-stars opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl pointer-events-none opacity-50"
          style={{ background: "radial-gradient(circle, hsl(0 85% 55%) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex-shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid hsl(0 85% 55% / 0.4)" }} />
              <div className="absolute inset-4 rounded-full" style={{ border: "1px solid hsl(0 85% 55% / 0.25)" }} />
              <div className="absolute inset-0 rounded-full"
                style={{ background: "conic-gradient(from 90deg, hsl(0 85% 55%) 0%, transparent 25%, hsl(0 70% 35%) 50%, transparent 75%, hsl(0 85% 55%) 100%)", opacity: 0.25 }} />
              <img src={logo} alt="" className="relative w-full h-full object-contain p-6 drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
                style={{ filter: "hue-rotate(140deg) saturate(1.1)" }} />
              <Swords className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 text-red-400 drop-shadow-lg" />
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xs uppercase tracking-[0.35em] text-gold mb-4">Rivalries</div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-4">
                <span className="gold-gradient">H2H RECORDS</span>
              </h1>
              <div className="h-px w-24 bg-gold/60 my-6 mx-auto lg:mx-0" />
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Every battle. Every grudge. Every score settled. Each manager's record against every rival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MANAGER ACCORDIONS */}
      <section className="max-w-7xl mx-auto px-4 py-16 space-y-3">
        {d.managers.map((m: any) => {
          const rows = (recordsByManager.get(m.id) ?? [])
            .map((r: any) => {
              const games = r.wins + r.losses + r.draws;
              return { ...r, games, winpct: games ? r.wins / games : 0 };
            })
            .sort((a: any, b: any) => b.games - a.games || b.winpct - a.winpct);
          const totals = rows.reduce(
            (acc: any, r: any) => ({ w: acc.w + r.wins, d: acc.d + r.draws, l: acc.l + r.losses }),
            { w: 0, d: 0, l: 0 }
          );
          const totalGames = totals.w + totals.d + totals.l;
          const overallPct = totalGames ? (totals.w / totalGames) * 100 : 0;
          const b = getBranding(m.id);
          const tint = b?.primary ?? "#508cff";
          const isOpen = openMgr === m.id;
          return (
            <div key={m.id} className="premium-card rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenMgr(isOpen ? null : m.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition text-left"
                style={{ background: isOpen ? `linear-gradient(90deg, ${tint}25 0%, transparent 60%)` : undefined }}
              >
                <span className="w-1 h-12 rounded" style={{ background: tint }} />
                {b?.badge ? (
                  <img src={b.badge} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: tint }}>
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link to="/team/$managerId" params={{ managerId: m.id }}
                    onClick={(e) => e.stopPropagation()}
                    className="font-display text-xl md:text-2xl capitalize hover:text-gold transition block truncate">
                    {m.name}
                  </Link>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">vs every rival</div>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-display text-lg text-emerald-400">{totals.w}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">W</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-lg text-muted-foreground">{totals.d}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">D</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-lg text-red-400">{totals.l}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">L</div>
                  </div>
                  <div className="text-center pl-3 border-l border-border/40">
                    <div className="font-display text-lg text-gold">{overallPct.toFixed(0)}%</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Win</div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-border/40 p-4 sm:p-6">
                  {rows.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">No head-to-head records yet.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rows.map((r: any) => {
                        const opp = mById(r.opponent_id);
                        if (!opp) return null;
                        const ob = getBranding(opp.id);
                        const oTint = ob?.primary ?? "#508cff";
                        const wPct = r.games ? (r.wins / r.games) * 100 : 0;
                        const dPct = r.games ? (r.draws / r.games) * 100 : 0;
                        const lPct = 100 - wPct - dPct;
                        const verdict = r.wins > r.losses ? "lead" : r.wins < r.losses ? "trail" : "level";
                        const verdictColor = verdict === "lead" ? "text-emerald-400" : verdict === "trail" ? "text-red-400" : "text-muted-foreground";
                        return (
                          <div key={r.opponent_id} className="rounded-lg border border-border/40 p-4 bg-card/30 hover:border-white/30 transition">
                            <div className="flex items-center gap-2 mb-3">
                              {ob?.badge ? (
                                <img src={ob.badge} alt="" className="w-7 h-7 object-contain" />
                              ) : (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: oTint }}>
                                  {opp.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <Link to="/team/$managerId" params={{ managerId: opp.id }} className="text-sm font-bold capitalize hover:text-gold transition truncate flex-1">
                                {opp.name}
                              </Link>
                              <span className={`text-[10px] uppercase tracking-widest font-bold ${verdictColor}`}>{verdict}</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden flex bg-secondary">
                              <div className="bg-emerald-500" style={{ width: `${wPct}%` }} />
                              <div className="bg-muted-foreground/60" style={{ width: `${dPct}%` }} />
                              <div className="bg-red-500/80" style={{ width: `${lPct}%` }} />
                            </div>
                            <div className="grid grid-cols-3 mt-3 text-center text-sm">
                              <div>
                                <div className="font-display text-lg text-emerald-400">{r.wins}</div>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">W</div>
                              </div>
                              <div>
                                <div className="font-display text-lg text-muted-foreground">{r.draws}</div>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">D</div>
                              </div>
                              <div>
                                <div className="font-display text-lg text-red-400">{r.losses}</div>
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">L</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
