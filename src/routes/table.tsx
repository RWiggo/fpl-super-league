import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { getBranding } from "@/lib/managerBranding";
import { Trophy, Crown, Medal, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
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
  { key: "rank", label: "#", tip: "Rank by League Points", align: "left" },
  { key: "seasons", label: "S", tip: "Seasons Played", align: "center" },
  { key: "played", label: "P", tip: "Matches Played", align: "center" },
  { key: "wins", label: "W", tip: "Wins", align: "center" },
  { key: "draws", label: "D", tip: "Draws", align: "center" },
  { key: "losses", label: "L", tip: "Losses", align: "center" },
  { key: "pf", label: "PF", tip: "Points For (fantasy points scored)", align: "right" },
  { key: "pa", label: "PA", tip: "Points Against", align: "right" },
  { key: "pd", label: "PD", tip: "Points Difference", align: "right" },
  { key: "ppg", label: "PPG", tip: "Points For per game", align: "right" },
  { key: "winpct", label: "Win%", tip: "Win Percentage", align: "right" },
  { key: "best", label: "Best", tip: "Best season finish", align: "center" },
  { key: "titles", label: "T", tip: "Titles won", align: "center" },
  { key: "pts", label: "Pts", tip: "Total League Points", align: "right" },
];

function TablePage() {
  const [d, setD] = useState<any>(null);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    Promise.all([
      supabase.from("alltime_table").select("*"),
      supabase.from("managers").select("*"),
      supabase.from("seasons").select("*"),
    ]).then(([a, m, s]) => setD({ alltime: a.data ?? [], managers: m.data ?? [], seasons: s.data ?? [] }));
  }, []);

  const enriched = useMemo(() => {
    if (!d) return [];
    const baseRanked = [...d.alltime]
      .sort((a, b) => (b.total_league_points ?? 0) - (a.total_league_points ?? 0))
      .map((r, i) => {
        const w = r.total_wins ?? 0;
        const dr = r.total_draws ?? 0;
        const l = r.total_losses ?? 0;
        const games = w + dr + l;
        const pf = Number(r.total_points_for ?? 0);
        const pa = Number(r.total_points_against ?? 0);
        const pd = Number(r.total_points_difference ?? (pf - pa));
        return {
          ...r,
          _rank: i + 1,
          _played: games,
          _wins: w, _draws: dr, _losses: l,
          _pf: pf, _pa: pa, _pd: pd,
          _ppg: games ? pf / games : 0,
          _winpct: r.win_percentage != null ? Number(r.win_percentage) : (games ? (w / games) * 100 : 0),
          _pts: r.total_league_points ?? 0,
          _best: r.best_finish ?? null,
          _titles: r.titles_won ?? 0,
        };
      });
    return baseRanked;
  }, [d]);

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
  const podium = enriched.slice(0, 3);

  // Most wins / most pf / best win% — header awards strip
  const mostWins = [...enriched].sort((a, b) => b._wins - a._wins)[0];
  const mostPF = [...enriched].sort((a, b) => b._pf - a._pf)[0];
  const bestWinPct = [...enriched].filter(r => r._played >= 20).sort((a, b) => b._winpct - a._winpct)[0];
  const totalGames = enriched.reduce((s, r) => s + r._played, 0) / 2; // each game is 2 sides
  const totalPoints = enriched.reduce((s, r) => s + r._pf, 0);

  const setSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(k);
      // Sensible defaults: rank/best/losses ascending; everything else descending
      setSortDir(k === "rank" || k === "best" || k === "losses" ? "asc" : "desc");
    }
  };

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

      {/* PODIUM */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-4xl mx-auto">
          {[1, 0, 2].map((idx) => {
            const r = podium[idx];
            if (!r) return <div key={idx} />;
            const m = mById(r.manager_id);
            const b = getBranding(String(r.manager_id));
            const tint = b?.primary ?? "#d4af37";
            const heights = [180, 240, 150];
            const place = idx + 1;
            const icon = idx === 0 ? <Crown className="w-7 h-7 md:w-9 md:h-9" /> :
              idx === 1 ? <Trophy className="w-6 h-6 md:w-8 md:h-8" /> :
              <Medal className="w-6 h-6 md:w-8 md:h-8" />;
            return (
              <Link key={r.manager_id} to="/team/$managerId" params={{ managerId: String(r.manager_id) }}
                className="flex flex-col items-center group">
                <div className="mb-3" style={{ color: tint }}>{icon}</div>
                {b?.badge ? (
                  <img src={b.badge} alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain mb-2 drop-shadow-lg group-hover:scale-110 transition" />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full mb-2 flex items-center justify-center font-bold text-white text-xl" style={{ background: tint }}>
                    {(m?.name ?? r.manager_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-center capitalize text-white mb-1 px-1 truncate max-w-full">
                  {m?.name ?? r.manager_name}
                </div>
                <div className="font-display text-xl md:text-3xl text-gold mb-3">{r._pts}</div>
                <div
                  className="w-full rounded-t-lg flex items-start justify-center pt-3 font-display text-2xl md:text-4xl text-white relative overflow-hidden"
                  style={{
                    height: `${heights[idx]}px`,
                    background: `linear-gradient(180deg, ${tint}cc 0%, ${tint}55 100%)`,
                    border: `1px solid ${tint}`,
                    borderBottom: 0,
                  }}
                >
                  <span className="relative z-10">{place}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Awards strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-10 max-w-4xl mx-auto">
          <AwardChip label="Most Wins" value={mostWins?._wins ?? 0} who={mById(mostWins?.manager_id)?.name ?? mostWins?.manager_name} tint="hsl(195 80% 55%)" />
          <AwardChip label="Most Points For" value={Math.round(mostPF?._pf ?? 0).toLocaleString()} who={mById(mostPF?.manager_id)?.name ?? mostPF?.manager_name} tint="hsl(15 85% 55%)" />
          <AwardChip label="Best Win %" value={`${(bestWinPct?._winpct ?? 0).toFixed(1)}%`} who={mById(bestWinPct?.manager_id)?.name ?? bestWinPct?.manager_name} tint="hsl(145 70% 50%)" />
        </div>
      </section>

      {/* FULL TABLE */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">The Full Standings</div>
            <h2 className="font-display text-3xl md:text-4xl">All-Time Rankings</h2>
          </div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Tap any column to sort
          </div>
        </div>

        <div className="premium-card rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground sticky top-0">
              <tr>
                {COLS.map((c) => {
                  const active = sortKey === c.key;
                  return (
                    <th
                      key={c.key}
                      className={`p-3 cursor-pointer select-none hover:text-white transition text-${c.align} ${active ? "text-gold" : ""}`}
                      onClick={() => setSort(c.key)}
                      title={c.tip}
                    >
                      <span className={`inline-flex items-center gap-1 ${c.align === "right" ? "justify-end w-full" : ""}`}>
                        {c.label}
                        {active
                          ? (sortDir === "asc"
                            ? <ArrowUp className="w-3 h-3" />
                            : <ArrowDown className="w-3 h-3" />)
                          : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
                      </span>
                    </th>
                  );
                })}
                <th className="p-3 text-left">Manager</th>
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
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-8 rounded" style={{ background: tint }} />
                        <span className={`font-display text-lg ${isTop3 ? "text-gold" : ""}`}>{r._rank}</span>
                      </div>
                    </td>
                    <td className="text-center p-3">{r.seasons_played ?? "—"}</td>
                    <td className="text-center p-3">{r._played}</td>
                    <td className="text-center p-3 text-emerald-400">{r._wins}</td>
                    <td className="text-center p-3 text-muted-foreground">{r._draws}</td>
                    <td className="text-center p-3 text-red-400/90">{r._losses}</td>
                    <td className="text-right p-3 tabular-nums">{Math.round(r._pf).toLocaleString()}</td>
                    <td className="text-right p-3 tabular-nums text-muted-foreground">{Math.round(r._pa).toLocaleString()}</td>
                    <td className={`text-right p-3 tabular-nums font-medium ${pdPositive ? "text-emerald-400" : pdZero ? "text-muted-foreground" : "text-red-400"}`}>
                      {pdPositive ? "+" : ""}{Math.round(r._pd).toLocaleString()}
                    </td>
                    <td className="text-right p-3 tabular-nums">{r._ppg.toFixed(1)}</td>
                    <td className="text-right p-3 tabular-nums">{r._winpct.toFixed(1)}%</td>
                    <td className="text-center p-3">
                      {r._best ? <span className={r._best === 1 ? "text-gold font-display" : ""}>{ord(r._best)}</span> : "—"}
                    </td>
                    <td className="text-center p-3">
                      {r._titles > 0 ? (
                        <span className="inline-flex items-center gap-1 text-gold font-display">
                          <Trophy className="w-3.5 h-3.5" />{r._titles}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="text-right p-3 font-display text-gold text-base tabular-nums">{r._pts}</td>
                    <td className="p-3 capitalize">
                      <Link to="/team/$managerId" params={{ managerId: String(r.manager_id) }}
                        className="hover:text-gold flex items-center gap-2">
                        {b?.badge && <img src={b.badge} alt="" className="w-6 h-6 object-contain" />}
                        <span className="whitespace-nowrap">{m?.name ?? r.manager_name}</span>
                      </Link>
                    </td>
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
          <span><b className="text-white">PF/PA/PD</b> Points For/Against/Difference</span>
          <span><b className="text-white">PPG</b> Points per Game</span>
          <span><b className="text-white">Best</b> Best season finish</span>
          <span><b className="text-white">T</b> Titles</span>
          <span><b className="text-white">Pts</b> League Points (3W/1D)</span>
        </div>
      </section>
    </div>
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

function AwardChip({ label, value, who, tint }: { label: string; value: any; who?: string; tint: string }) {
  return (
    <div className="rounded-lg p-4 border border-white/10 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${tint}30 0%, ${tint}05 100%)` }}>
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-bold">{label}</div>
      <div className="font-display text-2xl text-white mt-1">{value}</div>
      {who && <div className="text-[11px] uppercase tracking-wider mt-1 capitalize" style={{ color: tint }}>{who}</div>}
    </div>
  );
}

function ord(n: number) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
