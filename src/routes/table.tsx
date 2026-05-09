import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { getBranding } from "@/lib/managerBranding";
import { Trophy, Crown, Medal, ArrowUpDown } from "lucide-react";
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

type SortKey = "rank" | "seasons" | "wins" | "draws" | "losses" | "pf" | "pts" | "winpct" | "titles";

function TablePage() {
  const [d, setD] = useState<any>(null);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    Promise.all([
      supabase.from("alltime_table").select("*"),
      supabase.from("managers").select("*"),
      supabase.from("seasons").select("*"),
    ]).then(([a, m, s]) => setD({ alltime: a.data ?? [], managers: m.data ?? [], seasons: s.data ?? [] }));
  }, []);

  const titleCounts = useMemo(() => {
    if (!d) return {};
    const tc: Record<string, number> = {};
    d.seasons.filter((s: any) => s.champion_manager_id).forEach((s: any) => {
      tc[s.champion_manager_id] = (tc[s.champion_manager_id] ?? 0) + 1;
    });
    return tc;
  }, [d]);

  const rows = useMemo(() => {
    if (!d) return [];
    const baseRanked = [...d.alltime]
      .sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0))
      .map((r, i) => {
        const games = (r.wins ?? 0) + (r.draws ?? 0) + (r.losses ?? 0);
        return {
          ...r,
          _rank: i + 1,
          _games: games,
          _winpct: games ? (r.wins / games) * 100 : 0,
          _titles: titleCounts[r.manager_id] ?? 0,
        };
      });
    const dir = sortDir === "asc" ? 1 : -1;
    const keyMap: Record<SortKey, (r: any) => number> = {
      rank: (r) => -r._rank,
      seasons: (r) => r.seasons_played ?? r.seasons ?? 0,
      wins: (r) => r.wins ?? 0,
      draws: (r) => r.draws ?? 0,
      losses: (r) => r.losses ?? 0,
      pf: (r) => Number(r.points_for ?? 0),
      pts: (r) => r.total_points ?? 0,
      winpct: (r) => r._winpct,
      titles: (r) => r._titles,
    };
    const f = keyMap[sortKey];
    return [...baseRanked].sort((a, b) => (f(a) - f(b)) * dir);
  }, [d, sortKey, sortDir, titleCounts]);

  if (!d) return <div className="max-w-7xl mx-auto px-4 py-20"><Skeleton className="h-96" /></div>;

  const mById = (id: string) => d.managers.find((m: any) => m.id === id);
  const podium = [...d.alltime].sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0)).slice(0, 3);

  const setSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir(k === "rank" ? "asc" : "desc"); }
  };
  const SortTh = ({ k, children, align = "center" }: any) => (
    <th className={`p-3 text-${align} cursor-pointer select-none hover:text-gold transition`} onClick={() => setSort(k)}>
      <span className={`inline-flex items-center gap-1 ${sortKey === k ? "text-gold" : ""}`}>
        {children}
        <ArrowUpDown className="w-3 h-3 opacity-60" />
      </span>
    </th>
  );

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
            </div>
          </div>
        </div>
      </section>

      {/* PODIUM */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-4xl mx-auto">
          {[1, 0, 2].map((idx) => {
            const r = podium[idx];
            if (!r) return <div key={idx} />;
            const m = mById(r.manager_id);
            const b = getBranding(r.manager_id);
            const tint = b?.primary ?? "#d4af37";
            const heights = [180, 240, 150];
            const place = idx + 1;
            const icon = idx === 0 ? <Crown className="w-7 h-7 md:w-9 md:h-9" /> : idx === 1 ? <Trophy className="w-6 h-6 md:w-8 md:h-8" /> : <Medal className="w-6 h-6 md:w-8 md:h-8" />;
            return (
              <Link key={r.manager_id} to="/team/$managerId" params={{ managerId: r.manager_id }} className="flex flex-col items-center group">
                <div className="mb-3" style={{ color: tint }}>{icon}</div>
                {b?.badge ? (
                  <img src={b.badge} alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain mb-2 drop-shadow-lg group-hover:scale-110 transition" />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full mb-2 flex items-center justify-center font-bold text-white text-xl" style={{ background: tint }}>
                    {(m?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-center capitalize text-white mb-1 px-1">{m?.name}</div>
                <div className="font-display text-xl md:text-3xl text-gold mb-3">{r.total_points}</div>
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
      </section>

      {/* FULL TABLE */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">The Full Standings</div>
        <h2 className="font-display text-3xl md:text-4xl mb-6">All-Time Rankings</h2>

        <div className="premium-card rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <SortTh k="rank" align="left">#</SortTh>
                <th className="p-3 text-left">Manager</th>
                <SortTh k="seasons">Sea</SortTh>
                <SortTh k="wins">W</SortTh>
                <SortTh k="draws">D</SortTh>
                <SortTh k="losses">L</SortTh>
                <SortTh k="pf" align="right">PF</SortTh>
                <SortTh k="pts" align="right">Pts</SortTh>
                <SortTh k="winpct" align="right">Win%</SortTh>
                <SortTh k="titles">Titles</SortTh>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => {
                const m = mById(r.manager_id);
                const b = getBranding(r.manager_id);
                const tint = b?.primary ?? "transparent";
                const isTop3 = r._rank <= 3;
                return (
                  <tr key={r.manager_id} className="border-t border-border/40 hover:bg-gold/5 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-8 rounded" style={{ background: tint }} />
                        <span className={`font-display text-lg ${isTop3 ? "text-gold" : ""}`}>{r._rank}</span>
                      </div>
                    </td>
                    <td className="p-3 capitalize">
                      <Link to="/team/$managerId" params={{ managerId: r.manager_id }} className="hover:text-gold flex items-center gap-2">
                        {b?.badge && <img src={b.badge} alt="" className="w-6 h-6 object-contain" />}
                        <span>{m?.name ?? r.manager_name}</span>
                        {r._titles > 0 && <Trophy className="w-3.5 h-3.5 text-gold" />}
                      </Link>
                    </td>
                    <td className="text-center p-3">{r.seasons_played ?? r.seasons ?? "—"}</td>
                    <td className="text-center p-3">{r.wins}</td>
                    <td className="text-center p-3">{r.draws}</td>
                    <td className="text-center p-3">{r.losses}</td>
                    <td className="text-right p-3">{Number(r.points_for ?? 0).toFixed(0)}</td>
                    <td className="text-right p-3 font-display text-gold text-base">{r.total_points}</td>
                    <td className="text-right p-3">{r._winpct.toFixed(1)}%</td>
                    <td className="text-center p-3">{r._titles > 0 ? <span className="text-gold font-display">{r._titles}</span> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
