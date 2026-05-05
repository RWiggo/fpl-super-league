import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHero } from "@/components/PageHero";
import { StatCard, Skeleton } from "@/components/StatCard";
import { FormationPitch } from "@/components/FormationPitch";
import { Trophy, Crown, Flame, Target, Zap } from "lucide-react";

export const Route = createFileRoute("/season/$seasonId")({
  component: SeasonPage,
});

function SeasonPage() {
  const { seasonId } = Route.useParams();
  const [d, setD] = useState<any>(null);
  const [gw, setGw] = useState<number>(38);
  const [statTab, setStatTab] = useState<"overall" | "gk" | "out">("overall");
  const [showTeamTOTS, setShowTeamTOTS] = useState<string>("");

  useEffect(() => {
    setD(null);
    (async () => {
      const [season, managers, standings, fixtures, gwTable, streaks, teamStats, overallTOTS, teamTOTS, weeklyHi] = await Promise.all([
        supabase.from("seasons").select("*").eq("id", seasonId).single(),
        supabase.from("managers").select("*"),
        supabase.from("season_standings").select("*").eq("season_id", seasonId),
        supabase.from("fixture_records").select("*").eq("season_id", seasonId),
        supabase.from("gameweek_table").select("*").eq("season_id", seasonId),
        supabase.from("win_streaks").select("*").eq("season_id", seasonId),
        supabase.from("team_season_stats_full").select("*").eq("season_id", seasonId),
        supabase.from("overall_team_of_the_season").select("*").eq("season_id", seasonId),
        supabase.from("team_of_the_season").select("*").eq("season_id", seasonId),
        supabase.from("weekly_high_scores").select("*").eq("season_id", seasonId),
      ]);
      const fixedGW = Math.max(...(fixtures.data?.map((f: any) => f.gameweek) ?? [38]));
      setGw(fixedGW);
      setD({
        season: season.data,
        managers: managers.data ?? [],
        standings: (standings.data ?? []).sort((a: any, b: any) => a.position - b.position),
        fixtures: fixtures.data ?? [],
        gwTable: gwTable.data ?? [],
        streaks: streaks.data ?? [],
        teamStats: teamStats.data ?? [],
        overallTOTS: overallTOTS.data ?? [],
        teamTOTS: teamTOTS.data ?? [],
        weeklyHi: weeklyHi.data ?? [],
      });
      const firstM = managers.data?.[0]?.id;
      if (firstM) setShowTeamTOTS(firstM);
    })();
  }, [seasonId]);

  if (!d || !d.season) return <Skel />;

  const mById = (id: string) => d.managers.find((m: any) => m.id === id);
  const champ = mById(d.season.champion_manager_id);

  const maxGW = Math.max(...d.fixtures.map((f: any) => f.gameweek), 1);
  const gwStandings = d.gwTable
    .filter((r: any) => r.gameweek === gw)
    .sort((a: any, b: any) => a.position - b.position);

  // records
  const sortedFix = [...d.fixtures].filter((f: any) => f.home_score != null);
  const highest = [...sortedFix].sort((a: any, b: any) => Math.max(b.home_score, b.away_score) - Math.max(a.home_score, a.away_score))[0];
  const lowest = [...sortedFix].sort((a: any, b: any) => Math.min(a.home_score, a.away_score) - Math.min(b.home_score, b.away_score))[0];
  const biggestMargin = [...sortedFix].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0))[0];
  const longestWin = [...d.streaks].filter((s: any) => (s.streak_type ?? s.type) === "win" || (s.streak_type ?? s.type) === "W").sort((a: any, b: any) => b.streak_length - a.streak_length)[0];

  const totalGoals = d.fixtures.reduce((acc: number, f: any) => acc + (f.home_score ?? 0) + (f.away_score ?? 0), 0);
  const avgScore = sortedFix.length ? (totalGoals / (sortedFix.length * 2)) : 0;

  // h2h grid
  const grid = useMemo(() => {
    const g: Record<string, Record<string, any>> = {};
    d.managers.forEach((m: any) => { g[m.id] = {}; });
    d.fixtures.forEach((f: any) => {
      if (!g[f.home_manager_id]) g[f.home_manager_id] = {};
      g[f.home_manager_id][f.away_manager_id] = `${f.home_score}-${f.away_score}`;
    });
    return g;
  }, [d]);

  const statKeys = useMemo(() => {
    if (!d.teamStats[0]) return [];
    const skip = new Set(["id", "season_id", "manager_id", "created_at", "updated_at"]);
    return Object.keys(d.teamStats[0]).filter((k) => !skip.has(k) && typeof d.teamStats[0][k] === "number");
  }, [d.teamStats]);

  const filteredStatKeys = statKeys.filter((k) => {
    if (statTab === "gk") return k.toLowerCase().includes("gk") || k.toLowerCase().includes("save") || k.toLowerCase().includes("clean");
    if (statTab === "out") return !k.toLowerCase().includes("gk") && !k.toLowerCase().includes("save") && !k.toLowerCase().includes("clean");
    return true;
  });

  return (
    <div>
      <PageHero
        kicker="Season Archive"
        title={<><span className="gold-gradient">{d.season.name}</span></>}
        subtitle={champ ? <span className="capitalize"><Crown className="inline w-5 h-5 text-gold mr-2" />Champion: <span className="text-gold font-medium">{champ.name}</span> · {champ.team_name}</span> : "Season in progress"}
      >
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          <Mini label="Fixtures" value={d.fixtures.length} />
          <Mini label="Total Pts" value={totalGoals.toFixed(0)} />
          <Mini label="Avg Score" value={avgScore.toFixed(1)} />
        </div>
      </PageHero>

      {/* Final Table */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <SectionTitle kicker="Final Standings" title="League Table" />
        <div className="premium-card rounded-lg overflow-x-auto mt-6">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Manager / Team</th>
                <th className="p-3 text-center">P</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">D</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-right">PF</th>
                <th className="p-3 text-right">PA</th>
                <th className="p-3 text-right">PD</th>
                <th className="p-3 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {d.standings.map((row: any) => {
                const m = mById(row.manager_id);
                const games = (row.wins ?? 0) + (row.draws ?? 0) + (row.losses ?? 0);
                const isChamp = row.position === 1;
                return (
                  <tr key={row.id} className={`border-t border-border/40 hover:bg-gold/5 ${isChamp ? "bg-gold/5" : ""}`}>
                    <td className="p-3 font-display text-lg text-gold">{row.position}</td>
                    <td className="p-3 capitalize">
                      <Link to="/team/$managerId" params={{ managerId: row.manager_id }} className="hover:text-gold flex items-center gap-2">
                        {isChamp && <Trophy className="w-4 h-4 text-gold" />}
                        <div>
                          <div className="font-medium">{m?.name}</div>
                          <div className="text-xs text-muted-foreground">{m?.team_name}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="text-center p-3">{games}</td>
                    <td className="text-center p-3">{row.wins}</td>
                    <td className="text-center p-3">{row.draws}</td>
                    <td className="text-center p-3">{row.losses}</td>
                    <td className="text-right p-3">{Number(row.points_for ?? 0).toFixed(0)}</td>
                    <td className="text-right p-3">{Number(row.points_against ?? 0).toFixed(0)}</td>
                    <td className="text-right p-3">{Number(row.points_difference ?? 0).toFixed(0)}</td>
                    <td className="text-right p-3 font-display text-gold">{row.total_points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* GW Slider */}
      {d.gwTable.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="Time Machine" title="Standings by Gameweek" />
          <div className="mt-6 flex items-center gap-4 mb-4 flex-wrap">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Gameweek</div>
            <input type="range" min={1} max={maxGW} value={gw} onChange={(e) => setGw(Number(e.target.value))} className="flex-1 accent-[var(--gold)]" />
            <div className="font-display text-3xl text-gold w-12 text-center">{gw}</div>
          </div>
          <div className="premium-card rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Manager</th>
                  <th className="p-3 text-center">W</th>
                  <th className="p-3 text-center">D</th>
                  <th className="p-3 text-center">L</th>
                  <th className="p-3 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {gwStandings.map((row: any) => (
                  <tr key={`${row.manager_id}-${row.gameweek}`} className="border-t border-border/40">
                    <td className="p-3 font-display text-gold">{row.position}</td>
                    <td className="p-3 capitalize">{mById(row.manager_id)?.name}</td>
                    <td className="text-center p-3">{row.wins}</td>
                    <td className="text-center p-3">{row.draws}</td>
                    <td className="text-center p-3">{row.losses}</td>
                    <td className="text-right p-3 font-display text-gold">{row.total_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Records */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
        <SectionTitle kicker="Highlights" title="Season Records" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard label="Highest Score" value={highest ? Math.max(highest.home_score, highest.away_score) : 0} sub={highest ? `${mById(highest.home_score >= highest.away_score ? highest.home_manager_id : highest.away_manager_id)?.name} GW${highest.gameweek}` : ""} icon={<Flame className="w-5 h-5" />} />
          <StatCard label="Biggest Margin" value={biggestMargin?.margin ?? 0} sub={biggestMargin ? `GW${biggestMargin.gameweek}` : ""} icon={<Target className="w-5 h-5" />} />
          <StatCard label="Lowest Score" value={lowest ? Math.min(lowest.home_score, lowest.away_score) : 0} sub={lowest ? `GW${lowest.gameweek}` : ""} icon={<Zap className="w-5 h-5" />} />
          <StatCard label="Longest Win Streak" value={longestWin?.streak_length ?? 0} sub={longestWin ? mById(longestWin.manager_id)?.name : ""} icon={<Trophy className="w-5 h-5" />} />
        </div>
      </section>

      {/* H2H Grid */}
      {d.managers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="The Matrix" title="Head to Head Grid" />
          <div className="premium-card rounded-lg overflow-x-auto mt-6">
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {d.managers.map((m: any) => (
                    <th key={m.id} className="p-2 text-[10px] uppercase tracking-wider text-muted-foreground capitalize">{m.name?.slice(0, 4)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.managers.map((row: any) => (
                  <tr key={row.id}>
                    <td className="p-2 text-[10px] uppercase tracking-wider text-muted-foreground capitalize whitespace-nowrap">{row.name}</td>
                    {d.managers.map((col: any) => (
                      <td key={col.id} className="p-2 text-center border border-border/30">
                        {row.id === col.id ? <span className="text-muted-foreground">—</span> : (grid[row.id]?.[col.id] ?? <span className="text-muted-foreground">·</span>)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Stats Table */}
      {filteredStatKeys.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="The Numbers" title="Season Stats" />
          <div className="flex gap-2 mt-6 mb-4">
            {(["overall", "gk", "out"] as const).map((t) => (
              <button key={t} onClick={() => setStatTab(t)} className={`px-4 py-2 text-xs uppercase tracking-wider rounded ${statTab === t ? "bg-gold text-primary-foreground" : "bg-card border border-border hover:border-gold"}`}>
                {t === "overall" ? "Overall" : t === "gk" ? "GK Stats" : "Outfield"}
              </button>
            ))}
          </div>
          <div className="premium-card rounded-lg overflow-x-auto">
            <table className="text-xs">
              <thead className="bg-card/60">
                <tr>
                  <th className="p-2 text-left sticky left-0 bg-card">Manager</th>
                  {filteredStatKeys.slice(0, 12).map((k) => (
                    <th key={k} className="p-2 text-right uppercase tracking-wider text-muted-foreground whitespace-nowrap">{k.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.teamStats.map((s: any) => (
                  <tr key={s.id} className="border-t border-border/40">
                    <td className="p-2 sticky left-0 bg-card capitalize whitespace-nowrap">{mById(s.manager_id)?.name}</td>
                    {filteredStatKeys.slice(0, 12).map((k) => (
                      <td key={k} className="p-2 text-right tabular-nums">{s[k] != null ? Number(s[k]).toFixed(s[k] % 1 === 0 ? 0 : 1) : <span className="text-muted-foreground/40">—</span>}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Overall TOTS */}
      {d.overallTOTS.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="The Best XI" title="Team of the Season" />
          <div className="mt-8">
            <FormationPitch players={d.overallTOTS} getManagerName={(id) => mById(id)?.name ?? ""} />
          </div>
        </section>
      )}

      {/* Per-team TOTS */}
      {d.teamTOTS.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="Per Manager" title="Each Team's Best XI" />
          <div className="flex flex-wrap gap-2 mt-6 mb-6">
            {d.managers.map((m: any) => (
              <button key={m.id} onClick={() => setShowTeamTOTS(m.id)} className={`px-3 py-2 text-xs uppercase tracking-wider rounded capitalize ${showTeamTOTS === m.id ? "bg-gold text-primary-foreground" : "bg-card border border-border hover:border-gold"}`}>
                {m.name}
              </button>
            ))}
          </div>
          {showTeamTOTS && (
            <FormationPitch players={d.teamTOTS.filter((p: any) => p.manager_id === showTeamTOTS)} />
          )}
        </section>
      )}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: any }) {
  return (
    <div className="border-l-2 border-gold pl-3">
      <div className="font-display text-2xl md:text-3xl text-gold">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">{kicker}</div>
      <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
    </div>
  );
}

function Skel() {
  return <div className="max-w-7xl mx-auto px-4 py-20 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>;
}
