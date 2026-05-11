import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { getBranding } from "@/lib/managerBranding";
import { Trophy, Crown, Medal, ArrowUp, ArrowDown, ChevronsUpDown, X, Star } from "lucide-react";
import logo from "@/assets/fpl-super-league-logo.png";

export const Route = createFileRoute("/table")({
  component: TablePage,
  head: () => ({
    meta: [
      { title: "All-Time League Table — FPL Super League" },
      { name: "description", content: "The definitive all-time league standings across every season ever played." },
    ],
  }),
});

type SortKey =
  | "rank" | "seasons" | "played" | "wins" | "draws" | "losses"
  | "pf" | "pa" | "pd" | "ppg" | "pts" | "winpct" | "best" | "titles";

const COLS: { key: SortKey; label: string; tip: string; align: "left" | "center" | "right" }[] = [
  { key: "rank", label: "#", tip: "Rank", align: "left" },
  { key: "seasons", label: "S", tip: "Seasons Played", align: "center" },
  { key: "played", label: "P", tip: "Matches Played", align: "center" },
  { key: "wins", label: "W", tip: "Wins", align: "center" },
  { key: "draws", label: "D", tip: "Draws", align: "center" },
  { key: "losses", label: "L", tip: "Losses", align: "center" },
  { key: "pf", label: "PF", tip: "FPL Points For", align: "right" },
  { key: "pa", label: "PA", tip: "FPL Points Against", align: "right" },
  { key: "pd", label: "PD", tip: "FPL Points Difference", align: "right" },
  { key: "ppg", label: "PPG", tip: "League Points per Game", align: "right" },
  { key: "winpct", label: "Win%", tip: "Win Percentage", align: "right" },
  { key: "best", label: "Best", tip: "Best season finish", align: "center" },
  { key: "titles", label: "T", tip: "Titles", align: "center" },
  { key: "pts", label: "Pts", tip: "Total League Points (3W/1D)", align: "right" },
];

type AwardKey = "wins" | "pf" | "pa" | "ppg" | "winpct" | "titles" | "pts" | "draws" | "losses" | "pd" | "spoons";

