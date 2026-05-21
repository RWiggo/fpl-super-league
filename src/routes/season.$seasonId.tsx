import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { FormationPitch } from "@/components/FormationPitch";
import { getBranding } from "@/lib/managerBranding";
import { Trophy, Crown, Flame, Target, Zap, Skull, Shield, TrendingUp, TrendingDown, Users, Swords, Star, Goal, HandHelping, ArrowDown, AlertOctagon, Info, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/season/$seasonId")({
  component: SeasonPage,
});

function SeasonPage() {
  const { seasonId } = Route.useParams();
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    setD(null);
    (async () => {
      const seasonRes = await supabase.from("seasons").select("*").eq("id", seasonId).single();
      const sname = seasonRes.data?.name;
      const [managers, mst, standings, fixtures, gwTable, winS, loseS, unbeatenS, winlessS, teamStats, overallTOTS, weeklyHi, seasonPlayers] = await Promise.all([
        supabase.from("managers").select("*"),
        supabase.from("manager_season_teams").select("*").eq("season_id", seasonId),
        supabase.from("season_standings").select("*").eq("season_id", seasonId),
        supabase.from("fixture_records").select("*").eq("season_id", seasonId),
        supabase.from("gameweek_table").select("*").eq("season_id", seasonId),
        supabase.from("win_streaks").select("*").eq("season_name", sname),
        supabase.from("losing_streaks").select("*").eq("season_name", sname),
        supabase.from("unbeaten_streaks").select("*").eq("season_name", sname),
        supabase.from("winless_streaks").select("*").eq("season_name", sname),
        supabase.from("team_season_stats_full").select("*").eq("season_name", sname),
        supabase.from("overall_team_of_the_season").select("*").eq("season_name", sname),
        supabase.from("weekly_high_scores").select("*").eq("season_id", seasonId),
        supabase.from("player_team_history").select("*").eq("season_name", sname),
      ]);
      setD({
        season: seasonRes.data,
        managers: managers.data ?? [],
        mst: mst.data ?? [],
        standings: (standings.data ?? []).sort((a: any, b: any) => a.position - b.position),
        fixtures: fixtures.data ?? [],
        gwTable: gwTable.data ?? [],
        winS: winS.data ?? [],
        loseS: loseS.data ?? [],
        unbeatenS: unbeatenS.data ?? [],
        winlessS: winlessS.data ?? [],
        teamStats: teamStats.data ?? [],
        overallTOTS: overallTOTS.data ?? [],
        weeklyHi: weeklyHi.data ?? [],
        seasonPlayers: seasonPlayers.data ?? [],
      });
    })();
  }, [seasonId]);

  if (!d || !d.season) return <Skel />;

  const mById = (id: any) => d.managers.find((m: any) => String(m.id) === String(id));
  const mByName = (name: string) => d.managers.find((m: any) => m.name === name);
  const champ = mById(d.season.champion_manager_id);

  // Participants in this season
  const participants = d.mst
    .map((row: any) => ({ ...mById(row.manager_id), team_name: row.team_name }))
    .filter((m: any) => m && m.id);

  const maxGW = Math.max(...d.fixtures.map((f: any) => f.gameweek), 1);

  // Records
  const completed = d.fixtures.filter((f: any) => f.home_score != null);
  const highest = [...completed].sort((a: any, b: any) =>
    Math.max(b.home_score, b.away_score) - Math.max(a.home_score, a.away_score)
  )[0];
  const lowest = [...completed].sort((a: any, b: any) =>
    Math.min(a.home_score, a.away_score) - Math.min(b.home_score, b.away_score)
  )[0];
  const biggestWin = [...completed].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0))[0];
  const closestGame = [...completed].filter((f: any) => f.home_score !== f.away_score)
    .sort((a: any, b: any) => (a.margin ?? 0) - (b.margin ?? 0))[0];

  const longestWin = [...d.winS].filter((s: any) => s.outcome === "W").sort((a: any, b: any) => b.streak_length - a.streak_length)[0];
  const longestLose = [...d.loseS].filter((s: any) => s.outcome === "L").sort((a: any, b: any) => b.streak_length - a.streak_length)[0];
  const longestUnbeaten = [...d.unbeatenS].sort((a: any, b: any) => b.streak_length - a.streak_length)[0];
  const longestWinless = [...d.winlessS].sort((a: any, b: any) => b.streak_length - a.streak_length)[0];

  // Top scoring team / most clean sheets
  const topScorer = [...d.teamStats].sort((a: any, b: any) => (b.total_fpts ?? 0) - (a.total_fpts ?? 0))[0];
  const mostCS = [...d.teamStats].sort((a: any, b: any) => (b.combined_clean_sheets ?? 0) - (a.combined_clean_sheets ?? 0))[0];
  const mostGoals = [...d.teamStats].sort((a: any, b: any) => (b.out_goals ?? 0) - (a.out_goals ?? 0))[0];
  const mostYellows = [...d.teamStats].sort((a: any, b: any) => (b.combined_yellow_cards ?? 0) - (a.combined_yellow_cards ?? 0))[0];
  const mostAssists = [...d.teamStats].sort((a: any, b: any) => (b.out_assists ?? 0) - (a.out_assists ?? 0))[0];

  // Highest GW score by single team
  const topWeekly = [...d.weeklyHi].sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))[0];

  // Time at top / bottom of league (gw_table)
  const positionCounts = (() => {
    const top: Record<string, number> = {};
    const bot: Record<string, number> = {};
    d.gwTable.forEach((row: any) => {
      if (row.position === 1) top[row.manager_id] = (top[row.manager_id] ?? 0) + 1;
      const lastPos = Math.max(...d.gwTable.filter((r: any) => r.gameweek === row.gameweek).map((r: any) => r.position));
      if (row.position === lastPos) bot[row.manager_id] = (bot[row.manager_id] ?? 0) + 1;
    });
    const topId = Object.entries(top).sort((a, b) => b[1] - a[1])[0];
    const botId = Object.entries(bot).sort((a, b) => b[1] - a[1])[0];
    return { topId, botId };
  })();

  // Most dominant H2H from fixtures
  const dominantH2H = (() => {
    const records: Record<string, { winner: string; loser: string; w: number; total: number; pf: number; pa: number }> = {};
    completed.forEach((f: any) => {
      const a = f.home_manager < f.away_manager ? f.home_manager : f.away_manager;
      const b = f.home_manager < f.away_manager ? f.away_manager : f.home_manager;
      const key = `${a}|${b}`;
      if (!records[key]) records[key] = { winner: a, loser: b, w: 0, total: 0, pf: 0, pa: 0 };
      records[key].total++;
      const aWon = (f.winner_name === a);
      if (aWon) records[key].w++;
    });
    const arr = Object.values(records).map((r) => {
      const aWon = r.w;
      const bWon = r.total - r.w;
      const dominant = aWon >= bWon
        ? { winner: r.winner, loser: r.loser, wins: aWon, losses: bWon, total: r.total }
        : { winner: r.loser, loser: r.winner, wins: bWon, losses: aWon, total: r.total };
      return dominant;
    });
    return arr.sort((a, b) => (b.wins - b.losses) - (a.wins - a.losses))[0];
  })();

  return (
    <div>
      <SeasonHero
        season={d.season}
        champ={champ}
        topScorer={topScorer ? mByName(topScorer.manager_name) : null}
        topScorerPts={topScorer?.total_fpts ?? 0}
        longestWin={longestWin}
        longestLose={longestLose}
        mostCS={mostCS ? { name: mostCS.manager_name, value: mostCS.combined_clean_sheets } : null}
        wooden={(() => {
          const last = d.standings[d.standings.length - 1];
          return last ? mById(last.manager_id) : null;
        })()}
      />

      <ParticipantsCarousel participants={participants} />

      {/* League Table */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <SectionTitle kicker="Standings" title="The League Table" />
        <LeagueTable standings={d.standings} managers={d.managers} mst={d.mst} gwTable={d.gwTable} maxGW={maxGW} />
        <PositionChart gwTable={d.gwTable} managers={d.managers} maxGW={maxGW} />
      </section>

      {/* Fixtures */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
        <SectionTitle kicker="Match Centre" title="Fixtures & Results" />
        <FixturesPanel fixtures={d.fixtures} managers={d.managers} maxGW={maxGW} />
      </section>

      {/* Team of the Season */}
      {d.overallTOTS.length > 0 && (() => {
        const posMap: Record<string, "GK" | "DEF" | "MID" | "FWD"> = { G: "GK", GK: "GK", GKP: "GK", D: "DEF", DEF: "DEF", M: "MID", MID: "MID", F: "FWD", FWD: "FWD" };
        const totsForPitch = d.overallTOTS.map((p: any) => ({
          ...p,
          position: posMap[p.position] ?? p.position,
          manager_id: p.manager_id ?? mByName(p.manager_name)?.id,
        }));
        const counts = totsForPitch.reduce((acc: any, p: any) => { acc[p.position] = (acc[p.position] ?? 0) + 1; return acc; }, {});
        const formation = [counts.DEF ?? 0, counts.MID ?? 0, counts.FWD ?? 0].join("-");
        const totalPts = totsForPitch.reduce((s: number, p: any) => s + (Number(p.total_fantasy_points ?? p.fantasy_points ?? 0)), 0);
        return (
          <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-gold mb-1">The Best XI</div>
                <h3 className="font-display text-2xl md:text-3xl">Team of the Season · {formation}</h3>
                <p className="text-sm text-muted-foreground mt-1">Top point-scorers from across the league in a legal formation.</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Combined Points · <span className="text-gold font-display text-lg">{totalPts.toFixed(0)}</span>
              </div>
            </div>
            <FormationPitch players={totsForPitch} getManagerName={(id) => mById(id)?.name ?? ""} />
          </section>
        );
      })()}

      {/* Records */}
      <RecordsSection
        d={d}
        mById={mById}
        completed={completed}
        positionCounts={positionCounts}
        topWeekly={topWeekly}
        biggestWin={biggestWin}
        longestWin={longestWin}
        longestLose={longestLose}
        dominantH2H={dominantH2H}
        mostCS={mostCS}
        mostGoals={mostGoals}
        mostAssists={mostAssists}
        mostYellows={mostYellows}
      />
    </div>
  );
}

/* ======================= Records Section ======================= */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type RankRow = { rank: number; name: string; sub?: string; value: React.ReactNode; badge?: string | null };

function RecordCard({
  label,
  value,
  sub,
  icon,
  badge,
  dialogTitle,
  rows,
  valueHeader = "Value",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | null;
  dialogTitle: string;
  rows: RankRow[];
  valueHeader?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-left w-full focus:outline-none focus:ring-2 focus:ring-gold/50 rounded-lg">
          <div className="premium-card rounded-lg p-4 sm:p-6 group hover:border-gold/50 transition-all hover:-translate-y-1 text-center sm:text-left relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
              {icon && <span className="text-gold opacity-60 group-hover:opacity-100 transition shrink-0">{icon}</span>}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              {badge && <img src={badge} alt="" className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0" />}
              <div className="min-w-0">
                <div className="font-display text-3xl sm:text-4xl gold-gradient leading-none">{value}</div>
                {sub && <div className="text-[11px] sm:text-xs text-muted-foreground mt-1.5 truncate">{sub}</div>}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-center sm:justify-start gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold/70 group-hover:text-gold transition">
              <Info className="w-3 h-3" />
              <span>Tap for details</span>
              <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl gold-gradient">{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2 text-sm items-center">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">#</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Team</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-right">{valueHeader}</div>
            {rows.map((r) => (
              <React.Fragment key={r.rank}>
                <div className="font-display text-gold">{r.rank}</div>
                <div className="min-w-0 flex items-center gap-2">
                  {r.badge && <img src={r.badge} alt="" className="w-7 h-7 object-contain shrink-0" />}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.name}</div>
                    {r.sub && <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{r.sub}</div>}
                  </div>
                </div>
                <div className="font-display text-gold text-right tabular-nums">{r.value}</div>
              </React.Fragment>
            ))}
            {rows.length === 0 && <div className="col-span-3 text-center text-muted-foreground py-4">No data.</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecordsSection({
  d,
  mById,
  completed,
  positionCounts,
  topWeekly,
  biggestWin,
  longestWin,
  longestLose,
  dominantH2H,
  mostCS,
  mostGoals,
  mostAssists,
  mostYellows,
}: any) {
  // Helpers to resolve a manager (and hence their badge) from various row shapes
  const mByName = (name?: string) => name ? d.managers.find((m: any) => m.name === name) : null;
  const mByTeam = (team?: string) => team ? d.managers.find((m: any) => m.team_name === team)
    ?? (() => { const r = d.mst.find((x: any) => x.team_name === team); return r ? mById(r.manager_id) : null; })() : null;
  const badgeByManager = (name?: string) => { const m = mByName(name); return m ? getBranding(m.id)?.badge ?? null : null; };
  const badgeByTeam = (team?: string) => { const m = mByTeam(team); return m ? getBranding(m.id)?.badge ?? null : null; };

  // Per-team weekly score entries from fixtures
  const teamScores = useMemo(() => {
    const out: { manager: string; team: string; gw: number; score: number; opp_team: string; opp_score: number }[] = [];
    completed.forEach((f: any) => {
      out.push({ manager: f.home_manager, team: f.home_team, gw: f.gameweek, score: f.home_score, opp_team: f.away_team, opp_score: f.away_score });
      out.push({ manager: f.away_manager, team: f.away_team, gw: f.gameweek, score: f.away_score, opp_team: f.home_team, opp_score: f.home_score });
    });
    return out;
  }, [completed]);

  const top5HighGW = [...teamScores].sort((a, b) => b.score - a.score).slice(0, 5);
  const top5LowGW = [...teamScores].sort((a, b) => a.score - b.score).slice(0, 5);
  const top5Margin = [...completed].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0)).slice(0, 5);

  const top5WinStreaks = [...d.winS].filter((s: any) => s.outcome === "W").sort((a: any, b: any) => b.streak_length - a.streak_length).slice(0, 5);
  const top5LoseStreaks = [...d.loseS].filter((s: any) => s.outcome === "L").sort((a: any, b: any) => b.streak_length - a.streak_length).slice(0, 5);

  // Streak detail: fixtures during streak window for that team
  const streakFixtures = (s: any) => {
    if (!s) return [];
    return completed
      .filter((f: any) => (f.home_team === s.team_name || f.away_team === s.team_name) && f.gameweek >= s.streak_start_gw && f.gameweek <= s.streak_end_gw)
      .sort((a: any, b: any) => a.gameweek - b.gameweek)
      .map((f: any, i: number) => {
        const isHome = f.home_team === s.team_name;
        const my = isHome ? f.home_score : f.away_score;
        const their = isHome ? f.away_score : f.home_score;
        const opp = isHome ? f.away_team : f.home_team;
        const result = my > their ? "W" : my < their ? "L" : "D";
        return { rank: i + 1, name: opp, sub: `GW${f.gameweek} · ${isHome ? "Home" : "Away"}`, value: `${my}-${their} ${result}`, badge: badgeByTeam(opp) };
      });
  };

  // Dominant H2H - top 5
  const top5H2H = (() => {
    const records: Record<string, { winner: string; loser: string; w: number; total: number }> = {};
    completed.forEach((f: any) => {
      const a = f.home_manager < f.away_manager ? f.home_manager : f.away_manager;
      const b = f.home_manager < f.away_manager ? f.away_manager : f.home_manager;
      const key = `${a}|${b}`;
      if (!records[key]) records[key] = { winner: a, loser: b, w: 0, total: 0 };
      records[key].total++;
      if (f.winner_name === a) records[key].w++;
    });
    return Object.values(records)
      .map((r) => {
        const aWon = r.w; const bWon = r.total - r.w;
        return aWon >= bWon
          ? { winner: r.winner, loser: r.loser, wins: aWon, losses: bWon, total: r.total }
          : { winner: r.loser, loser: r.winner, wins: bWon, losses: aWon, total: r.total };
      })
      .sort((a, b) => (b.wins - b.losses) - (a.wins - a.losses))
      .slice(0, 5);
  })();

  // Team stat rankings
  const rankByStat = (key: string, _label: string) =>
    [...d.teamStats]
      .filter((t: any) => t[key] != null)
      .sort((a: any, b: any) => (b[key] ?? 0) - (a[key] ?? 0))
      .slice(0, 5)
      .map((t: any, i: number) => ({ rank: i + 1, name: t.team_name, sub: t.manager_name, value: Number(t[key]).toFixed(0), badge: badgeByManager(t.manager_name) }));

  // Position counts top 5
  const positionTop5 = (target: "first" | "last") => {
    const counts: Record<string, number> = {};
    const lastByGw: Record<number, number> = {};
    d.gwTable.forEach((row: any) => {
      if (target === "first" && row.position === 1) counts[row.manager_id] = (counts[row.manager_id] ?? 0) + 1;
      if (target === "last") {
        if (lastByGw[row.gameweek] == null) {
          lastByGw[row.gameweek] = Math.max(...d.gwTable.filter((r: any) => r.gameweek === row.gameweek).map((r: any) => r.position));
        }
        if (row.position === lastByGw[row.gameweek]) counts[row.manager_id] = (counts[row.manager_id] ?? 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n], i) => {
      const m = mById(id);
      return { rank: i + 1, name: m?.team_name ?? "-", sub: m?.name, value: `${n} GW${n === 1 ? "" : "s"}`, badge: m ? getBranding(m.id)?.badge ?? null : null };
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
      <SectionTitle kicker="Highlights" title="Season Records" />

      <h3 className="font-display text-2xl text-gold mt-8 mb-4">Points & Performance</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RecordCard
          label="Highest Single GW"
          value={topWeekly?.score ?? top5HighGW[0]?.score ?? "-"}
          sub={top5HighGW[0] ? `${top5HighGW[0].team} · GW${top5HighGW[0].gw}` : ""}
          icon={<Flame className="w-5 h-5" />}
          badge={badgeByManager(top5HighGW[0]?.manager)}
          dialogTitle="Top 5 Single Gameweek Scores"
          valueHeader="Score"
          rows={top5HighGW.map((r, i) => ({ rank: i + 1, name: r.team, sub: `GW${r.gw} vs ${r.opp_team}`, value: r.score, badge: badgeByManager(r.manager) }))}
        />
        <RecordCard
          label="Biggest Win"
          value={biggestWin?.margin ?? "-"}
          sub={biggestWin ? `${biggestWin.winner_team} bt ${biggestWin.loser_team}` : ""}
          icon={<Swords className="w-5 h-5" />}
          badge={badgeByTeam(biggestWin?.winner_team)}
          dialogTitle="Top 5 Biggest Wins"
          valueHeader="Margin"
          rows={top5Margin.map((f: any, i: number) => ({ rank: i + 1, name: f.winner_team, sub: `bt ${f.loser_team} · GW${f.gameweek}`, value: f.margin, badge: badgeByTeam(f.winner_team) }))}
        />
        <RecordCard
          label="Lowest GW Score"
          value={top5LowGW[0]?.score ?? "-"}
          sub={top5LowGW[0] ? `${top5LowGW[0].team} · GW${top5LowGW[0].gw}` : ""}
          icon={<TrendingDown className="w-5 h-5" />}
          badge={badgeByManager(top5LowGW[0]?.manager)}
          dialogTitle="5 Lowest Gameweek Scores"
          valueHeader="Score"
          rows={top5LowGW.map((r, i) => ({ rank: i + 1, name: r.team, sub: `GW${r.gw} vs ${r.opp_team}`, value: r.score, badge: badgeByManager(r.manager) }))}
        />
        <RecordCard
          label="Longest Win Streak"
          value={longestWin?.streak_length ?? "-"}
          sub={longestWin ? `${longestWin.team_name} · GW${longestWin.streak_start_gw}–${longestWin.streak_end_gw}` : ""}
          icon={<TrendingUp className="w-5 h-5" />}
          badge={badgeByTeam(longestWin?.team_name)}
          dialogTitle={longestWin ? `${longestWin.team_name}'s Win Streak (${longestWin.streak_length})` : "Longest Win Streak"}
          valueHeader="Result"
          rows={streakFixtures(longestWin)}
        />
        <RecordCard
          label="Longest Losing Streak"
          value={longestLose?.streak_length ?? "-"}
          sub={longestLose ? `${longestLose.team_name} · GW${longestLose.streak_start_gw}–${longestLose.streak_end_gw}` : ""}
          icon={<Skull className="w-5 h-5" />}
          badge={badgeByTeam(longestLose?.team_name)}
          dialogTitle={longestLose ? `${longestLose.team_name}'s Losing Streak (${longestLose.streak_length})` : "Longest Losing Streak"}
          valueHeader="Result"
          rows={streakFixtures(longestLose)}
        />
        <RecordCard
          label="Most Dominant H2H"
          value={dominantH2H ? `${dominantH2H.wins}-${dominantH2H.losses}` : "-"}
          sub={dominantH2H ? `${dominantH2H.winner} over ${dominantH2H.loser}` : ""}
          icon={<Crown className="w-5 h-5" />}
          badge={badgeByManager(dominantH2H?.winner)}
          dialogTitle="Top 5 Most Dominant Head-to-Heads"
          valueHeader="Record"
          rows={top5H2H.map((h, i) => ({ rank: i + 1, name: h.winner, sub: `over ${h.loser}`, value: `${h.wins}-${h.losses}`, badge: badgeByManager(h.winner) }))}
        />
      </div>

      <h3 className="font-display text-2xl text-gold mt-12 mb-4">Players & Possession</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RecordCard
          label="Most Goals"
          value={mostGoals?.out_goals ?? "-"}
          sub={mostGoals?.team_name}
          icon={<Goal className="w-5 h-5" />}
          badge={badgeByManager(mostGoals?.manager_name)}
          dialogTitle="Top 5 · Most Goals"
          valueHeader="Goals"
          rows={rankByStat("out_goals", "Goals")}
        />
        <RecordCard
          label="Most Assists"
          value={mostAssists?.out_assists ?? "-"}
          sub={mostAssists?.team_name}
          icon={<HandHelping className="w-5 h-5" />}
          badge={badgeByManager(mostAssists?.manager_name)}
          dialogTitle="Top 5 · Most Assists"
          valueHeader="Assists"
          rows={rankByStat("out_assists", "Assists")}
        />
        <RecordCard
          label="Most Clean Sheets"
          value={mostCS?.combined_clean_sheets ?? "-"}
          sub={mostCS?.team_name}
          icon={<Shield className="w-5 h-5" />}
          badge={badgeByManager(mostCS?.manager_name)}
          dialogTitle="Top 5 · Most Clean Sheets"
          valueHeader="CS"
          rows={rankByStat("combined_clean_sheets", "CS")}
        />
        <RecordCard
          label="Most Yellow Cards"
          value={mostYellows?.combined_yellow_cards ?? "-"}
          sub={mostYellows?.team_name}
          icon={<CardIcon color="yellow" />}
          badge={badgeByManager(mostYellows?.manager_name)}
          dialogTitle="Top 5 · Most Yellow Cards"
          valueHeader="Yellows"
          rows={rankByStat("combined_yellow_cards", "Yellows")}
        />
        <RecordCard
          label="Most Red Cards"
          value={rankByStat("out_red_cards", "Reds")[0]?.value ?? "-"}
          sub={rankByStat("out_red_cards", "Reds")[0]?.name}
          icon={<CardIcon color="red" />}
          badge={rankByStat("out_red_cards", "Reds")[0]?.badge}
          dialogTitle="Top 5 · Most Red Cards"
          valueHeader="Reds"
          rows={rankByStat("out_red_cards", "Reds")}
        />
        <RecordCard
          label="Most Own Goals"
          value={rankByStat("out_own_goals", "OG")[0]?.value ?? "-"}
          sub={rankByStat("out_own_goals", "OG")[0]?.name}
          icon={<AlertOctagon className="w-5 h-5" />}
          badge={rankByStat("out_own_goals", "OG")[0]?.badge}
          dialogTitle="Top 5 · Most Own Goals"
          valueHeader="OG"
          rows={rankByStat("out_own_goals", "OG")}
        />
        <RecordCard
          label="Most GWs at #1"
          value={positionCounts.topId?.[1] ?? "-"}
          sub={positionCounts.topId ? mById(positionCounts.topId[0])?.team_name : ""}
          icon={<Trophy className="w-5 h-5" />}
          badge={positionCounts.topId ? getBranding(positionCounts.topId[0])?.badge : null}
          dialogTitle="Top 5 · Most Gameweeks in 1st"
          valueHeader="Gameweeks"
          rows={positionTop5("first")}
        />
        <RecordCard
          label="Most GWs at the Bottom"
          value={positionCounts.botId?.[1] ?? "-"}
          sub={positionCounts.botId ? mById(positionCounts.botId[0])?.team_name : ""}
          icon={<ArrowDown className="w-5 h-5" />}
          badge={positionCounts.botId ? getBranding(positionCounts.botId[0])?.badge : null}
          dialogTitle="Top 5 · Most Gameweeks in Last"
          valueHeader="Gameweeks"
          rows={positionTop5("last")}
        />
      </div>

      <StatExplorer teamStats={d.teamStats} managers={d.managers} />
    </section>
  );
}

/* ======================= Stat Explorer ======================= */

const STAT_OPTIONS: { key: string; label: string; group: string }[] = [
  // Featured
  { group: "Featured", key: "out_goals", label: "Goals" },
  { group: "Featured", key: "out_assists", label: "Assists" },
  { group: "Featured", key: "combined_clean_sheets", label: "Clean Sheets" },
  { group: "Featured", key: "combined_yellow_cards", label: "Yellow Cards" },
  { group: "Featured", key: "out_red_cards", label: "Red Cards" },
  { group: "Featured", key: "out_own_goals", label: "Own Goals" },
  { group: "Featured", key: "total_fpts", label: "Total Fantasy Points" },
  // Attack
  { group: "Attack", key: "out_goals_outside_box", label: "Goals from Outside the Box" },
  { group: "Attack", key: "out_fantasy_assists", label: "Fantasy Assists" },
  { group: "Attack", key: "out_key_passes", label: "Key Passes" },
  { group: "Attack", key: "out_shots_on_target", label: "Shots on Target" },
  { group: "Attack", key: "out_successful_dribbles", label: "Successful Dribbles" },
  { group: "Attack", key: "out_accurate_crosses", label: "Accurate Crosses" },
  { group: "Attack", key: "out_big_chances_created", label: "Big Chances Created" },
  { group: "Attack", key: "out_big_chances_missed", label: "Big Chances Missed" },
  { group: "Attack", key: "out_free_kick_goals", label: "Free Kick Goals" },
  { group: "Attack", key: "out_hat_tricks", label: "Hat-tricks" },
  { group: "Attack", key: "out_penalties_drawn", label: "Penalties Drawn" },
  { group: "Attack", key: "out_penalties_missed", label: "Penalties Missed" },
  // Defence
  { group: "Defence", key: "out_tackles_won", label: "Tackles Won" },
  { group: "Defence", key: "out_interceptions", label: "Interceptions" },
  { group: "Defence", key: "out_ball_recoveries", label: "Ball Recoveries" },
  { group: "Defence", key: "combined_aerial_duels_won", label: "Aerial Duels Won" },
  { group: "Defence", key: "combined_clearances_off_line", label: "Clearances off the Line" },
  { group: "Defence", key: "combined_goals_against", label: "Goals Against" },
  { group: "Defence", key: "combined_errors", label: "Errors Leading to Goal" },
  { group: "Defence", key: "combined_penalties_given_away", label: "Penalties Given Away" },
  // Discipline & misc
  { group: "Discipline", key: "combined_fouls_suffered", label: "Fouls Suffered" },
  { group: "Discipline", key: "out_offsides", label: "Offsides" },
  // Goalkeeping
  { group: "Goalkeeping", key: "gk_saves", label: "GK Saves" },
  { group: "Goalkeeping", key: "gk_clean_sheets", label: "GK Clean Sheets" },
  { group: "Goalkeeping", key: "gk_penalty_saves", label: "GK Penalty Saves" },
  { group: "Goalkeeping", key: "gk_one_on_ones_won", label: "GK 1-on-1s Won" },
  { group: "Goalkeeping", key: "gk_aerial_duels_won", label: "GK Aerial Duels Won" },
  { group: "Goalkeeping", key: "gk_error_goals", label: "GK Errors Leading to Goal" },
  // Workload
  { group: "Workload", key: "combined_minutes", label: "Minutes Played" },
  { group: "Workload", key: "combined_games_started", label: "Games Started" },
  { group: "Workload", key: "out_subs_on", label: "Substitutions On" },
];

function StatExplorer({ teamStats, managers }: { teamStats: any[]; managers: any[] }) {
  const [stat, setStat] = useState<string>("out_goals");
  const mByName = (name: string) => managers.find((m: any) => m.name === name);
  const ranked = useMemo(() => {
    return [...teamStats]
      .filter((t) => t[stat] != null)
      .sort((a, b) => (b[stat] ?? 0) - (a[stat] ?? 0))
      .map((t, i) => ({ rank: i + 1, team: t.team_name, manager: t.manager_name, value: Number(t[stat] ?? 0) }));
  }, [teamStats, stat]);

  const current = STAT_OPTIONS.find((o) => o.key === stat);

  return (
    <div className="mt-12">
      <h3 className="font-display text-2xl text-gold mb-4">Stat Explorer</h3>
      <p className="text-sm text-muted-foreground mb-4">Pick any stat to see the full league ranking for the season.</p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Stat</label>
        <select
          value={stat}
          onChange={(e) => setStat(e.target.value)}
          className="bg-card border border-border rounded px-3 py-2 text-sm font-display text-gold min-w-[260px]"
        >
          {Array.from(new Set(STAT_OPTIONS.map((o) => o.group))).map((g) => (
            <optgroup key={g} label={g}>
              {STAT_OPTIONS.filter((o) => o.group === g).map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="premium-card rounded-lg overflow-hidden">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-card/60 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-2 sm:p-3 text-left w-8">#</th>
              <th className="p-2 sm:p-3 text-left">Team</th>
              <th className="hidden sm:table-cell p-3 text-left">Manager</th>
              <th className="p-2 sm:p-3 text-right">{current?.label ?? "Value"}</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r) => {
              const m = mByName(r.manager);
              const b = m ? getBranding(m.id) : null;
              return (
                <tr key={r.rank} className="border-t border-border/40 hover:bg-gold/5">
                  <td className="p-2 sm:p-3 font-display text-gold">{r.rank}</td>
                  <td className="p-2 sm:p-3 font-medium">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {b?.badge && <img src={b.badge} alt="" className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0" />}
                      <div className="min-w-0">
                        <div className="truncate">{r.team}</div>
                        <div className="sm:hidden text-[10px] text-muted-foreground capitalize truncate">{r.manager}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell p-3 text-muted-foreground capitalize">{r.manager}</td>
                  <td className="p-2 sm:p-3 text-right font-display text-gold tabular-nums">{r.value.toLocaleString()}</td>
                </tr>
              );
            })}
            {ranked.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================= Hero ======================= */

function SeasonHero({ season, champ, topScorer, topScorerPts, longestWin, longestLose, mostCS, wooden }: any) {
  const [yA, yB] = season.name.split("/");
  const champBranding = champ ? getBranding(champ.id) : null;
  const woodenBranding = wooden ? getBranding(wooden.id) : null;

  // Season-unique accent: each season gets a deliberately distinct hue from a
  // curated, well-spaced palette so consecutive seasons never look alike.
  const SEASON_HUES = [220, 0, 145, 35, 285, 175, 50, 320, 110, 260, 15, 195];
  const idx = Math.max(0, (Number(season.id) || 1) - 1) % SEASON_HUES.length;
  const hue = SEASON_HUES[idx];
  const hueRotate = (hue - 220 + 360) % 360; // base logo is ~220° blue
  const accent = `hsl(${hue} 80% 55%)`;
  const accentDeep = `hsl(${hue} 70% 35%)`;

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 ucl-stars opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none opacity-50"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 65%)` }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-16 items-center">
          {/* Bespoke season crest - base league logo with a season-unique colourway */}
          <div className="relative mx-auto lg:mx-0">
            <div className="relative w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] flex items-center justify-center">
              <div className="absolute inset-0 rounded-full" style={{ border: `2px solid ${accent}66` }} />
              <div className="absolute inset-4 rounded-full" style={{ border: `1px solid ${accent}33` }} />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 90deg, ${accent} 0%, transparent 25%, ${accentDeep} 50%, transparent 75%, ${accent} 100%)`,
                  opacity: 0.22,
                }}
              />
              <div
                className="absolute inset-6 rounded-full blur-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`, opacity: 0.5 }}
              />
              <img
                src={new URL("@/assets/fpl-super-league-logo.png", import.meta.url).href}
                alt={`${season.name} crest`}
                className="relative w-[78%] h-[78%] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
                style={{ filter: `hue-rotate(${hueRotate}deg) saturate(1.05)` }}
              />
              <Crown
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-9 h-9"
                style={{ color: accent, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}
              />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-md border backdrop-blur-sm"
                style={{ background: `linear-gradient(180deg, ${accentDeep}cc, #00000099)`, borderColor: `${accent}80` }}
              >
                <div className="font-display text-lg sm:text-xl tracking-[0.25em] text-white leading-none">
                  {yA}<span className="opacity-60 mx-1">/</span>{yB}
                </div>
              </div>
            </div>
            <div className="mt-6 text-center text-[10px] uppercase tracking-[0.4em]" style={{ color: accent }}>
              FPL Super League · Season {yA}/{yB}
            </div>
          </div>

          {/* Headline + meta */}
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-gold mb-3">Season Hub</div>
            <h1 className="font-display text-5xl md:text-7xl leading-none mb-4">
              <span className="gold-gradient">{season.name}</span>
            </h1>
            <div className="h-px w-24 bg-gold/60 my-6" />

            <div className="flex flex-wrap gap-3 mb-6">
              {champ && (
                <Link to="/team/$managerId" params={{ managerId: String(champ.id) }}
                      className="group inline-flex items-center gap-4 premium-card rounded-lg pl-3 pr-5 py-3 hover:border-gold/60 transition">
                  {champBranding?.badge && (
                    <img src={champBranding.badge} alt="" className="w-12 h-12 object-contain" />
                  )}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Champion</div>
                    <div className="font-display text-2xl text-gold leading-none capitalize group-hover:underline">{champ.name}</div>
                    <div className="text-xs text-muted-foreground">{champ.team_name}</div>
                  </div>
                  <Trophy className="w-7 h-7 text-gold ml-2" />
                </Link>
              )}
              {wooden && (
                <Link to="/team/$managerId" params={{ managerId: String(wooden.id) }}
                      className="group inline-flex items-center gap-4 premium-card rounded-lg pl-3 pr-5 py-3 hover:border-amber-700/60 transition">
                  {woodenBranding?.badge && (
                    <img src={woodenBranding.badge} alt="" className="w-12 h-12 object-contain opacity-80" />
                  )}
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Wooden Spoon</div>
                    <div className="font-display text-2xl text-amber-700 leading-none capitalize group-hover:underline">{wooden.name}</div>
                    <div className="text-xs text-muted-foreground">{wooden.team_name}</div>
                  </div>
                  <span className="text-3xl ml-2" role="img" aria-label="wooden spoon">🥄</span>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Mini label="Top Scorers" value={topScorerPts ? Number(topScorerPts).toFixed(0) : "-"} sub={topScorer?.team_name} />
              <Mini label="Best Win Run" value={longestWin?.streak_length ?? "-"} sub={longestWin?.team_name} />
              <Mini label="Worst Losing Run" value={longestLose?.streak_length ?? "-"} sub={longestLose?.team_name} />
              <Mini label="Most Clean Sheets" value={mostCS?.value ?? "-"} sub={mostCS?.name} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================= Participants Carousel ======================= */

function ParticipantsCarousel({ participants }: { participants: any[] }) {
  if (!participants.length) return null;
  // Duplicate the list so the marquee loops seamlessly
  const items = [...participants, ...participants];
  return (
    <section className="border-y border-border/50 bg-card/40 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Participating Teams</div>
      </div>
      <div className="relative">
        <div className="flex gap-12 marquee w-max items-center">
          {items.map((m, i) => {
            const branding = getBranding(m.id);
            return (
              <Link key={i} to="/team/$managerId" params={{ managerId: String(m.id) }}
                    className="flex flex-col items-center gap-2 min-w-[110px] group">
                {branding?.badge ? (
                  <img src={branding.badge} alt={m.team_name}
                       className="w-20 h-20 object-contain drop-shadow-lg group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center text-2xl">{m.name?.[0]}</div>
                )}
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-gold text-center max-w-[110px] truncate">
                  {m.team_name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ======================= League Table ======================= */

function LeagueTable({ standings, managers, mst, gwTable, maxGW }: any) {
  const mById = (id: any) => managers.find((m: any) => String(m.id) === String(id));
  const teamNameFor = (mid: any) => mst.find((r: any) => String(r.manager_id) === String(mid))?.team_name ?? mById(mid)?.team_name;

  // Form: last 5 results from gameweek_table per manager (W/D/L derived from cumulative wins/draws/losses)
  const formByManager = useMemo(() => {
    const out: Record<string, ("W" | "D" | "L")[]> = {};
    managers.forEach((m: any) => {
      const rows = gwTable.filter((r: any) => String(r.manager_id) === String(m.id))
        .sort((a: any, b: any) => a.gameweek - b.gameweek);
      const results: ("W" | "D" | "L")[] = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].wins > rows[i - 1].wins) results.push("W");
        else if (rows[i].draws > rows[i - 1].draws) results.push("D");
        else if (rows[i].losses > rows[i - 1].losses) results.push("L");
      }
      out[String(m.id)] = results.slice(-5);
    });
    return out;
  }, [gwTable, managers]);

  type SortKey = "position" | "team" | "P" | "W" | "D" | "L" | "PF" | "PA" | "PD" | "Pts";
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "position", dir: "asc" });

  const sortedRows = useMemo(() => {
    const valueOf = (row: any, key: SortKey): number | string => {
      switch (key) {
        case "position": return row.position;
        case "team": return (teamNameFor(row.manager_id) ?? "").toString().toLowerCase();
        case "P": return (row.wins ?? 0) + (row.draws ?? 0) + (row.losses ?? 0);
        case "W": return row.wins ?? 0;
        case "D": return row.draws ?? 0;
        case "L": return row.losses ?? 0;
        case "PF": return Number(row.points_for ?? 0);
        case "PA": return Number(row.points_against ?? 0);
        case "PD": return Number(row.points_difference ?? 0);
        case "Pts": return row.total_points ?? 0;
      }
    };
    const arr = [...standings];
    arr.sort((a, b) => {
      const av = valueOf(a, sort.key);
      const bv = valueOf(b, sort.key);
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [standings, sort, mst]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev.key !== key) {
        // sensible default: numeric metrics start desc, position/team start asc
        const numericDesc = key !== "position" && key !== "team";
        return { key, dir: numericDesc ? "desc" : "asc" };
      }
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
  };

  const SortableTh = ({ k, label, className }: { k: SortKey; label: string; className?: string }) => {
    const active = sort.key === k;
    return (
      <th className={className}>
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={`inline-flex items-center gap-0.5 uppercase tracking-wider hover:text-gold transition ${active ? "text-gold" : ""}`}
        >
          {label}
          <span className="text-[8px] leading-none w-2 inline-block">
            {active ? (sort.dir === "asc" ? "▲" : "▼") : ""}
          </span>
        </button>
      </th>
    );
  };

  return (
    <div className="premium-card rounded-lg mt-6 overflow-hidden">
      <table className="w-full text-[10px] sm:text-sm table-fixed">
        <colgroup>
          <col className="w-6 sm:w-auto" />
          <col />
          <col className="w-7 sm:w-auto" />
          <col className="w-7 sm:w-auto" />
          <col className="w-7 sm:w-auto" />
          <col className="w-7 sm:w-auto" />
          <col className="w-9 sm:w-auto" />
          <col className="w-9 sm:w-auto" />
          <col className="hidden lg:table-column" />
          <col className="w-10 sm:w-auto" />
          <col className="hidden md:table-column" />
        </colgroup>
        <thead className="bg-card/60 text-[9px] sm:text-xs uppercase tracking-wider text-muted-foreground select-none">
          <tr>
            <SortableTh k="position" label="#" className="px-1 py-2 sm:p-3 text-center" />
            <SortableTh k="team" label="Team" className="px-1 py-2 sm:p-3 text-left" />
            <SortableTh k="P" label="P" className="px-0.5 py-2 sm:p-3 text-center" />
            <SortableTh k="W" label="W" className="px-0.5 py-2 sm:p-3 text-center" />
            <SortableTh k="D" label="D" className="px-0.5 py-2 sm:p-3 text-center" />
            <SortableTh k="L" label="L" className="px-0.5 py-2 sm:p-3 text-center" />
            <SortableTh k="PF" label="PF" className="px-0.5 py-2 sm:p-3 text-right" />
            <SortableTh k="PA" label="PA" className="px-0.5 py-2 sm:p-3 text-right" />
            <SortableTh k="PD" label="PD" className="hidden lg:table-cell p-3 text-right" />
            <SortableTh k="Pts" label="Pts" className="px-1 py-2 sm:p-3 text-right" />
            <th className="hidden md:table-cell p-3 text-center">Form</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row: any) => {
            const m = mById(row.manager_id);
            const branding = getBranding(row.manager_id);
            const games = (row.wins ?? 0) + (row.draws ?? 0) + (row.losses ?? 0);
            const isChamp = row.position === 1;
            const form = formByManager[String(row.manager_id)] ?? [];
            return (
              <tr key={row.id} className={`border-t border-border/40 hover:bg-gold/5 ${isChamp ? "bg-gold/5" : ""}`}>
                <td className="px-1 py-2 sm:p-3 text-center font-display text-sm sm:text-lg text-gold">{row.position}</td>
                <td className="px-1 py-2 sm:p-3">
                  <Link to="/team/$managerId" params={{ managerId: String(row.manager_id) }} className="flex items-center gap-1.5 sm:gap-3 hover:text-gold min-w-0">
                    {branding?.badge && <img src={branding.badge} alt="" className="w-5 h-5 sm:w-8 sm:h-8 object-contain shrink-0" />}
                    {isChamp && <Trophy className="hidden sm:inline w-4 h-4 text-gold shrink-0" />}
                    <div className="min-w-0">
                      <div className="font-medium truncate leading-tight">{teamNameFor(row.manager_id)}</div>
                      <div className="hidden sm:block text-[10px] sm:text-xs text-muted-foreground capitalize truncate">{m?.name}</div>
                    </div>
                  </Link>
                </td>
                <td className="text-center px-0.5 py-2 sm:p-3 tabular-nums">{games}</td>
                <td className="text-center px-0.5 py-2 sm:p-3 tabular-nums">{row.wins}</td>
                <td className="text-center px-0.5 py-2 sm:p-3 tabular-nums">{row.draws}</td>
                <td className="text-center px-0.5 py-2 sm:p-3 tabular-nums">{row.losses}</td>
                <td className="text-right px-0.5 py-2 sm:p-3 tabular-nums">{Number(row.points_for ?? 0).toFixed(0)}</td>
                <td className="text-right px-0.5 py-2 sm:p-3 tabular-nums">{Number(row.points_against ?? 0).toFixed(0)}</td>
                <td className="hidden lg:table-cell text-right p-3 tabular-nums">{Number(row.points_difference ?? 0).toFixed(0)}</td>
                <td className="text-right px-1 py-2 sm:p-3 font-display text-gold text-xs sm:text-base tabular-nums">{row.total_points}</td>
                <td className="hidden md:table-cell p-3">
                  <div className="flex justify-center gap-1">
                    {form.map((r, i) => (
                      <span key={i} className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold ${
                        r === "W" ? "bg-success/80 text-background" : r === "D" ? "bg-muted text-foreground" : "bg-destructive/80 text-background"
                      }`}>{r}</span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ======================= Position Chart ======================= */

function PositionChart({ gwTable, managers, maxGW }: any) {
  const [hover, setHover] = useState<string | null>(null);
  const W = 800;
  const H = 320;
  const PAD_L = 30;
  const PAD_R = 12;
  const PAD_T = 16;
  const PAD_B = 28;
  const teamCount = managers.length || 12;

  const xFor = (gw: number) => PAD_L + ((gw - 1) / Math.max(maxGW - 1, 1)) * (W - PAD_L - PAD_R);
  const yFor = (pos: number) => PAD_T + ((pos - 1) / (teamCount - 1)) * (H - PAD_T - PAD_B);

  const lines = managers.map((m: any) => {
    const rows = gwTable.filter((r: any) => String(r.manager_id) === String(m.id)).sort((a: any, b: any) => a.gameweek - b.gameweek);
    if (!rows.length) return null;
    const path = rows.map((r: any, i: number) => `${i === 0 ? "M" : "L"} ${xFor(r.gameweek).toFixed(1)} ${yFor(r.position).toFixed(1)}`).join(" ");
    const branding = getBranding(m.id);
    return { id: String(m.id), name: m.team_name, path, color: branding?.primary ?? "#888", final: rows[rows.length - 1] };
  }).filter(Boolean);

  return (
    <div className="premium-card rounded-lg p-4 mt-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-gold">Race for the title</div>
          <div className="font-display text-xl">League Position by Gameweek</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {lines.map((l: any) => (
            <button key={l.id} onMouseEnter={() => setHover(l.id)} onMouseLeave={() => setHover(null)}
                    className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1 rounded transition ${hover === l.id ? "bg-card border border-gold/40" : "opacity-70 hover:opacity-100"}`}>
              <span className="w-3 h-3 rounded-full" style={{ background: l.color }} />
              {l.name}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* Y grid (positions) */}
        {Array.from({ length: teamCount }, (_, i) => i + 1).map((pos) => (
          <g key={pos}>
            <line x1={PAD_L} x2={W - PAD_R} y1={yFor(pos)} y2={yFor(pos)} stroke="oklch(1 0 0 / 6%)" strokeWidth="1" />
            <text x={PAD_L - 6} y={yFor(pos) + 3} textAnchor="end" fontSize="9" fill="oklch(0.7 0.02 250)">{pos}</text>
          </g>
        ))}
        {/* X grid */}
        {Array.from({ length: Math.ceil(maxGW / 5) + 1 }, (_, i) => i * 5).filter((g) => g >= 1 && g <= maxGW).map((g) => (
          <g key={g}>
            <line x1={xFor(g)} x2={xFor(g)} y1={PAD_T} y2={H - PAD_B} stroke="oklch(1 0 0 / 4%)" strokeWidth="1" />
            <text x={xFor(g)} y={H - PAD_B + 14} textAnchor="middle" fontSize="9" fill="oklch(0.7 0.02 250)">GW{g}</text>
          </g>
        ))}
        {lines.map((l: any) => (
          <path key={l.id} d={l.path} fill="none" stroke={l.color}
                strokeWidth={hover === l.id ? 3 : 1.6}
                strokeOpacity={hover && hover !== l.id ? 0.15 : 0.95}
                strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {/* Final position end-caps with team badges */}
        {lines.map((l: any) => {
          const m = managers.find((x: any) => String(x.id) === l.id);
          const badge = m ? getBranding(m.id)?.badge : null;
          const cx = xFor(l.final.gameweek);
          const cy = yFor(l.final.position);
          const size = hover === l.id ? 18 : 14;
          return (
            <g key={l.id} opacity={hover && hover !== l.id ? 0.25 : 1}>
              <circle cx={cx} cy={cy} r={size / 2 + 1} fill="oklch(0.13 0.04 265)" stroke={l.color} strokeWidth="1.5" />
              {badge ? (
                <image href={badge} x={cx - size / 2} y={cy - size / 2} width={size} height={size} />
              ) : (
                <circle cx={cx} cy={cy} r={3} fill={l.color} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ======================= Fixtures ======================= */

function FixturesPanel({ fixtures, managers, maxGW }: any) {
  const completedGWs = [...new Set(fixtures.filter((f: any) => f.home_score != null).map((f: any) => f.gameweek))] as number[];
  const latestGW = completedGWs.length ? Math.max(...completedGWs) : maxGW;
  const [gw, setGw] = useState<number>(latestGW);
  const [managerFilter, setManagerFilter] = useState<string>("all");

  const mByName = (name: string) => managers.find((m: any) => m.name === name);

  const filteredByGw = fixtures.filter((f: any) => f.gameweek === gw);
  const teamFixtures = managerFilter !== "all"
    ? fixtures.filter((f: any) => f.home_manager === managerFilter || f.away_manager === managerFilter)
        .sort((a: any, b: any) => a.gameweek - b.gameweek)
    : null;

  const list = teamFixtures ?? filteredByGw;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Gameweek</label>
        <select value={gw} onChange={(e) => { setGw(Number(e.target.value)); setManagerFilter("all"); }}
                disabled={managerFilter !== "all"}
                className="bg-card border border-border rounded px-3 py-2 text-sm font-display text-gold disabled:opacity-40">
          {Array.from({ length: maxGW }, (_, i) => i + 1).map((g) => (
            <option key={g} value={g}>GW {g}</option>
          ))}
        </select>
        <span className="text-muted-foreground">·</span>
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Team</label>
        <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}
                className="bg-card border border-border rounded px-3 py-2 text-sm">
          <option value="all">All teams (this gameweek)</option>
          {managers.map((m: any) => (
            <option key={m.id} value={m.name}>{m.team_name}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((f: any) => {
          const homeM = mByName(f.home_manager);
          const awayM = mByName(f.away_manager);
          const hb = homeM ? getBranding(homeM.id) : null;
          const ab = awayM ? getBranding(awayM.id) : null;
          const homeWon = f.home_score > f.away_score;
          const awayWon = f.away_score > f.home_score;
          const isDraw = f.home_score != null && f.home_score === f.away_score;
          const homeColor = homeWon ? "text-emerald-400" : isDraw ? "text-yellow-400" : "text-red-400";
          const awayColor = awayWon ? "text-emerald-400" : isDraw ? "text-yellow-400" : "text-red-400";
          const hasScore = f.home_score != null;
          return (
            <div key={f.id} className="premium-card rounded-lg p-3 sm:p-4">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">GW {f.gameweek}</div>

              {/* Mobile: stacked rows so full team names always fit */}
              <div className="sm:hidden space-y-2">
                {[
                  { team: f.home_team, manager: f.home_manager, m: homeM, b: hb, score: f.home_score, won: homeWon, color: homeColor },
                  { team: f.away_team, manager: f.away_manager, m: awayM, b: ab, score: f.away_score, won: awayWon, color: awayColor },
                ].map((side, i) => (
                  <Link
                    key={i}
                    to="/team/$managerId"
                    params={{ managerId: String(side.m?.id ?? "") }}
                    className="flex items-center gap-2 hover:text-gold"
                  >
                    {side.b?.badge && <img src={side.b.badge} alt="" className="w-8 h-8 object-contain shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium text-sm leading-tight break-words ${side.won ? "text-gold" : ""}`}>{side.team}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{side.manager}</div>
                    </div>
                    <div className={`font-display text-xl tabular-nums shrink-0 ${hasScore ? side.color : "text-muted-foreground"}`}>
                      {side.score ?? "-"}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop: original side-by-side layout */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <Link to="/team/$managerId" params={{ managerId: String(homeM?.id ?? "") }} className="flex items-center gap-2 justify-end text-right hover:text-gold min-w-0">
                  <div className="min-w-0">
                    <div className={`font-medium truncate ${homeWon ? "text-gold" : ""}`}>{f.home_team}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{f.home_manager}</div>
                  </div>
                  {hb?.badge && <img src={hb.badge} alt="" className="w-10 h-10 object-contain" />}
                </Link>
                <div className="font-display text-2xl text-center tabular-nums">
                  <span className={hasScore ? homeColor : ""}>{f.home_score ?? "-"}</span>
                  <span className="mx-2 text-muted-foreground">:</span>
                  <span className={hasScore ? awayColor : ""}>{f.away_score ?? "-"}</span>
                </div>
                <Link to="/team/$managerId" params={{ managerId: String(awayM?.id ?? "") }} className="flex items-center gap-2 hover:text-gold min-w-0">
                  {ab?.badge && <img src={ab.badge} alt="" className="w-10 h-10 object-contain" />}
                  <div className="min-w-0">
                    <div className={`font-medium truncate ${awayWon ? "text-gold" : ""}`}>{f.away_team}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{f.away_manager}</div>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="col-span-full text-center text-muted-foreground p-8">No fixtures.</div>}
      </div>
    </div>
  );
}

/* ======================= Helpers ======================= */

function Mini({ label, value, sub }: { label: string; value: any; sub?: any }) {
  return (
    <div className="border-l-0 sm:border-l-2 border-gold sm:pl-3 text-center sm:text-left">
      <div className="font-display text-2xl md:text-3xl text-gold leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/80 truncate">{sub}</div>}
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

function CardIcon({ color, className = "w-5 h-5" }: { color: "yellow" | "red"; className?: string }) {
  const fill = color === "yellow" ? "#facc15" : "#dc2626";
  return (
    <svg viewBox="0 0 16 22" className={className} aria-hidden>
      <rect x="1" y="1" width="14" height="20" rx="2" fill={fill} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
    </svg>
  );
}

function Skel() {
  return <div className="max-w-7xl mx-auto px-4 py-20 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>;
}
