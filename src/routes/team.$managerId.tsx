import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHero } from "@/components/PageHero";
import { StatCard, Skeleton } from "@/components/StatCard";
import { FormationPitch } from "@/components/FormationPitch";
import { Trophy, Crown, Flame, Target, Zap, TrendingDown } from "lucide-react";
import { getBranding } from "@/lib/managerBranding";

export const Route = createFileRoute("/team/$managerId")({
  component: TeamPage,
});

function TeamPage() {
  const { managerId } = Route.useParams();
  const [d, setD] = useState<any>(null);
  const [seasonFilter, setSeasonFilter] = useState<string>("");
  const [posFilter, setPosFilter] = useState<string>("");

  useEffect(() => {
    setD(null);
    (async () => {
      const [manager, seasons, allManagers, mst, standings, allStandings, fixtures, streaks, h2h, overall, teamStats, legends, tots, history, alltimePlayers] = await Promise.all([
        supabase.from("managers").select("*").eq("id", managerId).single(),
        supabase.from("seasons").select("*").order("year_start"),
        supabase.from("managers").select("*"),
        supabase.from("manager_season_teams").select("*").eq("manager_id", managerId),
        supabase.from("season_standings").select("*").eq("manager_id", managerId),
        supabase.from("season_standings").select("*"),
        supabase.from("fixture_records").select("*").or(`home_manager_id.eq.${managerId},away_manager_id.eq.${managerId}`),
        supabase.from("win_streaks").select("*").eq("manager_id", managerId),
        supabase.from("h2h_records").select("*").or(`manager_a_id.eq.${managerId},manager_b_id.eq.${managerId}`),
        supabase.from("manager_overall_record").select("*").eq("manager_id", managerId).maybeSingle(),
        supabase.from("team_season_stats_full").select("*").eq("manager_id", managerId),
        supabase.from("team_legends").select("*").eq("manager_id", managerId),
        supabase.from("team_of_the_season").select("*").eq("manager_id", managerId),
        supabase.from("player_team_history").select("*").eq("manager_id", managerId),
        supabase.from("player_team_alltime").select("*").eq("manager_id", managerId),
      ]);
      setD({
        manager: manager.data,
        seasons: seasons.data ?? [],
        allManagers: allManagers.data ?? [],
        mst: mst.data ?? [],
        standings: (standings.data ?? []).sort((a: any, b: any) => {
          const sa = seasons.data?.find((s: any) => s.id === a.season_id)?.year_start ?? 0;
          const sb = seasons.data?.find((s: any) => s.id === b.season_id)?.year_start ?? 0;
          return sa - sb;
        }),
        allStandings: allStandings.data ?? [],
        fixtures: fixtures.data ?? [],
        streaks: streaks.data ?? [],
        h2h: h2h.data ?? [],
        overall: overall.data,
        teamStats: teamStats.data ?? [],
        legends: legends.data ?? [],
        tots: tots.data ?? [],
        history: history.data ?? [],
        alltimePlayers: alltimePlayers.data ?? [],
      });
    })();
  }, [managerId]);

  const [statSeason, setStatSeason] = useState<string>("");
  useEffect(() => { if (d?.standings?.length && !statSeason) setStatSeason(d.standings[d.standings.length - 1].season_id); }, [d]);
  const [totsSeason, setTotsSeason] = useState<string>("");
  useEffect(() => { if (d?.tots?.length && !totsSeason) setTotsSeason(d.tots[0].season_id); }, [d]);

  const filteredPlayers = useMemo(() => {
    if (!d) return [];
    let p = d.alltimePlayers as any[];
    if (posFilter) p = p.filter((x) => x.position === posFilter);
    return [...p].sort((a, b) => (b.total_fantasy_points ?? 0) - (a.total_fantasy_points ?? 0));
  }, [d, posFilter]);

  if (!d || !d.manager) return <Skel />;

  const sById = (id: string) => d.seasons.find((s: any) => s.id === id);
  const mById = (id: string) => d.allManagers.find((m: any) => m.id === id);

  // titles
  const titles = d.standings.filter((s: any) => s.position === 1).length;
  const bestFinish = d.standings.length ? Math.min(...d.standings.map((s: any) => s.position)) : null;
  const worstFinish = d.standings.length ? Math.max(...d.standings.map((s: any) => s.position)) : null;
  const totalGames = d.standings.reduce((acc: number, s: any) => acc + (s.wins ?? 0) + (s.draws ?? 0) + (s.losses ?? 0), 0);
  const totalWins = d.standings.reduce((acc: number, s: any) => acc + (s.wins ?? 0), 0);
  const totalDraws = d.standings.reduce((acc: number, s: any) => acc + (s.draws ?? 0), 0);
  const totalLosses = d.standings.reduce((acc: number, s: any) => acc + (s.losses ?? 0), 0);
  const totalPoints = d.standings.reduce((acc: number, s: any) => acc + (s.total_points ?? 0), 0);
  const totalPF = d.standings.reduce((acc: number, s: any) => acc + Number(s.points_for ?? 0), 0);
  const totalPA = d.standings.reduce((acc: number, s: any) => acc + Number(s.points_against ?? 0), 0);
  const pointsDiff = totalPF - totalPA;
  const winPct = totalGames ? ((totalWins / totalGames) * 100).toFixed(1) : "0";

  // All-time league position by PPG
  const ppgByManager = new Map<string, { games: number; pts: number }>();
  for (const s of d.allStandings as any[]) {
    const cur = ppgByManager.get(s.manager_id) ?? { games: 0, pts: 0 };
    cur.games += (s.wins ?? 0) + (s.draws ?? 0) + (s.losses ?? 0);
    cur.pts += s.total_points ?? 0;
    ppgByManager.set(s.manager_id, cur);
  }
  const ppgRanked = [...ppgByManager.entries()]
    .map(([id, v]) => ({ id, ppg: v.games ? v.pts / v.games : 0 }))
    .sort((a, b) => b.ppg - a.ppg);
  const allTimeRank = ppgRanked.findIndex((x) => x.id === managerId) + 1;
  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };


  // personal records
  const myFixtures = d.fixtures;
  const myScores = myFixtures.map((f: any) => f.home_manager_id === managerId ? f.home_score : f.away_score).filter((x: any) => x != null);
  const highestScore = Math.max(...myScores, 0);
  const lowestScore = myScores.length ? Math.min(...myScores) : 0;
  const myWins = myFixtures.filter((f: any) => {
    const my = f.home_manager_id === managerId ? f.home_score : f.away_score;
    const opp = f.home_manager_id === managerId ? f.away_score : f.home_score;
    return my > opp;
  });
  const biggestWin = [...myWins].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0))[0];
  const myLosses = myFixtures.filter((f: any) => {
    const my = f.home_manager_id === managerId ? f.home_score : f.away_score;
    const opp = f.home_manager_id === managerId ? f.away_score : f.home_score;
    return my < opp;
  });
  const heaviestDef = [...myLosses].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0))[0];

  const winStreak = [...d.streaks].filter((s: any) => (s.streak_type ?? s.type) === "win" || (s.streak_type ?? s.type) === "W").sort((a: any, b: any) => b.streak_length - a.streak_length)[0];
  const lossStreak = [...d.streaks].filter((s: any) => (s.streak_type ?? s.type) === "loss" || (s.streak_type ?? s.type) === "L").sort((a: any, b: any) => b.streak_length - a.streak_length)[0];

  const seasonStats = d.teamStats.find((s: any) => s.season_id === statSeason);
  const totsPlayers = d.tots.filter((p: any) => p.season_id === totsSeason);

  const branding = getBranding(managerId);
  const brandStyle = branding
    ? ({
        ["--gold" as any]: branding.primary,
        ["--color-gold" as any]: branding.primary,
        ["--gold-bright" as any]: branding.primary,
        ["--color-gold-bright" as any]: branding.primary,
        ["--primary" as any]: branding.primary,
        ["--color-primary" as any]: branding.primary,
        ...(branding.primaryFg
          ? {
              ["--primary-foreground" as any]: branding.primaryFg,
              ["--color-primary-foreground" as any]: branding.primaryFg,
            }
          : {}),
      } as React.CSSProperties)
    : undefined;

  const latestMst = [...d.mst].sort((a: any, b: any) => {
    const sa = d.seasons.find((s: any) => s.id === a.season_id)?.year_start ?? 0;
    const sb = d.seasons.find((s: any) => s.id === b.season_id)?.year_start ?? 0;
    return sb - sa;
  })[0];
  const currentTeamName = latestMst?.team_name ?? d.manager.team_name ?? d.manager.name;

  return (
    <div style={brandStyle}>
      <PageHero
        kicker={d.manager.name}
        title={
          <span className="flex items-center gap-6 flex-wrap" style={{ color: branding?.primary }}>
            {branding && (
              <img
                src={branding.badge}
                alt={`${currentTeamName} badge`}
                className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 shrink-0 drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
              />
            )}
            <span>{currentTeamName}</span>
          </span>
        }
        subtitle={
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground self-center mr-2">
              {d.mst.length} Season{d.mst.length !== 1 ? "s" : ""} ·
            </span>
            {d.mst.map((t: any) => (
              <span key={t.id} className="px-3 py-1 bg-card border border-border rounded text-xs uppercase tracking-wider">
                <span className="text-gold mr-1">{sById(t.season_id)?.name}</span> {t.team_name}
              </span>
            ))}
          </div>
        }
      />

      {/* Career */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <SectionTitle kicker="Career" title="Overall Record" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
          <StatCard label="Seasons" value={d.standings.length} />
          <StatCard label="Titles" value={titles} icon={titles > 0 ? <Trophy className="w-4 h-4" /> : undefined} />
          <StatCard label="W-D-L" value={`${totalWins}-${totalDraws}-${totalLosses}`} />
          <StatCard label="Win %" value={`${winPct}%`} />
          <StatCard label="Total Pts" value={totalPoints} />
          <StatCard label="Best Finish" value={bestFinish ?? "—"} />
          <StatCard label="Worst Finish" value={worstFinish ?? "—"} />
        </div>
      </section>

      {/* Season Hist */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
        <SectionTitle kicker="Season by Season" title="The Journey" />
        <div className="premium-card rounded-lg overflow-x-auto mt-6">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Season</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-center">Pos</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">D</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-right">PF</th>
                <th className="p-3 text-right">PA</th>
                <th className="p-3 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {d.standings.map((s: any) => {
                const isBest = s.position === bestFinish;
                const isWorst = s.position === worstFinish && bestFinish !== worstFinish;
                const teamName = d.mst.find((t: any) => t.season_id === s.season_id)?.team_name;
                return (
                  <tr key={s.id} className="border-t border-border/40">
                    <td className="p-3"><Link to="/season/$seasonId" params={{ seasonId: s.season_id }} className="hover:text-gold">{sById(s.season_id)?.name}</Link></td>
                    <td className="p-3 text-muted-foreground">{teamName}</td>
                    <td className={`p-3 text-center font-display text-lg ${isBest ? "text-success" : isWorst ? "text-destructive/70" : "text-gold"}`}>
                      {s.position === 1 && <Trophy className="inline w-4 h-4 mr-1" />}
                      {s.position}
                    </td>
                    <td className="text-center p-3">{s.wins}</td>
                    <td className="text-center p-3">{s.draws}</td>
                    <td className="text-center p-3">{s.losses}</td>
                    <td className="text-right p-3">{Number(s.points_for ?? 0).toFixed(0)}</td>
                    <td className="text-right p-3">{Number(s.points_against ?? 0).toFixed(0)}</td>
                    <td className="text-right p-3 font-display text-gold">{s.total_points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Personal Records */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
        <SectionTitle kicker="Personal" title="Records & Lows" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <StatCard label="Highest Score" value={highestScore} icon={<Flame className="w-5 h-5" />} />
          <StatCard label="Biggest Win" value={biggestWin?.margin ?? 0} sub={biggestWin ? `vs ${mById(biggestWin.home_manager_id === managerId ? biggestWin.away_manager_id : biggestWin.home_manager_id)?.name}` : ""} icon={<Target className="w-5 h-5" />} />
          <StatCard label="Longest Win Streak" value={winStreak?.streak_length ?? 0} icon={<Zap className="w-5 h-5" />} />
          <StatCard label="Lowest Score" value={lowestScore} icon={<TrendingDown className="w-5 h-5" />} />
          <StatCard label="Heaviest Defeat" value={heaviestDef?.margin ?? 0} sub={heaviestDef ? `vs ${mById(heaviestDef.home_manager_id === managerId ? heaviestDef.away_manager_id : heaviestDef.home_manager_id)?.name}` : ""} icon={<TrendingDown className="w-5 h-5" />} />
          <StatCard label="Longest Losing Streak" value={lossStreak?.streak_length ?? 0} icon={<TrendingDown className="w-5 h-5" />} />
        </div>
      </section>

      {/* H2H */}
      {d.h2h.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="vs The Field" title="Head to Head" />
          <div className="premium-card rounded-lg overflow-x-auto mt-6">
            <table className="w-full text-sm">
              <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Opponent</th>
                  <th className="p-3 text-center">P</th>
                  <th className="p-3 text-center">W</th>
                  <th className="p-3 text-center">D</th>
                  <th className="p-3 text-center">L</th>
                  <th className="p-3 text-right">PF</th>
                  <th className="p-3 text-right">PA</th>
                  <th className="p-3 text-right">Win%</th>
                </tr>
              </thead>
              <tbody>
                {d.h2h.map((row: any, i: number) => {
                  const oppId = row.manager_a_id === managerId ? row.manager_b_id : row.manager_a_id;
                  const myWins = row.manager_a_id === managerId ? row.manager_a_wins : row.manager_b_wins;
                  const oppWins = row.manager_a_id === managerId ? row.manager_b_wins : row.manager_a_wins;
                  const myPF = row.manager_a_id === managerId ? row.manager_a_points : row.manager_b_points;
                  const oppPF = row.manager_a_id === managerId ? row.manager_b_points : row.manager_a_points;
                  const total = (myWins ?? 0) + (oppWins ?? 0) + (row.draws ?? 0);
                  const wp = total ? ((myWins / total) * 100).toFixed(0) : "0";
                  return (
                    <tr key={i} className="border-t border-border/40">
                      <td className="p-3 capitalize"><Link to="/team/$managerId" params={{ managerId: oppId }} className="hover:text-gold">{mById(oppId)?.name}</Link></td>
                      <td className="text-center p-3">{total}</td>
                      <td className="text-center p-3 text-gold">{myWins}</td>
                      <td className="text-center p-3">{row.draws}</td>
                      <td className="text-center p-3 text-destructive/80">{oppWins}</td>
                      <td className="text-right p-3">{Number(myPF ?? 0).toFixed(0)}</td>
                      <td className="text-right p-3">{Number(oppPF ?? 0).toFixed(0)}</td>
                      <td className="text-right p-3 font-display">{wp}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Season Stats */}
      {d.teamStats.length > 0 && seasonStats && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="Deep Dive" title="Season Stats" />
          <select value={statSeason} onChange={(e) => setStatSeason(e.target.value)} className="bg-input border border-border rounded px-4 py-2 mt-6 mb-6">
            {d.teamStats.map((s: any) => <option key={s.id} value={s.season_id}>{sById(s.season_id)?.name}</option>)}
          </select>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(seasonStats).filter(([k, v]) => !["id", "season_id", "manager_id"].includes(k) && typeof v === "number").map(([k, v]) => (
              <div key={k} className="premium-card rounded p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{k.replace(/_/g, " ")}</div>
                <div className="font-display text-xl text-gold">{v != null ? Number(v).toFixed(Number(v) % 1 === 0 ? 0 : 1) : <span className="text-muted-foreground/40 text-sm" title="This stat was introduced in Season 3">N/A</span>}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TOTS */}
      {d.tots.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="Best XI" title="Team of the Season" />
          <div className="flex flex-wrap gap-2 mt-6 mb-6">
            {[...new Set(d.tots.map((p: any) => p.season_id))].map((sid: any) => (
              <button key={sid} onClick={() => setTotsSeason(sid)} className={`px-3 py-2 text-xs uppercase tracking-wider rounded ${totsSeason === sid ? "bg-gold text-primary-foreground" : "bg-card border border-border hover:border-gold"}`}>
                {sById(sid)?.name}
              </button>
            ))}
          </div>
          {totsPlayers.length > 0 && <FormationPitch players={totsPlayers} />}
        </section>
      )}

      {/* Legends */}
      {d.legends.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="Immortals" title="All-Time XI" />
          <div className="mt-8">
            <FormationPitch players={d.legends} />
          </div>
        </section>
      )}

      {/* Player History */}
      {d.alltimePlayers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
          <SectionTitle kicker="Squad History" title="Every Player" />
          <div className="flex gap-2 mt-6 mb-4 flex-wrap">
            <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)} className="bg-input border border-border rounded px-3 py-2 text-sm">
              <option value="">All Positions</option>
              {["GK", "DEF", "MID", "FWD"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="premium-card rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Player</th>
                  <th className="p-3 text-center">Pos</th>
                  <th className="p-3 text-center">Sea</th>
                  <th className="p-3 text-center">GP</th>
                  <th className="p-3 text-right">Pts</th>
                  <th className="p-3 text-right">PPG</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((p: any, i: number) => (
                  <tr key={`${p.player_id ?? p.player_name}-${i}`} className="border-t border-border/40 hover:bg-gold/5">
                    <td className="p-3 font-display text-gold">{i + 1}</td>
                    <td className="p-3 flex items-center gap-2">
                      {i === 0 && <Crown className="w-4 h-4 text-gold" />}
                      <span className="font-medium">{p.player_name ?? p.name}</span>
                    </td>
                    <td className="p-3 text-center text-xs uppercase text-muted-foreground">{p.position}</td>
                    <td className="text-center p-3">{p.seasons_played ?? p.seasons ?? "—"}</td>
                    <td className="text-center p-3">{p.games_played ?? "—"}</td>
                    <td className="text-right p-3 font-display text-gold">{Number(p.total_fantasy_points ?? 0).toFixed(0)}</td>
                    <td className="text-right p-3">{p.ppg != null ? Number(p.ppg).toFixed(1) : (p.avg_points_per_game != null ? Number(p.avg_points_per_game).toFixed(1) : "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
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
