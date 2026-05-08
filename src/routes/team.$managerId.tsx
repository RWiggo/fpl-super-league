import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TeamHero } from "@/components/TeamHero";
import { StatCard, Skeleton } from "@/components/StatCard";
import { FormationPitch } from "@/components/FormationPitch";
import { Trophy, Crown, Flame, Target, Zap, TrendingDown, Award, ShieldOff, Flag, Skull, ChevronLeft, ChevronRight } from "lucide-react";
import { getBranding } from "@/lib/managerBranding";
import { getNickname } from "@/lib/managerNicknames";
import { getPlClubBadge } from "@/lib/plClubBadges";

export const Route = createFileRoute("/team/$managerId")({
  component: TeamPage,
});

function TeamPage() {
  const { managerId } = Route.useParams();
  const [d, setD] = useState<any>(null);
  const [seasonFilter, setSeasonFilter] = useState<string>("");
  const [searchClub, setSearchClub] = useState<string>("");
  const [searchPlayer, setSearchPlayer] = useState<string>("");

  useEffect(() => {
    setD(null);
    (async () => {
      const managerRes = await supabase.from("managers").select("*").eq("id", managerId).single();
      const mName = managerRes.data?.name;
      const [seasons, allManagers, mst, standings, allStandings, fixtures, streaks, h2h, overall, teamStats, legends, tots, history, alltimePlayers, unbeaten, winless, losing, allClubs] = await Promise.all([
        supabase.from("seasons").select("*").order("year_start"),
        supabase.from("managers").select("*"),
        supabase.from("manager_season_teams").select("*").eq("manager_id", managerId),
        supabase.from("season_standings").select("*").eq("manager_id", managerId),
        supabase.from("season_standings").select("*"),
        supabase.from("fixture_records").select("*").or(`home_manager.eq."${mName}",away_manager.eq."${mName}"`),
        supabase.from("win_streaks").select("*").eq("manager_name", mName),
        supabase.from("h2h_records").select("*").or(`manager1_id.eq.${managerId},manager2_id.eq.${managerId}`),
        supabase.from("manager_overall_record").select("*").eq("manager_id", managerId).maybeSingle(),
        supabase.from("team_season_stats_full").select("*").eq("manager_name", mName),
        supabase.from("team_legends").select("*").eq("manager_id", managerId),
        supabase.from("team_of_the_season").select("*").eq("manager_name", mName),
        supabase.from("player_team_history").select("*").eq("manager_name", mName),
        supabase.from("player_team_alltime").select("*").eq("manager_id", managerId),
        supabase.from("unbeaten_streaks").select("*").eq("manager_name", mName),
        supabase.from("winless_streaks").select("*").eq("manager_name", mName),
        supabase.from("losing_streaks").select("*").eq("manager_name", mName),
        supabase.from("player_team_history").select("club"),
      ]);
      const manager = managerRes;
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
        unbeaten: unbeaten.data ?? [],
        winless: winless.data ?? [],
        losing: losing.data ?? [],
        allClubs: [...new Set((allClubs.data ?? []).map((r: any) => r.club).filter(Boolean))] as string[],
      });
    })();
  }, [managerId]);

  const [statSeason, setStatSeason] = useState<string>("");
  useEffect(() => { if (d?.standings?.length && !statSeason) setStatSeason(d.seasons.find((x: any) => x.id === d.standings[d.standings.length - 1].season_id)?.name ?? ""); }, [d]);
  const [totsSeason, setTotsSeason] = useState<string>("");
  const [h2hPage, setH2hPage] = useState(0);
  useEffect(() => { if (d?.tots?.length && !totsSeason) setTotsSeason(d.tots[0].season_name); }, [d]);

  // Player search: club -> players from history; selected player aggregated stats
  const clubsInSquad = useMemo(() => {
    if (!d) return [] as string[];
    return [...new Set((d.history as any[]).map((h) => h.club).filter(Boolean))].sort();
  }, [d]);
  const playersForClub = useMemo(() => {
    if (!d || !searchClub) return [] as string[];
    return [...new Set((d.history as any[]).filter((h) => h.club === searchClub).map((h) => h.player_name))].sort();
  }, [d, searchClub]);
  const selectedPlayerData = useMemo(() => {
    if (!d || !searchPlayer) return null;
    const rows = (d.history as any[]).filter((h) => h.player_name === searchPlayer);
    if (!rows.length) return null;
    const allTime = (d.alltimePlayers as any[]).find((p) => p.player_name === searchPlayer);
    const totalPts = rows.reduce((a, r) => a + Number(r.fantasy_points ?? 0), 0);
    const totalGames = rows.reduce((a, r) => a + Number(r.games_played ?? 0), 0);
    const totalMins = rows.reduce((a, r) => a + Number(r.minutes ?? 0), 0);
    const ppg = totalGames ? totalPts / totalGames : 0;
    const seasons = rows.map((r) => r.season_name).join(", ");
    const clubs = [...new Set(rows.map((r) => r.club))].join(", ");
    const position = allTime?.position ?? rows[0]?.position;
    return { totalPts, totalGames, totalMins, ppg, seasons, clubs, position, rows };
  }, [d, searchPlayer]);


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
  const allTimeRank = ppgRanked.findIndex((x) => String(x.id) === String(managerId)) + 1;
  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };


  // personal records
  const myName = d.manager.name;
  const myFixtures = d.fixtures;
  const isHome = (f: any) => f.home_manager === myName;
  const myScores = myFixtures.map((f: any) => isHome(f) ? f.home_score : f.away_score).filter((x: any) => x != null);
  const highestScore = Math.max(...myScores, 0);
  const lowestScore = myScores.length ? Math.min(...myScores) : 0;
  const myWins = myFixtures.filter((f: any) => {
    const my = isHome(f) ? f.home_score : f.away_score;
    const opp = isHome(f) ? f.away_score : f.home_score;
    return my > opp;
  });
  const biggestWin = [...myWins].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0))[0];
  const myLosses = myFixtures.filter((f: any) => {
    const my = isHome(f) ? f.home_score : f.away_score;
    const opp = isHome(f) ? f.away_score : f.home_score;
    return my < opp;
  });
  const heaviestDef = [...myLosses].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0))[0];

  const winStreak = [...d.streaks].filter((s: any) => (s.streak_type ?? s.type ?? s.outcome) === "win" || (s.streak_type ?? s.type ?? s.outcome) === "W").sort((a: any, b: any) => b.streak_length - a.streak_length)[0];
  const lossStreak = [...d.streaks].filter((s: any) => (s.streak_type ?? s.type ?? s.outcome) === "loss" || (s.streak_type ?? s.type ?? s.outcome) === "L").sort((a: any, b: any) => b.streak_length - a.streak_length)[0];

  const seasonStats = d.teamStats.find((s: any) => s.season_name === statSeason);
  const totsPlayers = d.tots.filter((p: any) => p.season_name === totsSeason);

  // Highs & Lows
  const sortedPlayers = [...(d.alltimePlayers as any[])].sort((a, b) => (b.total_fantasy_points ?? 0) - (a.total_fantasy_points ?? 0));
  const top5Players = sortedPlayers.slice(0, 5);
  const bottom5Players = [...sortedPlayers].reverse().slice(0, 5);

  const longest = (rows: any[]) => [...rows].sort((a, b) => (b.streak_length ?? 0) - (a.streak_length ?? 0))[0];
  const bestWinRun = longest((d.streaks as any[]).filter((r) => r.outcome === "W"));
  const bestUnbeatenRun = longest(d.unbeaten ?? []);
  const worstWinlessRun = longest(d.winless ?? []);
  const worstLosingRun = longest(d.losing ?? []);

  // Clubs aggregation
  const clubAgg = new Map<string, number>();
  for (const r of (d.history as any[])) {
    if (!r.club) continue;
    clubAgg.set(r.club, (clubAgg.get(r.club) ?? 0) + Number(r.fantasy_points ?? 0));
  }
  // include unused clubs with 0
  for (const c of (d.allClubs as string[])) if (!clubAgg.has(c)) clubAgg.set(c, 0);
  const clubsRanked = [...clubAgg.entries()].map(([club, pts]) => ({ club, pts })).sort((a, b) => b.pts - a.pts);
  const top5Clubs = clubsRanked.slice(0, 5);
  const bottom5Clubs = [...clubsRanked].reverse().slice(0, 5);

  // All-time XI in legal formation
  const posMap: Record<string, "GK" | "DEF" | "MID" | "FWD"> = { G: "GK", GK: "GK", GKP: "GK", D: "DEF", DEF: "DEF", M: "MID", MID: "MID", F: "FWD", FWD: "FWD" };
  const byPos: Record<string, any[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of sortedPlayers) {
    const k = posMap[p.position];
    if (k) byPos[k].push(p);
  }
  const formations: Array<[number, number, number]> = [
    [3, 4, 3], [3, 5, 2], [4, 3, 3], [4, 4, 2], [4, 5, 1], [5, 3, 2], [5, 4, 1],
  ];
  let bestXI: any[] = [];
  let bestXISum = -1;
  let bestFormation: [number, number, number] = [4, 4, 2];
  for (const [nd, nm, nf] of formations) {
    if (byPos.GK.length < 1 || byPos.DEF.length < nd || byPos.MID.length < nm || byPos.FWD.length < nf) continue;
    const xi = [
      ...byPos.GK.slice(0, 1),
      ...byPos.DEF.slice(0, nd),
      ...byPos.MID.slice(0, nm),
      ...byPos.FWD.slice(0, nf),
    ];
    const sum = xi.reduce((a, p) => a + (p.total_fantasy_points ?? 0), 0);
    if (sum > bestXISum) {
      bestXISum = sum;
      bestXI = xi;
      bestFormation = [nd, nm, nf];
    }
  }
  // normalize positions for FormationPitch
  const bestXIForPitch = bestXI.map((p) => ({ ...p, position: posMap[p.position] ?? p.position }));

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
      <TeamHero
        managerName={d.manager.name}
        teamName={currentTeamName}
        badge={branding?.badge}
        primary={branding?.primary}
        nickname={getNickname(managerId)}
        seasonsBadges={d.mst.map((t: any) => ({
          season: sById(t.season_id)?.name ?? "",
          team: t.team_name,
        }))}
        facts={[
          { label: "Seasons", value: d.standings.length },
          { label: "Titles", value: titles },
          { label: "All-Time Rank", value: allTimeRank > 0 ? ordinal(allTimeRank) : "—" },
          { label: "Win %", value: `${winPct}%` },
        ]}
        secondaryFacts={[
          { label: "Wins", value: totalWins },
          { label: "Draws", value: totalDraws },
          { label: "Losses", value: totalLosses },
          { label: "Pts Diff", value: `${pointsDiff >= 0 ? "+" : ""}${pointsDiff.toFixed(0)}` },
          { label: "FPL Points", value: totalPoints.toLocaleString() },
        ]}
      />


      {/* Season Hist */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
        <SectionTitle kicker="Season History" title="The Journey so far" />
        <div className="premium-card rounded-lg overflow-x-auto mt-6">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Season</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-left">Star Player</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">D</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-right">FPL Diff</th>
                <th className="p-3 text-right">Pts</th>
                <th className="p-3 text-center">Pos</th>
              </tr>
            </thead>
            <tbody>
              {d.standings.map((s: any) => {
                const teamName = d.mst.find((t: any) => t.season_id === s.season_id)?.team_name;
                // Star player: top fantasy_points scorer for this manager that season
                const seasonName = sById(s.season_id)?.name;
                const seasonHistory = (d.history as any[]).filter(
                  (h) => h.season_id === s.season_id || h.season_name === seasonName
                );
                const star = [...seasonHistory].sort(
                  (a, b) => Number(b.fantasy_points ?? 0) - Number(a.fantasy_points ?? 0)
                )[0];
                // Total managers in this season → relative finish bucket
                const seasonSize = new Set(
                  (d.allStandings as any[]).filter((x) => x.season_id === s.season_id).map((x) => x.manager_id)
                ).size;
                const pos = s.position;
                let posClass = "text-yellow-400"; // mid-table default
                if (pos === 1) posClass = "text-emerald-300";
                else if (pos === 2 || pos === 3) posClass = "text-emerald-600";
                else if (seasonSize > 0 && pos === seasonSize) posClass = "text-red-700";
                else if (seasonSize > 0 && pos > seasonSize - 3) posClass = "text-red-500";
                const diff = Number(s.points_for ?? 0) - Number(s.points_against ?? 0);
                return (
                  <tr key={s.id} className="border-t border-border/40">
                    <td className="p-3"><Link to="/season/$seasonId" params={{ seasonId: s.season_id }} className="hover:text-gold">{sById(s.season_id)?.name}</Link></td>
                    <td className="p-3 text-muted-foreground">{teamName}</td>
                    <td className="p-3">
                      {star ? (
                        <span>
                          <span className="font-medium">{star.player_name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{Number(star.fantasy_points ?? 0).toFixed(0)} pts</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="text-center p-3">{s.wins}</td>
                    <td className="text-center p-3">{s.draws}</td>
                    <td className="text-center p-3">{s.losses}</td>
                    <td className={`text-right p-3 ${diff >= 0 ? "text-emerald-400/90" : "text-red-400/90"}`}>
                      {diff >= 0 ? "+" : ""}{diff.toFixed(0)}
                    </td>
                    <td className="text-right p-3 font-display text-foreground">{s.total_points}</td>
                    <td className={`p-3 text-center font-display text-lg ${posClass}`}>
                      {pos === 1 && <Trophy className="inline w-4 h-4 mr-1 text-gold" />}
                      {pos}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* H2H Carousel */}
      {d.h2h.length > 0 && (() => {
        const cards = [...d.h2h]
          .map((row: any) => {
            const isOne = String(row.manager1_id) === String(managerId);
            const oppId = isOne ? row.manager2_id : row.manager1_id;
            const myWins = isOne ? row.manager1_wins : row.manager2_wins;
            const oppWins = isOne ? row.manager2_wins : row.manager1_wins;
            const myPF = isOne ? row.manager1_points_for : row.manager2_points_for;
            const oppPF = isOne ? row.manager2_points_for : row.manager1_points_for;
            return { row, oppId, myWins, oppWins, myPF, oppPF };
          })
          .sort((a, b) => (b.myWins + b.oppWins + (b.row.draws ?? 0)) - (a.myWins + a.oppWins + (a.row.draws ?? 0)));

        const perPage = 3;
        const pageCount = Math.max(1, Math.ceil(cards.length / perPage));
        const page = Math.min(h2hPage, pageCount - 1);
        const visible = cards.slice(page * perPage, page * perPage + perPage);
        const canPrev = page > 0;
        const canNext = page < pageCount - 1;

        return (
          <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <SectionTitle kicker="vs The Field" title="Head to Head" />
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground mr-2 hidden sm:inline">
                  {page + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  aria-label="Previous opponents"
                  onClick={() => canPrev && setH2hPage(page - 1)}
                  disabled={!canPrev}
                  className="w-10 h-10 rounded-full border border-gold/40 bg-card/60 hover:bg-gold hover:text-primary-foreground transition flex items-center justify-center disabled:opacity-30 disabled:hover:bg-card/60 disabled:hover:text-current"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next opponents"
                  onClick={() => canNext && setH2hPage(page + 1)}
                  disabled={!canNext}
                  className="w-10 h-10 rounded-full border border-gold/40 bg-card/60 hover:bg-gold hover:text-primary-foreground transition flex items-center justify-center disabled:opacity-30 disabled:hover:bg-card/60 disabled:hover:text-current"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 mb-6">
              Sorted by total fixtures played. Click a card to see every result.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visible.map(({ row, oppId, myWins, oppWins, myPF, oppPF }) => {
                const opp = mById(oppId);
                const oppName = opp?.name;
                const oppFixtures = (d.fixtures as any[])
                  .filter((f) => f.home_manager === oppName || f.away_manager === oppName)
                  .map((f) => {
                    const meHome = f.home_manager === myName;
                    const my = meHome ? f.home_score : f.away_score;
                    const op = meHome ? f.away_score : f.home_score;
                    const seasonName = f.season_name ?? sById(f.season_id)?.name;
                    return { ...f, my, op, seasonName };
                  })
                  .filter((f) => f.my != null && f.op != null)
                  .sort((a, b) => {
                    const sa = d.seasons.find((s: any) => s.id === a.season_id || s.name === a.season_name)?.year_start ?? 0;
                    const sb = d.seasons.find((s: any) => s.id === b.season_id || s.name === b.season_name)?.year_start ?? 0;
                    if (sa !== sb) return sb - sa;
                    return (b.gameweek ?? 0) - (a.gameweek ?? 0);
                  });
                return (
                  <H2HCard
                    key={oppId}
                    opponentId={String(oppId)}
                    opponentName={opp?.name ?? "—"}
                    opponentBadge={getBranding(oppId)?.badge}
                    opponentTint={getBranding(oppId)?.primary}
                    wins={myWins ?? 0}
                    draws={row.draws ?? 0}
                    losses={oppWins ?? 0}
                    pf={Number(myPF ?? 0)}
                    pa={Number(oppPF ?? 0)}
                    fixtures={oppFixtures}
                    selfId={managerId}
                  />
                );
              })}
            </div>

            {/* Page dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to page ${i + 1}`}
                  onClick={() => setH2hPage(i)}
                  className={`h-1.5 rounded-full transition-all ${i === page ? "w-8 bg-gold" : "w-2 bg-border hover:bg-muted-foreground"}`}
                />
              ))}
            </div>
          </section>
        );
      })()}

      {/* Highs and Lows */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
        <SectionTitle kicker="The Highs and Lows" title="Records and Statistics" />

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <PlayerLeaderboard title="Top 5 Players" subtitle="By all-time fantasy points" players={top5Players} icon={<Crown className="w-4 h-4" />} accent />
          <PlayerLeaderboard title="Worst 5 Players" subtitle="By all-time fantasy points" players={bottom5Players} icon={<Skull className="w-4 h-4" />} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
          <StatCard align="center" label="Greatest Winning Run" value={bestWinRun?.streak_length ?? 0} sub={bestWinRun ? `${bestWinRun.season_name} · GW${bestWinRun.streak_start_gw}–${bestWinRun.streak_end_gw}` : undefined} icon={<Zap className="w-5 h-5" />} />
          <StatCard align="center" label="Greatest Unbeaten Run" value={bestUnbeatenRun?.streak_length ?? 0} sub={bestUnbeatenRun ? `${bestUnbeatenRun.season_name} · GW${bestUnbeatenRun.streak_start_gw}–${bestUnbeatenRun.streak_end_gw}` : undefined} icon={<Award className="w-5 h-5" />} />
          <StatCard align="center" label="Worst Winless Run" value={worstWinlessRun?.streak_length ?? 0} sub={worstWinlessRun ? `${worstWinlessRun.season_name} · GW${worstWinlessRun.streak_start_gw}–${worstWinlessRun.streak_end_gw}` : undefined} icon={<ShieldOff className="w-5 h-5" />} />
          <StatCard align="center" label="Worst Losing Run" value={worstLosingRun?.streak_length ?? 0} sub={worstLosingRun ? `${worstLosingRun.season_name} · GW${worstLosingRun.streak_start_gw}–${worstLosingRun.streak_end_gw}` : undefined} icon={<TrendingDown className="w-5 h-5" />} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <ClubLeaderboard title="Top 5 PL Clubs Relied On" subtitle="By total fantasy points contributed" rows={top5Clubs} accent />
          <ClubLeaderboard title="Bottom 5 PL Clubs Trusted" subtitle="Includes never-used clubs (2022/23–2025/26)" rows={bottom5Clubs} />
        </div>

        {bestXI.length === 11 && (
          <div className="mt-12">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-gold mb-1">All-Time XI</div>
                <h3 className="font-display text-2xl md:text-3xl">Best Eleven · {bestFormation.join("-")}</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                Combined Points · <span className="text-gold font-display text-lg">{bestXISum.toFixed(0)}</span>
              </div>
            </div>
            <FormationPitch players={bestXIForPitch} managerId={managerId} />

            {clubsInSquad.length > 0 && (
              <div className="mt-10">
                <div className="text-xs uppercase tracking-[0.3em] text-gold mb-1">Squad History</div>
                <h4 className="font-display text-xl md:text-2xl mb-4">Player Search</h4>
                <div className="flex flex-wrap gap-3 mb-6">
                  <select
                    value={searchClub}
                    onChange={(e) => { setSearchClub(e.target.value); setSearchPlayer(""); }}
                    className="bg-input border border-border rounded px-3 py-2 text-sm min-w-[180px]"
                  >
                    <option value="">Select a club…</option>
                    {clubsInSquad.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={searchPlayer}
                    onChange={(e) => setSearchPlayer(e.target.value)}
                    disabled={!searchClub}
                    className="bg-input border border-border rounded px-3 py-2 text-sm min-w-[220px] disabled:opacity-50"
                  >
                    <option value="">{searchClub ? "Select a player…" : "Pick a club first"}</option>
                    {playersForClub.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {selectedPlayerData && (
                  <div className="premium-card rounded-lg p-6">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
                      <div>
                        <div className="font-display text-2xl">{searchPlayer}</div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                          {selectedPlayerData.position} · {selectedPlayerData.clubs} · {selectedPlayerData.seasons}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <StatCard align="center" label="Total Points" value={selectedPlayerData.totalPts.toFixed(0)} />
                      <StatCard align="center" label="Games Played" value={selectedPlayerData.totalGames} />
                      <StatCard align="center" label="Points / Game" value={selectedPlayerData.ppg.toFixed(1)} />
                      <StatCard align="center" label="Minutes" value={selectedPlayerData.totalMins} />
                    </div>
                    {selectedPlayerData.rows.length > 1 && (
                      <div className="mt-6 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                              <th className="p-2 text-left">Season</th>
                              <th className="p-2 text-left">Club</th>
                              <th className="p-2 text-center">GP</th>
                              <th className="p-2 text-right">Pts</th>
                              <th className="p-2 text-right">PPG</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPlayerData.rows.map((r: any, i: number) => (
                              <tr key={i} className="border-t border-border/40">
                                <td className="p-2">{r.season_name}</td>
                                <td className="p-2">{r.club}</td>
                                <td className="text-center p-2">{r.games_played ?? "—"}</td>
                                <td className="text-right p-2 font-display text-gold">{Number(r.fantasy_points ?? 0).toFixed(0)}</td>
                                <td className="text-right p-2">{r.avg_points_per_game != null ? Number(r.avg_points_per_game).toFixed(1) : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>


    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-[3px] rounded-full bg-gold" />
      <div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-silver/70 mb-1">{kicker}</div>
        <h2 className="font-display text-3xl md:text-4xl uppercase">{title}</h2>
      </div>
    </div>
  );
}

function Skel() {
  return <div className="max-w-7xl mx-auto px-4 py-20 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>;
}

const RANK_STYLES = [
  "text-amber-300",       // 1st — gold
  "text-slate-300",       // 2nd — silver
  "text-orange-400",      // 3rd — bronze
  "text-muted-foreground",
  "text-muted-foreground",
];

const POSITION_STYLES: Record<string, string> = {
  GK:  "bg-amber-500/15 text-amber-300 border-amber-500/30",
  GKP: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  DEF: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  MID: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  FWD: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function PlayerLeaderboard({ title, subtitle, players, icon, accent }: { title: string; subtitle?: string; players: any[]; icon?: React.ReactNode; accent?: boolean }) {
  const valueClass = accent ? "text-emerald-300" : "text-rose-300";
  const headerAccent = accent ? "text-emerald-300" : "text-rose-300";
  return (
    <div className="premium-card rounded-lg overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className={`flex items-center gap-2 text-xs uppercase tracking-[0.25em] mb-1 ${headerAccent}`}>{icon}{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <table className="w-full text-sm">
        <tbody>
          {players.map((p, i) => (
            <tr key={`${p.player_id ?? p.player_name}-${i}`} className="border-t border-border/40 odd:bg-card/30 hover:bg-card/60 transition-colors">
              <td className={`p-3 w-10 font-display text-lg ${RANK_STYLES[i] ?? "text-muted-foreground"}`}>{i + 1}</td>
              <td className="p-3 font-medium">{p.player_name ?? p.name}</td>
              <td className="p-3 w-14 text-center">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${POSITION_STYLES[p.position] ?? "bg-muted/20 text-muted-foreground border-border"}`}>
                  {p.position}
                </span>
              </td>
              <td className={`p-3 text-right font-display ${valueClass}`}>{Number(p.total_fantasy_points ?? 0).toFixed(0)}</td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-sm">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ClubLeaderboard({ title, subtitle, rows, accent }: { title: string; subtitle?: string; rows: { club: string; pts: number }[]; accent?: boolean }) {
  const valueClass = accent ? "text-emerald-300" : "text-rose-300";
  const headerAccent = accent ? "text-emerald-300" : "text-rose-300";
  return (
    <div className="premium-card rounded-lg overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className={`text-xs uppercase tracking-[0.25em] mb-1 ${headerAccent}`}>{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.club} className="border-t border-border/40 odd:bg-card/30 hover:bg-card/60 transition-colors">
              <td className={`p-3 w-10 font-display text-lg ${RANK_STYLES[i] ?? "text-muted-foreground"}`}>{i + 1}</td>
              <td className="p-3 font-display tracking-wider">{r.club}</td>
              <td className={`p-3 text-right font-display ${valueClass}`}>
                {r.pts > 0 ? r.pts.toFixed(0) : <span className="text-muted-foreground/60 text-xs italic">Never used</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function H2HCard({
  opponentId, opponentName, opponentBadge, opponentTint,
  wins, draws, losses, pf, pa, fixtures, selfId,
}: {
  opponentId: string;
  opponentName: string;
  opponentBadge?: string;
  opponentTint?: string;
  wins: number;
  draws: number;
  losses: number;
  pf: number;
  pa: number;
  fixtures: any[];
  selfId: string;
}) {
  const [open, setOpen] = useState(false);
  const total = wins + draws + losses;
  const wp = total ? Math.round((wins / total) * 100) : 0;
  const recent = fixtures.slice(0, 5);
  const tint = opponentTint ?? "var(--color-primary)";
  const resultLetter = (my: number, op: number) => (my > op ? "W" : my < op ? "L" : "D");
  const resultClass = (r: string) =>
    r === "W" ? "bg-emerald-600/80 text-white" : r === "L" ? "bg-red-600/80 text-white" : "bg-yellow-500/80 text-black";

  return (
    <div className={`relative shrink-0 snap-start premium-card rounded-lg overflow-hidden transition-all ${open ? "w-[520px]" : "w-[300px]"}`}>
      {/* Top tint accent */}
      <div className="h-1 w-full" style={{ background: tint }} />
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left">
        <div className="p-4 flex items-center gap-3 border-b border-border/40">
          {opponentBadge && (
            <img src={opponentBadge} alt="" className="w-12 h-12 shrink-0 drop-shadow" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.25em] text-silver/60">Opponent</div>
            <div className="font-display text-lg uppercase truncate">{opponentName}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-silver/60">Win %</div>
            <div className="font-display text-2xl" style={{ color: tint }}>{wp}%</div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border/40 text-center">
          <div className="py-3">
            <div className="text-[10px] uppercase tracking-wider text-silver/60">W</div>
            <div className="font-display text-xl text-emerald-400">{wins}</div>
          </div>
          <div className="py-3">
            <div className="text-[10px] uppercase tracking-wider text-silver/60">D</div>
            <div className="font-display text-xl text-yellow-400">{draws}</div>
          </div>
          <div className="py-3">
            <div className="text-[10px] uppercase tracking-wider text-silver/60">L</div>
            <div className="font-display text-xl text-red-400">{losses}</div>
          </div>
        </div>
        <div className="px-4 pb-3 grid grid-cols-2 gap-2 text-xs">
          <div className="text-muted-foreground">PF <span className="text-foreground font-display ml-1">{pf.toFixed(0)}</span></div>
          <div className="text-muted-foreground text-right">PA <span className="text-foreground font-display ml-1">{pa.toFixed(0)}</span></div>
        </div>
        <div className="px-4 pb-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-silver/60 mb-2">Recent Form</div>
          <div className="flex gap-1.5">
            {recent.length === 0 && <span className="text-xs text-muted-foreground">No fixtures yet</span>}
            {recent.map((f, i) => {
              const r = resultLetter(f.my, f.op);
              return (
                <span key={i} className={`w-7 h-7 rounded text-[11px] font-display flex items-center justify-center ${resultClass(r)}`} title={`${f.seasonName} GW${f.gameweek}: ${f.my}-${f.op}`}>
                  {r}
                </span>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] uppercase tracking-wider text-silver/50 flex items-center gap-1">
            {open ? "Hide all results" : "Tap for every result"}
            <span className="ml-auto" style={{ color: tint }}>{open ? "−" : "+"}</span>
          </div>
        </div>
      </button>
      {open && (
        <div className="border-t border-border/40 bg-black/20 max-h-72 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-card/60 text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0">
              <tr>
                <th className="p-2 text-left">Season</th>
                <th className="p-2 text-center">GW</th>
                <th className="p-2 text-right">Score</th>
                <th className="p-2 text-center w-8">R</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map((f, i) => {
                const r = resultLetter(f.my, f.op);
                return (
                  <tr key={i} className="border-t border-border/40">
                    <td className="p-2">{f.seasonName}</td>
                    <td className="p-2 text-center text-muted-foreground">{f.gameweek}</td>
                    <td className="p-2 text-right font-display">
                      <span className={r === "W" ? "text-emerald-400" : r === "L" ? "text-red-400" : "text-yellow-400"}>
                        {Number(f.my).toFixed(0)}
                      </span>
                      <span className="text-muted-foreground mx-1">–</span>
                      <span className="text-muted-foreground">{Number(f.op).toFixed(0)}</span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`inline-flex w-5 h-5 rounded text-[10px] font-display items-center justify-center ${resultClass(r)}`}>{r}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