function TablePage() {
  const [d, setD] = useState<any>(null);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  
  const [openAward, setOpenAward] = useState<AwardKey | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("alltime_table").select("*"),
      supabase.from("managers").select("*"),
      supabase.from("seasons").select("*"),
      supabase.from("season_standings").select("season_id,manager_id,position"),
    ]).then(([a, m, s, st]) => setD({ alltime: a.data ?? [], managers: m.data ?? [], seasons: s.data ?? [], standings: st.data ?? [] }));
  }, []);

  const spoonsByMgr = useMemo(() => {
    if (!d) return new Map<string, number>();
    // Group standings by season, find max position per season => last place
    const bySeason = new Map<string, any[]>();
    for (const r of d.standings) {
      const k = String(r.season_id);
      if (!bySeason.has(k)) bySeason.set(k, []);
      bySeason.get(k)!.push(r);
    }
    const counts = new Map<string, number>();
    for (const arr of bySeason.values()) {
      const maxPos = Math.max(...arr.map((x) => x.position ?? 0));
      for (const x of arr) {
        if (x.position === maxPos) {
          const k = String(x.manager_id);
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
      }
    }
    return counts;
  }, [d]);

  const enriched = useMemo(() => {
    if (!d) return [];
    const mapped = [...d.alltime].map((r) => {
        const w = r.total_wins ?? 0;
        const dr = r.total_draws ?? 0;
        const l = r.total_losses ?? 0;
        const games = w + dr + l;
        const pf = Number(r.total_points_for ?? 0);
        const pa = Number(r.total_points_against ?? 0);
        const pd = Number(r.total_points_difference ?? (pf - pa));
        return {
          ...r,
          _ppgRaw: games ? (Number(r.total_league_points ?? 0)) / games : 0,
          _played: games,
          _wins: w, _draws: dr, _losses: l,
          _pf: pf, _pa: pa, _pd: pd,
          _ppg: games ? (Number(r.total_league_points ?? 0)) / games : 0,
          _winpct: r.win_percentage != null ? Number(r.win_percentage) : (games ? (w / games) * 100 : 0),
          _pts: r.total_league_points ?? 0,
          _best: r.best_finish ?? null,
          _titles: r.titles_won ?? 0,
          _spoons: spoonsByMgr.get(String(r.manager_id)) ?? 0,
        };
      });
    return mapped
      .sort((a, b) => (b._titles - a._titles) || (b._ppgRaw - a._ppgRaw) || (b._pf - a._pf))
      .map((r, i) => ({ ...r, _rank: i + 1 }));
  }, [d, spoonsByMgr]);

  const rows = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const keyMap: Record<SortKey, (r: any) => number> = {
      rank: (r) => r._rank,
      seasons: (r) => r.seasons_played ?? 0,
      played: (r) => r._played,
      wins: (r) => r._wins,
      draws: (r) => r._draws,
      losses: (r) => r._losses,
      pf: (r) => r._pf,
      pa: (r) => r._pa,
      pd: (r) => r._pd,
      ppg: (r) => r._ppg,
      pts: (r) => r._pts,
      winpct: (r) => r._winpct,
      best: (r) => r._best == null ? Number.MAX_SAFE_INTEGER : r._best,
      titles: (r) => r._titles,
    };
    const f = keyMap[sortKey];
    return [...enriched].sort((a, b) => (f(a) - f(b)) * dir);
  }, [enriched, sortKey, sortDir]);

  if (!d) return <div className="max-w-7xl mx-auto px-4 py-20"><Skeleton className="h-96" /></div>;

  const mById = (id: any) => d.managers.find((m: any) => String(m.id) === String(id));
  const tintFor = (id: any) => getBranding(String(id))?.primary ?? "#d4af37";

  // Award definitions — each is a top-5 leaderboard
  type AwardDef = { key: AwardKey; label: string; sortBy: (r: any) => number; format: (r: any) => string; valueLabel: string; tone?: "positive" | "negative" };
  const POSITIVE_AWARDS: AwardDef[] = [
    { key: "titles", label: "Most Titles", sortBy: (r) => r._titles, format: (r) => String(r._titles), valueLabel: "Titles", tone: "positive" },
    { key: "ppg", label: "Points / Game", sortBy: (r) => r._ppg, format: (r) => r._ppg.toFixed(2), valueLabel: "PPG", tone: "positive" },
    { key: "pts", label: "League Points", sortBy: (r) => r._pts, format: (r) => String(r._pts), valueLabel: "Pts", tone: "positive" },
    { key: "pf", label: "FPL Points", sortBy: (r) => r._pf, format: (r) => Math.round(r._pf).toLocaleString(), valueLabel: "PF", tone: "positive" },
    { key: "winpct", label: "Win %", sortBy: (r) => r._played >= 20 ? r._winpct : -1, format: (r) => `${r._winpct.toFixed(1)}%`, valueLabel: "Win%", tone: "positive" },
    { key: "wins", label: "Most Wins", sortBy: (r) => r._wins, format: (r) => String(r._wins), valueLabel: "Wins", tone: "positive" },
    { key: "pd", label: "Biggest Points Difference", sortBy: (r) => r._pd, format: (r) => (r._pd >= 0 ? "+" : "") + Math.round(r._pd).toLocaleString(), valueLabel: "PD", tone: "positive" },
  ];
  const NEGATIVE_AWARDS: AwardDef[] = [
    { key: "draws", label: "Most Draws", sortBy: (r) => r._draws, format: (r) => String(r._draws), valueLabel: "Draws", tone: "negative" },
    { key: "losses", label: "Most Losses", sortBy: (r) => r._losses, format: (r) => String(r._losses), valueLabel: "Losses", tone: "negative" },
    { key: "pa", label: "Most Points Against", sortBy: (r) => r._pa, format: (r) => Math.round(r._pa).toLocaleString(), valueLabel: "PA", tone: "negative" },
    { key: "spoons", label: "Most Wooden Spoons", sortBy: (r) => r._spoons, format: (r) => `${r._spoons} 🥄`, valueLabel: "Spoons", tone: "negative" },
  ];
  const AWARDS: AwardDef[] = [...POSITIVE_AWARDS, ...NEGATIVE_AWARDS];
  const top5For = (a: AwardDef) => [...enriched].sort((x, y) => a.sortBy(y) - a.sortBy(x)).slice(0, 5);
  const leaderFor = (a: AwardDef) => top5For(a)[0];

  // Header podium = top 3 by League Points (the canonical ranking)
  const podium = [...enriched].sort((a, b) => b._pts - a._pts).slice(0, 3);
  const totalGames = enriched.reduce((s, r) => s + r._played, 0) / 2;
  const totalPoints = enriched.reduce((s, r) => s + r._pf, 0);

  const setSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir(defaultSortDir(k)); }
  };

  const openAwardDef = AWARDS.find((a) => a.key === openAward) ?? null;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 ucl-stars opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: "radial-gradient(circle, hsl(45 90% 55%) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex-shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-gold/40" />
              <div className="absolute inset-4 rounded-full border border-gold/25" />
              <div className="absolute inset-6 rounded-full blur-2xl pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(45 90% 55%) 0%, transparent 70%)", opacity: 0.55 }} />
              <img src={logo} alt="" className="relative w-full h-full object-contain p-6 drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]" />
              <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 text-gold drop-shadow-lg" />
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xs uppercase tracking-[0.35em] text-gold mb-4">Eternal Standings</div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-4">
                <span className="gold-gradient">ALL-TIME TABLE</span>
              </h1>
              <div className="h-px w-24 bg-gold/60 my-6 mx-auto lg:mx-0" />
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Every win. Every loss. Every point. The undisputed ranking across every season.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-2xl">
                <MiniStat label="Managers" value={enriched.length} />
                <MiniStat label="Seasons" value={d.seasons.length} />
                <MiniStat label="Matches" value={Math.round(totalGames).toLocaleString()} />
                <MiniStat label="FPL Pts" value={totalPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULL TABLE — first thing after hero */}
      <section className="max-w-7xl mx-auto px-1 sm:px-4 pt-12 md:pt-16">
        <div className="flex items-end justify-between mb-3 flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">The Full Standings</div>
            <h2 className="font-display text-3xl md:text-4xl">All-Time Rankings</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Sorted by <span className="text-gold font-bold">{COLS.find((c) => c.key === sortKey)?.label}</span> — tap any column to re-sort.
            </p>
          </div>
        </div>

        <div className="md:hidden mb-3 flex gap-2">
          <select
            value={sortKey}
            onChange={(e) => {
              const next = e.target.value as SortKey;
              setSortKey(next);
              setSortDir(defaultSortDir(next));
            }}
            className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground"
            aria-label="Sort all-time table"
          >
            {COLS.map((c) => <option key={c.key} value={c.key}>{c.tip}</option>)}
          </select>
          <button
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-gold"
          >
            {sortDir === "asc" ? "ASC" : "DESC"}
          </button>
        </div>

        <div className="md:hidden space-y-2">
          {rows.map((r: any) => {
            const m = mById(r.manager_id);
            const b = getBranding(String(r.manager_id));
            const tint = b?.primary ?? "#d4af37";
            const pdPositive = r._pd > 0;
            const pdZero = r._pd === 0;
            return (
              <Link
                key={r.manager_id}
                to="/team/$managerId"
                params={{ managerId: String(r.manager_id) }}
                className="block rounded-lg border border-border/70 bg-card/70 p-2"
                style={{ borderLeftColor: tint, borderLeftWidth: 4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-lg text-gold w-6">{r._rank}</span>
                  {b?.badge ? (
                    <img src={b.badge} alt="" className="w-7 h-7 object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: tint }}>
                      {(m?.name ?? r.manager_name ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="capitalize font-bold text-sm truncate">{m?.name ?? r.manager_name}</span>
                  <span className="ml-auto font-display text-gold text-base tabular-nums">{r._ppg.toFixed(1)}</span>
                </div>
                <div className="grid grid-cols-7 gap-px text-center text-[9px] leading-tight">
                  <MobileStat label="S" value={r.seasons_played ?? "—"} />
                  <MobileStat label="P" value={r._played} />
                  <MobileStat label="W" value={r._wins} valueClass="text-emerald-400" />
                  <MobileStat label="D" value={r._draws} />
                  <MobileStat label="L" value={r._losses} valueClass="text-red-400/90" />
                  <MobileStat label="PF" value={compactNumber(r._pf)} />
                  <MobileStat label="PA" value={compactNumber(r._pa)} />
                  <MobileStat label="PD" value={`${pdPositive ? "+" : ""}${compactNumber(r._pd)}`} valueClass={pdPositive ? "text-emerald-400" : pdZero ? "text-muted-foreground" : "text-red-400"} />
                  <MobileStat label="PPG" value={r._ppg.toFixed(1)} valueClass="text-gold" />
                  <MobileStat label="Win" value={`${r._winpct.toFixed(0)}%`} />
                  <MobileStat label="Best" value={r._best ? ord(r._best) : "—"} />
                  <MobileStat label="T" value={r._titles || "—"} valueClass={r._titles ? "text-gold" : ""} />
                  <MobileStat label="Pts" value={r._pts} valueClass="text-gold" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:block premium-card rounded-lg overflow-hidden">
          <table className="w-full table-fixed text-[7px] min-[390px]:text-[8px] sm:text-sm leading-tight">
            <thead className="bg-card/80 text-[7px] min-[390px]:text-[8px] sm:text-xs uppercase tracking-normal sm:tracking-wider text-muted-foreground sticky top-0 z-10">
              <tr>
                <SortTh col={COLS[0]} active={sortKey === "rank"} dir={sortDir} onClick={() => setSort("rank")} />
                <th className="px-0.5 py-1 sm:p-3 text-left w-[7%]">Mgr</th>
                {COLS.slice(1).map((c) => (
                  <SortTh key={c.key} col={c} active={sortKey === c.key} dir={sortDir} onClick={() => setSort(c.key)} />
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => {
                const m = mById(r.manager_id);
                const b = getBranding(String(r.manager_id));
                const tint = b?.primary ?? "transparent";
                const isTop3 = r._rank <= 3;
                const pdPositive = r._pd > 0;
                const pdZero = r._pd === 0;
                return (
                  <tr key={r.manager_id} className="border-t border-border/40 hover:bg-gold/5 transition">
                    <td className="px-0.5 py-1 sm:p-3">
                      <div className="flex items-center justify-center sm:justify-start gap-0.5 sm:gap-2">
                        <span className="hidden sm:block w-1 h-8 rounded" style={{ background: tint }} />
                        <span className={`font-display text-[9px] min-[390px]:text-[10px] sm:text-lg ${isTop3 ? "text-gold" : ""}`}>{r._rank}</span>
                      </div>
                    </td>
                    <td className="px-0.5 py-1 sm:p-3 capitalize">
                      <Link to="/team/$managerId" params={{ managerId: String(r.manager_id) }}
                        className="hover:text-gold flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5">
                        {b?.badge ? (
                          <img src={b.badge} alt="" className="w-4 h-4 min-[390px]:w-5 min-[390px]:h-5 sm:w-8 sm:h-8 object-contain flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 min-[390px]:w-5 min-[390px]:h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[7px] min-[390px]:text-[9px] sm:text-xs font-bold text-white flex-shrink-0" style={{ background: tint }}>
                            {(m?.name ?? r.manager_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="hidden sm:inline whitespace-nowrap font-medium">{m?.name ?? r.manager_name}</span>
                      </Link>
                    </td>
                    <td className="text-center px-0.5 py-1 sm:p-3">{r.seasons_played ?? "—"}</td>
                    <td className="text-center px-0.5 py-1 sm:p-3">{r._played}</td>
                    <td className="text-center px-0.5 py-1 sm:p-3 text-emerald-400">{r._wins}</td>
                    <td className="text-center px-0.5 py-1 sm:p-3 text-muted-foreground">{r._draws}</td>
                    <td className="text-center px-0.5 py-1 sm:p-3 text-red-400/90">{r._losses}</td>
                    <td className="text-right px-0.5 py-1 sm:p-3 tabular-nums">{compactNumber(r._pf)}</td>
                    <td className="text-right px-0.5 py-1 sm:p-3 tabular-nums text-muted-foreground">{compactNumber(r._pa)}</td>
                    <td className={`text-right px-0.5 py-1 sm:p-3 tabular-nums font-medium ${pdPositive ? "text-emerald-400" : pdZero ? "text-muted-foreground" : "text-red-400"}`}>
                      {pdPositive ? "+" : ""}{compactNumber(r._pd)}
                    </td>
                    <td className="text-right px-0.5 py-1 sm:p-3 tabular-nums font-bold">{r._ppg.toFixed(1)}</td>
                    <td className="text-right px-0.5 py-1 sm:p-3 tabular-nums">{r._winpct.toFixed(0)}%</td>
                    <td className="text-center px-0.5 py-1 sm:p-3">
                      {r._best ? <span className={r._best === 1 ? "text-gold font-display" : ""}>{ord(r._best)}</span> : "—"}
                    </td>
                    <td className="text-center px-0.5 py-1 sm:p-3">
                      {r._titles > 0 ? (
                        <span className="inline-flex items-center justify-center gap-0.5 sm:gap-1 text-gold font-display">
                          <Trophy className="hidden sm:block w-3.5 h-3.5" />{r._titles}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="text-right px-0.5 py-1 sm:p-3 font-display text-gold text-[8px] min-[390px]:text-[9px] sm:text-base tabular-nums">{r._pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span><b className="text-white">S</b> Seasons</span>
          <span><b className="text-white">P</b> Played</span>
          <span><b className="text-white">W/D/L</b> Wins/Draws/Losses</span>
          <span><b className="text-white">PF/PA/PD</b> FPL Points For/Against/Difference</span>
          <span><b className="text-white">PPG</b> FPL Points per Game</span>
          <span><b className="text-white">Best</b> Best season finish</span>
          <span><b className="text-white">T</b> Titles</span>
          <span><b className="text-white">Pts</b> League Points (3W/1D)</span>
        </div>
      </section>

      {/* AWARDS — clickable, team-coloured */}
      <section className="max-w-7xl mx-auto px-4 pb-20 border-t border-border/50 pt-16">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Category Leaders</div>
          <h2 className="font-display text-3xl md:text-4xl">All-Time Awards</h2>
          <p className="text-sm text-muted-foreground mt-3">Tap any award to see the top 5</p>
        </div>

        {(() => {
          const renderCard = (a: AwardDef) => {
            const leader = leaderFor(a);
            if (!leader) return null;
            const m = mById(leader.manager_id);
            const b = getBranding(String(leader.manager_id));
            const tint = a.tone === "negative" ? "#b34747" : tintFor(leader.manager_id);
            return (
              <button
                key={a.key}
                onClick={() => setOpenAward(a.key)}
                className="text-left rounded-xl p-5 border border-white/10 hover:border-white/40 transition relative overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, ${tint}45 0%, ${tint}12 55%, rgba(10,17,48,0.7) 100%)`,
                }}
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition" style={{ background: tint }} />
                <div className="relative">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold">{a.label}</div>
                  <div className="font-display text-3xl md:text-4xl text-white mt-1 leading-none">{a.format(leader)}</div>
                  <div className="flex items-center gap-2 mt-4">
                    {b?.badge ? (
                      <img src={b.badge} alt="" className="w-7 h-7 object-contain" />
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: tint }}>
                        {(m?.name ?? leader.manager_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-bold capitalize text-white truncate">{m?.name ?? leader.manager_name}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-widest mt-3 opacity-70" style={{ color: tint }}>
                    Tap for top 5 →
                  </div>
                </div>
              </button>
            );
          };
          return (
            <>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-bold">Positive</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {POSITIVE_AWARDS.map(renderCard)}
              </div>
              <div className="flex items-center gap-3 mt-12 mb-4">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
                <span className="text-xs uppercase tracking-[0.3em] text-red-400 font-bold">Negative</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {NEGATIVE_AWARDS.map(renderCard)}
              </div>
            </>
          );
        })()}
      </section>

      {/* Award top-5 modal */}
      {openAwardDef && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenAward(null)}
        >
          <div
            className="bg-card border border-border rounded-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenAward(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-xs uppercase tracking-[0.3em] text-gold">Top 5</div>
            <h3 className="font-display text-2xl md:text-3xl mt-1 mb-5">{openAwardDef.label}</h3>
            <ol className="space-y-2">
              {top5For(openAwardDef).map((r, i) => {
                const m = mById(r.manager_id);
                const b = getBranding(String(r.manager_id));
                const tint = tintFor(r.manager_id);
                return (
                  <li key={r.manager_id}>
                    <Link
                      to="/team/$managerId"
                      params={{ managerId: String(r.manager_id) }}
                      onClick={() => setOpenAward(null)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/40 transition"
                      style={{ background: `linear-gradient(90deg, ${tint}25 0%, transparent 80%)` }}
                    >
                      <span className={`font-display text-xl w-6 text-center ${i === 0 ? "text-gold" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      {b?.badge ? (
                        <img src={b.badge} alt="" className="w-9 h-9 object-contain" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: tint }}>
                          {(m?.name ?? r.manager_name ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="flex-1 capitalize font-medium truncate">{m?.name ?? r.manager_name}</span>
                      <span className="font-display text-lg text-gold tabular-nums">{openAwardDef.format(r)}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function SortTh({ col, active, dir, onClick }: { col: typeof COLS[number]; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <th
      className={`px-0.5 py-1 sm:p-3 cursor-pointer select-none hover:text-white transition text-${col.align} ${active ? "text-gold" : ""}`}
      onClick={onClick}
      title={col.tip}
    >
      <span className={`inline-flex items-center gap-0.5 sm:gap-1 ${col.align === "right" ? "justify-end w-full" : col.align === "center" ? "justify-center w-full" : ""}`}>
        {col.label}
        {active
          ? (dir === "asc" ? <ArrowUp className="hidden sm:block w-3 h-3" /> : <ArrowDown className="hidden sm:block w-3 h-3" />)
          : <ChevronsUpDown className="hidden sm:block w-3 h-3 opacity-40" />}
      </span>
    </th>
  );
}

function MiniStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="border-l-2 border-gold pl-3">
      <div className="font-display text-2xl md:text-3xl text-gold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function MobileStat({ label, value, valueClass = "" }: { label: string; value: any; valueClass?: string }) {
  return (
    <div className="bg-background/45 rounded px-0.5 py-1 min-w-0">
      <div className="text-[7px] uppercase text-muted-foreground">{label}</div>
      <div className={`font-bold tabular-nums truncate ${valueClass}`}>{value}</div>
    </div>
  );
}

function defaultSortDir(k: SortKey): "asc" | "desc" {
  return k === "rank" || k === "best" || k === "losses" ? "asc" : "desc";
}

function ord(n: number) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function compactNumber(value: number) {
  return Math.round(value).toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 });
}
