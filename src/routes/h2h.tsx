import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { getBranding } from "@/lib/managerBranding";
import { currentTeamName } from "@/lib/currentTeamNames";
import { Swords, ChevronDown, Flame, Snowflake, Trophy, Skull } from "lucide-react";

export const Route = createFileRoute("/h2h")({
  component: H2HPage,
  head: () => ({
    meta: [
      { title: "All-Time H2H Records - FPL Super League" },
      { name: "description", content: "Every head-to-head record between every manager across the league's history." },
    ],
  }),
});

type Rivalry = {
  opponent_id: any;
  wins: number;
  draws: number;
  losses: number;
  pf: number;
  pa: number;
  games: number;
  winpct: number;
  diff: number;
};

function H2HPage() {
  const [d, setD] = useState<any>(null);
  const [openMgr, setOpenMgr] = useState<string | null>(null);
  const [openRival, setOpenRival] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("managers").select("*"),
      supabase.from("h2h_records").select("*"),
      supabase.from("fixture_records").select("*"),
    ]).then(([m, h, f]) => {
      const managers = (m.data ?? []).slice().sort((a: any, b: any) => (a.name ?? "").localeCompare(b.name ?? ""));
      setD({ managers, h2h: h.data ?? [], fixtures: f.data ?? [] });
    });
  }, []);

  // Count "unplayed" fixtures per pair (both scores 0 — h2h scores can't legitimately be 0-0)
  const unplayedByPair = useMemo(() => {
    const m = new Map<string, number>();
    if (!d) return m;
    const nameToId = new Map<string, any>();
    for (const mgr of d.managers) nameToId.set(mgr.name, mgr.id);
    for (const f of d.fixtures) {
      if (!(Number(f.home_score) === 0 && Number(f.away_score) === 0)) continue;
      const ha = nameToId.get(f.home_manager);
      const aw = nameToId.get(f.away_manager);
      if (ha == null || aw == null) continue;
      const lo = Math.min(Number(ha), Number(aw));
      const hi = Math.max(Number(ha), Number(aw));
      const k = `${lo}|${hi}`;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, [d]);

  const recordsByManager = useMemo(() => {
    const map = new Map<string, Rivalry[]>();
    if (!d) return map;
    for (const m of d.managers) map.set(String(m.id), []);
    for (const r of d.h2h) {
      const lo = Math.min(Number(r.manager1_id), Number(r.manager2_id));
      const hi = Math.max(Number(r.manager1_id), Number(r.manager2_id));
      const unplayed = unplayedByPair.get(`${lo}|${hi}`) ?? 0;
      const draws = Math.max(0, (r.draws ?? 0) - unplayed);
      const games = Math.max(0, (r.total_played ?? 0) - unplayed);
      const aRow: Rivalry = {
        opponent_id: r.manager2_id,
        wins: r.manager1_wins ?? 0,
        losses: r.manager2_wins ?? 0,
        draws,
        pf: Number(r.manager1_points_for ?? 0),
        pa: Number(r.manager2_points_for ?? 0),
        games,
        winpct: games ? ((r.manager1_wins ?? 0) / games) * 100 : 0,
        diff: Number(r.manager1_points_for ?? 0) - Number(r.manager2_points_for ?? 0),
      };
      const bRow: Rivalry = {
        opponent_id: r.manager1_id,
        wins: r.manager2_wins ?? 0,
        losses: r.manager1_wins ?? 0,
        draws,
        pf: Number(r.manager2_points_for ?? 0),
        pa: Number(r.manager1_points_for ?? 0),
        games,
        winpct: games ? ((r.manager2_wins ?? 0) / games) * 100 : 0,
        diff: Number(r.manager2_points_for ?? 0) - Number(r.manager1_points_for ?? 0),
      };
      map.get(String(r.manager1_id))?.push(aRow);
      map.get(String(r.manager2_id))?.push(bRow);
    }
    return map;
  }, [d, unplayedByPair]);

  // index fixture history by manager-pair: key = "lo|hi" (sorted ids); exclude unplayed 0-0s
  const fixturesByPair = useMemo(() => {
    const m = new Map<string, any[]>();
    if (!d) return m;
    const nameToId = new Map<string, any>();
    for (const mgr of d.managers) nameToId.set(mgr.name, mgr.id);
    for (const f of d.fixtures) {
      if (Number(f.home_score) === 0 && Number(f.away_score) === 0) continue;
      const ha = nameToId.get(f.home_manager);
      const aw = nameToId.get(f.away_manager);
      if (ha == null || aw == null) continue;
      const lo = Math.min(Number(ha), Number(aw));
      const hi = Math.max(Number(ha), Number(aw));
      const k = `${lo}|${hi}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(f);
    }
    return m;
  }, [d]);

  if (!d) return <div className="max-w-7xl mx-auto px-4 py-20"><Skeleton className="h-96" /></div>;

  const mById = (id: any) => d.managers.find((m: any) => String(m.id) === String(id));

  return (
    <div>
      {/* HERO - distinct: crossed swords on a shield */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 ucl-stars opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: "radial-gradient(circle, hsl(0 85% 55%) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex-shrink-0">
              <div
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(50% 0%, 100% 18%, 92% 78%, 50% 100%, 8% 78%, 0% 18%)",
                  background: "linear-gradient(160deg, hsl(0 80% 45%) 0%, hsl(0 70% 25%) 100%)",
                  boxShadow: "0 8px 40px hsl(0 80% 50% / 0.35)",
                }}
              />
              <div
                className="absolute inset-2"
                style={{
                  clipPath: "polygon(50% 0%, 100% 18%, 92% 78%, 50% 100%, 8% 78%, 0% 18%)",
                  background: "linear-gradient(160deg, hsl(0 60% 22%) 0%, hsl(0 30% 12%) 100%)",
                  border: "1.5px solid hsl(0 60% 50% / 0.5)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Swords className="w-24 h-24 sm:w-28 sm:h-28 text-red-300 drop-shadow-[0_4px_18px_rgba(255,80,80,0.55)]" />
              </div>
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xs uppercase tracking-[0.35em] text-gold mb-4">Rivalries</div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-4">
                <span className="gold-gradient">H2H HISTORY</span>
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
          const id = String(m.id);
          const rows = (recordsByManager.get(id) ?? [])
            .filter((r) => r.games > 0)
            .sort((a, b) => b.winpct - a.winpct || b.diff - a.diff);
          const totals = rows.reduce(
            (acc, r) => ({ w: acc.w + r.wins, d: acc.d + r.draws, l: acc.l + r.losses, pf: acc.pf + r.pf, pa: acc.pa + r.pa }),
            { w: 0, d: 0, l: 0, pf: 0, pa: 0 },
          );
          const totalGames = totals.w + totals.d + totals.l;
          const overallPct = totalGames ? (totals.w / totalGames) * 100 : 0;
          const b = getBranding(id);
          const tint = b?.primary ?? "#508cff";
          const isOpen = openMgr === id;
          const bestRival = rows[0];
          const worstRival = rows[rows.length - 1];

          return (
            <div key={id} className="premium-card rounded-lg overflow-hidden">
              <button
                onClick={() => { setOpenMgr(isOpen ? null : id); setOpenRival(null); }}
                className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition text-left"
                style={{ background: isOpen ? `linear-gradient(90deg, ${tint}25 0%, transparent 60%)` : undefined }}
              >
                <span className="w-1 h-12 rounded" style={{ background: tint }} />
                {b?.badge ? (
                  <img src={b.badge} alt="" className="w-12 h-12 object-contain flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: tint }}>
                    {currentTeamName(m.id, m.team_name).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link to="/team/$managerId" params={{ managerId: id }}
                    onClick={(e) => e.stopPropagation()}
                    className="font-display text-base sm:text-xl md:text-2xl capitalize hover:text-gold transition block break-words leading-tight">
                    {currentTeamName(m.id, m.team_name)}
                  </Link>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{rows.length} rivalries · {totalGames} matches</div>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-sm">
                  <Tally label="W" value={totals.w} colorClass="text-emerald-400" />
                  <Tally label="D" value={totals.d} colorClass="text-muted-foreground" />
                  <Tally label="L" value={totals.l} colorClass="text-red-400" />
                  <div className="text-center pl-3 border-l border-border/40">
                    <div className="font-display text-lg text-gold">{overallPct.toFixed(0)}%</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Win</div>
                  </div>
                  <div className="text-center pl-3 border-l border-border/40">
                    <div className={`font-display text-lg ${totals.pf - totals.pa >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {totals.pf - totals.pa >= 0 ? "+" : ""}{(totals.pf - totals.pa).toLocaleString()}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Diff</div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-border/40 p-4 sm:p-6 space-y-6">
                  {/* Best / worst rival highlights */}
                  {bestRival && worstRival && bestRival !== worstRival && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <RivalHighlight kind="best" rivalry={bestRival} oppMgr={mById(bestRival.opponent_id)} />
                      <RivalHighlight kind="worst" rivalry={worstRival} oppMgr={mById(worstRival.opponent_id)} />
                    </div>
                  )}

                  {/* Ranked list of every rivalry */}
                  {rows.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6">No head-to-head records yet.</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
                        Rivalries ranked best → worst
                      </div>
                      {rows.map((r, i) => {
                        const opp = mById(r.opponent_id);
                        if (!opp) return null;
                        const ob = getBranding(String(opp.id));
                        const oTint = ob?.primary ?? "#508cff";
                        const wPct = r.games ? (r.wins / r.games) * 100 : 0;
                        const dPct = r.games ? (r.draws / r.games) * 100 : 0;
                        const lPct = 100 - wPct - dPct;
                        const verdict = r.wins > r.losses ? "lead" : r.wins < r.losses ? "trail" : "level";
                        const vColor =
                          verdict === "lead" ? "text-emerald-400" : verdict === "trail" ? "text-red-400" : "text-muted-foreground";
                        const lo = Math.min(Number(m.id), Number(opp.id));
                        const hi = Math.max(Number(m.id), Number(opp.id));
                        const pairKey = `${id}|${opp.id}`;
                        const isFxOpen = openRival === pairKey;
                        const fixtures = (fixturesByPair.get(`${lo}|${hi}`) ?? []).slice().sort(
                          (a, b) => (a.season_id - b.season_id) || (a.gameweek - b.gameweek),
                        );

                        return (
                          <div key={r.opponent_id} className="rounded-lg border border-border/40 bg-card/30 overflow-hidden">
                            <button
                              onClick={() => setOpenRival(isFxOpen ? null : pairKey)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition text-left"
                            >
                              <span className="font-display text-sm w-6 text-center text-gold/80">{i + 1}</span>
                              {ob?.badge ? (
                                <img src={ob.badge} alt="" className="w-9 h-9 object-contain flex-shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: oTint }}>
                                  {currentTeamName(opp.id, opp.team_name).charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold capitalize break-words leading-tight">{currentTeamName(opp.id, opp.team_name)}</span>
                                  <span className={`text-[9px] uppercase tracking-widest font-bold ${vColor}`}>{verdict}</span>
                                </div>
                                <div className="h-1.5 mt-1.5 rounded-full overflow-hidden flex bg-secondary/60">
                                  <div className="bg-emerald-500" style={{ width: `${wPct}%` }} />
                                  <div className="bg-muted-foreground/60" style={{ width: `${dPct}%` }} />
                                  <div className="bg-red-500/80" style={{ width: `${lPct}%` }} />
                                </div>
                              </div>
                              <div className="hidden sm:grid grid-cols-5 gap-3 text-center">
                                <Mini value={r.wins} label="W" color="text-emerald-400" />
                                <Mini value={r.draws} label="D" color="text-muted-foreground" />
                                <Mini value={r.losses} label="L" color="text-red-400" />
                                <Mini value={`${r.winpct.toFixed(0)}%`} label="Win" color="text-gold" />
                                <Mini
                                  value={`${r.diff >= 0 ? "+" : ""}${r.diff}`}
                                  label="FPL"
                                  color={r.diff >= 0 ? "text-emerald-400" : "text-red-400"}
                                />
                              </div>
                              <div className="sm:hidden text-right">
                                <div className="font-display text-sm">
                                  <span className="text-emerald-400">{r.wins}</span>
                                  <span className="text-muted-foreground">-{r.draws}-</span>
                                  <span className="text-red-400">{r.losses}</span>
                                </div>
                                <div className="text-[9px] uppercase text-muted-foreground tracking-wider">
                                  {r.winpct.toFixed(0)}% · {r.diff >= 0 ? "+" : ""}{r.diff}
                                </div>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isFxOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isFxOpen && (
                              <div className="border-t border-border/40 bg-background/40 p-3 space-y-1.5">
                                {fixtures.length === 0 ? (
                                  <div className="text-xs text-muted-foreground text-center py-3">No fixture history.</div>
                                ) : fixtures.map((f: any, j: number) => {
                                  const youAreHome = f.home_manager === m.name;
                                  const yourScore = youAreHome ? f.home_score : f.away_score;
                                  const theirScore = youAreHome ? f.away_score : f.home_score;
                                  const result = yourScore > theirScore ? "W" : yourScore < theirScore ? "L" : "D";
                                  const resColor = result === "W" ? "bg-emerald-500/25 text-emerald-300 border-emerald-500/40" :
                                    result === "L" ? "bg-red-500/25 text-red-300 border-red-500/40" :
                                    "bg-white/10 text-muted-foreground border-white/20";
                                  return (
                                    <div key={j} className="flex items-center gap-3 text-xs px-2 py-1.5 rounded hover:bg-white/5">
                                      <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold w-6 text-center ${resColor}`}>{result}</span>
                                      <span className="text-muted-foreground tabular-nums w-32 truncate">
                                        {f.season_name} · GW{f.gameweek}
                                      </span>
                                      <span className="font-display tabular-nums text-sm flex-1 text-center">
                                        <span className={result === "W" ? "text-emerald-300" : ""}>{yourScore}</span>
                                        <span className="text-muted-foreground mx-1.5">-</span>
                                        <span className={result === "L" ? "text-red-300" : ""}>{theirScore}</span>
                                      </span>
                                      <span className="text-[10px] uppercase text-muted-foreground tracking-wider hidden sm:inline">
                                        {youAreHome ? "Home" : "Away"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
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

function Tally({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="text-center">
      <div className={`font-display text-lg ${colorClass}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Mini({ value, label, color }: { value: any; label: string; color: string }) {
  return (
    <div>
      <div className={`font-display text-base tabular-nums ${color}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function RivalHighlight({ kind, rivalry, oppMgr }: { kind: "best" | "worst"; rivalry: Rivalry; oppMgr: any }) {
  if (!oppMgr) return null;
  const b = getBranding(String(oppMgr.id));
  const tint = b?.primary ?? "#508cff";
  const isBest = kind === "best";
  const Icon = isBest ? Flame : Snowflake;
  const accent = isBest ? "hsl(15 85% 55%)" : "hsl(200 70% 60%)";
  return (
    <div
      className="relative rounded-lg border border-white/10 p-4 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${accent}25 0%, ${tint}15 70%, rgba(10,17,48,0.6) 100%)` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="p-1.5 rounded" style={{ background: `${accent}30`, color: accent }}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/85">
          {isBest ? "Favourite Opponent" : "Bogey Manager"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {b?.badge ? (
          <img src={b.badge} alt="" className="w-12 h-12 object-contain" />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ background: tint }}>
            {currentTeamName(oppMgr.id, oppMgr.team_name).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link to="/team/$managerId" params={{ managerId: String(oppMgr.id) }} className="font-display text-base sm:text-lg capitalize hover:text-gold transition block break-words leading-tight">
            {currentTeamName(oppMgr.id, oppMgr.team_name)}
          </Link>
          <div className="text-xs text-muted-foreground">
            <span className="text-emerald-400 font-bold">{rivalry.wins}W</span>
            <span className="mx-1">·</span>
            <span>{rivalry.draws}D</span>
            <span className="mx-1">·</span>
            <span className="text-red-400 font-bold">{rivalry.losses}L</span>
            <span className="mx-2">·</span>
            <span className="text-gold font-bold">{rivalry.winpct.toFixed(0)}%</span>
          </div>
        </div>
        {isBest ? <Trophy className="w-6 h-6 text-gold" /> : <Skull className="w-6 h-6 text-blue-300" />}
      </div>
    </div>
  );
}
