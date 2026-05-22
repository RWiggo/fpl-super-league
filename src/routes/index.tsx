import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StatCard, Skeleton } from "@/components/StatCard";
import { Trophy, Flame, Target, Crown, TrendingUp, Zap, Skull } from "lucide-react";
import logo from "@/assets/fpl-super-league-logo.png";
import { getBranding } from "@/lib/managerBranding";
import { MANAGER_KITS } from "@/lib/managerKits";
import { getNickname } from "@/lib/managerNicknames";
import { currentTeamName } from "@/lib/currentTeamNames";

function rankColor(pos: number, total: number) {
  if (pos === 1) return "text-emerald-500 font-bold";
  if (pos === 2) return "text-emerald-400";
  if (pos === 3) return "text-emerald-300";
  if (pos === total) return "text-red-600 font-bold";
  if (pos === total - 1) return "text-red-500";
  if (pos === total - 2) return "text-red-400";
  return "text-foreground/70";
}

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "The FPL Super League" },
      { name: "description", content: "Champions, records, and history of the FPL Super League." },
    ],
  }),
});

function Home() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [seasons, managers, alltime, fixtures, streaks, weeklyHigh, currentStandings] = await Promise.all([
        supabase.from("seasons").select("*").order("year_start"),
        supabase.from("managers").select("*"),
        supabase.from("alltime_table").select("*").order("total_points", { ascending: false }),
        supabase.from("fixture_records").select("*"),
        supabase.from("win_streaks").select("*").order("streak_length", { ascending: false }),
        supabase.from("weekly_high_scores").select("*"),
        supabase.from("season_standings").select("*"),
      ]);

      // Paginate player_team_alltime view (>1000 rows)
      const playerRows: any[] = [];
      for (let from = 0; from < 5000; from += 1000) {
        const { data } = await supabase
          .from("player_team_alltime")
          .select("manager_id,player_id,player_name,total_fantasy_points,total_minutes,seasons_played")
          .range(from, from + 999);
        if (!data || data.length === 0) break;
        playerRows.push(...data);
        if (data.length < 1000) break;
      }

      // Paginate player_season_stats for goals/assists/cards/clean sheets
      const playerSeasonRows: any[] = [];
      for (let from = 0; from < 5000; from += 1000) {
        const { data } = await supabase
          .from("player_season_stats")
          .select("manager_id,position,gk_saves,out_goals,gk_goals,out_assists_total,gk_assists_total,out_clean_sheets,gk_clean_sheets,out_yellow_cards,gk_yellow_cards,out_red_cards,gk_red_cards,out_hat_tricks,out_big_chances_created,out_big_chances_missed,out_ball_recoveries,out_tackles_won,out_interceptions,out_offsides,out_fouls_suffered,out_penalties_missed,out_penalties_drawn,out_own_goals,gk_own_goals,out_key_passes,gk_key_passes,out_aerial_duels_won,gk_aerial_duels_won,out_successful_dribbles,out_accurate_crosses,out_goals_outside_box,out_free_kick_goals,out_error_goals,gk_error_goals,gk_penalty_saves,gk_one_on_ones_won,gk_penalties_given_away,out_penalties_given_away,minutes")
          .range(from, from + 999);
        if (!data || data.length === 0) break;
        playerSeasonRows.push(...data);
        if (data.length < 1000) break;
      }

      setData({
        seasons: seasons.data ?? [],
        managers: managers.data ?? [],
        alltime: alltime.data ?? [],
        fixtures: fixtures.data ?? [],
        streaks: streaks.data ?? [],
        weeklyHigh: weeklyHigh.data ?? [],
        standings: currentStandings.data ?? [],
        playerRows,
        playerSeasonRows,
      });
    })();
  }, []);

  if (!data) return <HomeSkeleton />;

  const managerById = (id: string) => data.managers.find((m: any) => m.id === id);
  const seasonById = (id: string) => data.seasons.find((s: any) => s.id === id);
  const completedSeasons = data.seasons.filter((s: any) => s.season_complete && s.champion_manager_id);
  const currentSeason = data.seasons[data.seasons.length - 1];

  // Records
  const highestScore = [...data.fixtures].sort((a: any, b: any) =>
    Math.max(b.home_score ?? 0, b.away_score ?? 0) - Math.max(a.home_score ?? 0, a.away_score ?? 0)
  )[0];
  const highestVal = highestScore ? Math.max(highestScore.home_score, highestScore.away_score) : 0;
  const highestTeam = highestScore
    ? (highestScore.home_score >= highestScore.away_score ? highestScore.home_manager_id : highestScore.away_manager_id)
    : null;

  const biggestMargin = [...data.fixtures].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0))[0];
  const longestWinStreak = data.streaks.filter((s: any) => s.streak_type === "win" || s.type === "win" || s.streak_type === "W")[0] ?? data.streaks[0];

  // Title counts
  const titleCounts: Record<string, number> = {};
  completedSeasons.forEach((s: any) => {
    if (s.champion_manager_id) titleCounts[s.champion_manager_id] = (titleCounts[s.champion_manager_id] ?? 0) + 1;
  });
  const mostTitles = Object.entries(titleCounts).sort((a, b) => b[1] - a[1])[0];

  const winPctLeader = [...data.alltime]
    .filter((r: any) => (r.wins + r.draws + r.losses) >= 50)
    .sort((a: any, b: any) => {
      const aw = a.wins / (a.wins + a.draws + a.losses);
      const bw = b.wins / (b.wins + b.draws + b.losses);
      return bw - aw;
    })[0];

  // Current standings (latest season)
  const currentStandings = currentSeason
    ? data.standings.filter((s: any) => s.season_id === currentSeason.id).sort((a: any, b: any) => a.position - b.position)
    : [];

  // Recent fixtures - last 5 GWs
  const recentFixtures = [...data.fixtures]
    .filter((f: any) => f.home_score != null)
    .sort((a: any, b: any) => {
      const sa = seasonById(a.season_id)?.year_start ?? 0;
      const sb = seasonById(b.season_id)?.year_start ?? 0;
      if (sb !== sa) return sb - sa;
      return (b.gameweek ?? 0) - (a.gameweek ?? 0);
    })
    .slice(0, 10);

  const tickerItems = [
    `🏆 Highest Score: ${highestVal} pts (${managerById(highestTeam)?.name ?? "-"})`,
    `⚔️ Biggest Margin: ${biggestMargin?.margin ?? 0} pts`,
    `🔥 Longest Win Streak: ${longestWinStreak?.streak_length ?? 0}`,
    `👑 Most Titles: ${mostTitles ? `${managerById(mostTitles[0])?.name} - ${mostTitles[1]}` : "-"}`,
    `📊 ${data.fixtures.length} Fixtures Played`,
  ];

  // Wooden spoons (most last-place finishes)
  const spoonCounts: Record<string, number> = {};
  data.seasons.filter((s: any) => s.season_complete).forEach((s: any) => {
    const rows = data.standings.filter((r: any) => r.season_id === s.id);
    if (!rows.length) return;
    const maxPos = Math.max(...rows.map((r: any) => r.position ?? 0));
    if (!maxPos) return;
    rows.filter((r: any) => r.position === maxPos).forEach((r: any) => {
      spoonCounts[r.manager_id] = (spoonCounts[r.manager_id] ?? 0) + 1;
    });
  });
  const stinkers = Object.entries(spoonCounts)
    .map(([id, count]) => ({
      manager: data.managers.find((m: any) => String(m.id) === String(id)),
      count,
    }))
    .filter((x: any) => x.manager)
    .sort((a, b) => b.count - a.count);

  // Per-manager player aggregates from player_team_alltime
  type PlayerRow = { manager_id: any; player_name: string; total_fantasy_points: number; total_minutes: number; seasons_played: number };
  const mgrAgg: Record<string, {
    playersUsed: number;
    totalMinutes: number;
    top: PlayerRow | null;        // top scorer
    ironMan: PlayerRow | null;    // most minutes
    loyalist: PlayerRow | null;   // most seasons under this manager
  }> = {};
  (data.playerRows as PlayerRow[] | undefined)?.forEach((r) => {
    const id = String(r.manager_id);
    const a = mgrAgg[id] ?? (mgrAgg[id] = { playersUsed: 0, totalMinutes: 0, top: null, ironMan: null, loyalist: null });
    a.playersUsed++;
    a.totalMinutes += Number(r.total_minutes ?? 0);
    if (!a.top || (r.total_fantasy_points ?? 0) > (a.top.total_fantasy_points ?? 0)) a.top = r;
    if (!a.ironMan || (r.total_minutes ?? 0) > (a.ironMan.total_minutes ?? 0)) a.ironMan = r;
    if (!a.loyalist || (r.seasons_played ?? 0) > (a.loyalist.seasons_played ?? 0)) a.loyalist = r;
  });

  // Per-manager best single-gameweek score
  const bestGwByManager: Record<string, { score: number; season: string; gw: number | null }> = {};
  data.fixtures.forEach((f: any) => {
    if (f.home_score == null || f.away_score == null) return;
    const tryAdd = (mid: string, score: number) => {
      if (!mid) return;
      const cur = bestGwByManager[mid];
      if (!cur || score > cur.score) {
        bestGwByManager[mid] = {
          score,
          season: seasonById(f.season_id)?.name ?? "",
          gw: f.gameweek ?? null,
        };
      }
    };
    tryAdd(String(f.home_manager_id), Number(f.home_score));
    tryAdd(String(f.away_manager_id), Number(f.away_score));
  });

  // Build a unique fun defining stat per manager.
  // Each league-extreme is awarded to one team only; the rest fall back to their own personal quirk.
  const allMgrIds = data.managers.map((m: any) => String(m.id));
  const nameToId: Record<string, string> = {};
  data.managers.forEach((m: any) => { nameToId[String(m.name).trim().toLowerCase()] = String(m.id); });
  const idForName = (name: string | undefined | null) => name ? nameToId[String(name).trim().toLowerCase()] ?? null : null;

  const leaderOf = (fn: (id: string) => number, mode: "max" | "min" = "max") => {
    let best: { id: string; v: number } | null = null;
    for (const id of allMgrIds) {
      const v = fn(id);
      if (!isFinite(v)) continue;
      if (!best) { best = { id, v }; continue; }
      if (mode === "max" ? v > best.v : v < best.v) best = { id, v };
    }
    return best;
  };

  // Best win streak + worst losing streak per manager
  const bestWinStreak: Record<string, number> = {};
  const worstLossStreak: Record<string, number> = {};
  (data.streaks as any[]).forEach((s) => {
    const id = idForName(s.manager_name);
    if (!id) return;
    const len = Number(s.streak_length ?? 0);
    if (s.outcome === "W") bestWinStreak[id] = Math.max(bestWinStreak[id] ?? 0, len);
    if (s.outcome === "L") worstLossStreak[id] = Math.max(worstLossStreak[id] ?? 0, len);
  });

  // Career totals from player_season_stats
  type CareerTot = {
    goals: number; assists: number; cleans: number; gkCleans: number; gkSaves: number;
    yellows: number; reds: number; hatTricks: number; bigChancesCreated: number;
    bigChancesMissed: number; ballRecoveries: number; tackles: number; interceptions: number;
    offsides: number; foulsSuffered: number; pensMissed: number; pensWon: number;
    ownGoals: number; keyPasses: number; aerials: number; dribbles: number; crosses: number;
    goalsOutsideBox: number; freeKickGoals: number; errorGoals: number; pensConceded: number;
    pensSaved: number; oneOnOnesWon: number; minutes: number;
  };
  const newTot = (): CareerTot => ({
    goals: 0, assists: 0, cleans: 0, gkCleans: 0, gkSaves: 0, yellows: 0, reds: 0,
    hatTricks: 0, bigChancesCreated: 0, bigChancesMissed: 0, ballRecoveries: 0, tackles: 0,
    interceptions: 0, offsides: 0, foulsSuffered: 0, pensMissed: 0, pensWon: 0, ownGoals: 0,
    keyPasses: 0, aerials: 0, dribbles: 0, crosses: 0, goalsOutsideBox: 0, freeKickGoals: 0,
    errorGoals: 0, pensConceded: 0, pensSaved: 0, oneOnOnesWon: 0, minutes: 0,
  });
  const careerTotals: Record<string, CareerTot> = {};
  (data.playerSeasonRows as any[] | undefined)?.forEach((r) => {
    const id = String(r.manager_id);
    const c = careerTotals[id] ?? (careerTotals[id] = newTot());
    const n = (v: any) => Number(v ?? 0);
    c.goals += n(r.out_goals) + n(r.gk_goals);
    c.assists += n(r.out_assists_total) + n(r.gk_assists_total);
    c.cleans += n(r.out_clean_sheets) + n(r.gk_clean_sheets);
    c.gkCleans += n(r.gk_clean_sheets);
    c.gkSaves += n(r.gk_saves);
    c.yellows += n(r.out_yellow_cards) + n(r.gk_yellow_cards);
    c.reds += n(r.out_red_cards) + n(r.gk_red_cards);
    c.hatTricks += n(r.out_hat_tricks);
    c.bigChancesCreated += n(r.out_big_chances_created);
    c.bigChancesMissed += n(r.out_big_chances_missed);
    c.ballRecoveries += n(r.out_ball_recoveries);
    c.tackles += n(r.out_tackles_won);
    c.interceptions += n(r.out_interceptions);
    c.offsides += n(r.out_offsides);
    c.foulsSuffered += n(r.out_fouls_suffered);
    c.pensMissed += n(r.out_penalties_missed);
    c.pensWon += n(r.out_penalties_drawn);
    c.ownGoals += n(r.out_own_goals) + n(r.gk_own_goals);
    c.keyPasses += n(r.out_key_passes) + n(r.gk_key_passes);
    c.aerials += n(r.out_aerial_duels_won) + n(r.gk_aerial_duels_won);
    c.dribbles += n(r.out_successful_dribbles);
    c.crosses += n(r.out_accurate_crosses);
    c.goalsOutsideBox += n(r.out_goals_outside_box);
    c.freeKickGoals += n(r.out_free_kick_goals);
    c.errorGoals += n(r.out_error_goals) + n(r.gk_error_goals);
    c.pensConceded += n(r.out_penalties_given_away) + n(r.gk_penalties_given_away);
    c.pensSaved += n(r.gk_penalty_saves);
    c.oneOnOnesWon += n(r.gk_one_on_ones_won);
    c.minutes += n(r.minutes);
  });

  const atRow = (id: string) => data.alltime.find((x: any) => String(x.manager_id) === id);

  // Define league-wide leader stats in priority order.
  // Each card only shows a stat the manager actually leads the league in.
  type LeaderDef = {
    key: string;
    label: string;
    value: (id: string) => string;
    score: (id: string) => number;
    valid: (id: string) => boolean;
    mode?: "max" | "min";
  };
  const fmt = (n: number) => Number(n).toLocaleString();
  const ct = (id: string) => careerTotals[id];
  const has = (id: string, k: keyof CareerTot) => (ct(id)?.[k] ?? 0) > 0;
  const leaderDefs: LeaderDef[] = [
    { key: "wins", label: "Win Machine", score: (id) => Number(atRow(id)?.total_wins ?? -Infinity),
      valid: (id) => !!atRow(id), value: (id) => `${atRow(id)!.total_wins} career wins - the most ever` },
    { key: "pf", label: "Points Machine", score: (id) => Number(atRow(id)?.total_points_for ?? -Infinity),
      valid: (id) => !!atRow(id), value: (id) => `${fmt(atRow(id)!.total_points_for)} points scored all-time` },
    { key: "gw", label: "Biggest GW Haul", score: (id) => bestGwByManager[id]?.score ?? -Infinity,
      valid: (id) => !!bestGwByManager[id], value: (id) => `${bestGwByManager[id].score} pts${bestGwByManager[id].gw ? ` - GW${bestGwByManager[id].gw}` : ""}` },
    { key: "streak", label: "Streak King", score: (id) => bestWinStreak[id] ?? -Infinity,
      valid: (id) => (bestWinStreak[id] ?? 0) > 0, value: (id) => `${bestWinStreak[id]}-game winning run` },
    { key: "goals", label: "Goal Machine", score: (id) => ct(id)?.goals ?? -Infinity,
      valid: (id) => has(id, "goals"), value: (id) => `${ct(id).goals} goals scored all-time` },
    { key: "assists", label: "Playmaker", score: (id) => ct(id)?.assists ?? -Infinity,
      valid: (id) => has(id, "assists"), value: (id) => `${ct(id).assists} assists all-time` },
    { key: "cleans", label: "Brick Wall", score: (id) => ct(id)?.cleans ?? -Infinity,
      valid: (id) => has(id, "cleans"), value: (id) => `${ct(id).cleans} clean sheets all-time` },
    { key: "gkSaves", label: "Safe Hands", score: (id) => ct(id)?.gkSaves ?? -Infinity,
      valid: (id) => has(id, "gkSaves"), value: (id) => `${fmt(ct(id).gkSaves)} goalkeeper saves` },
    { key: "hatTricks", label: "Hat-Trick Hero", score: (id) => ct(id)?.hatTricks ?? -Infinity,
      valid: (id) => has(id, "hatTricks"), value: (id) => `${ct(id).hatTricks} hat-tricks delivered` },
    { key: "bigChancesCreated", label: "Chance Creator", score: (id) => ct(id)?.bigChancesCreated ?? -Infinity,
      valid: (id) => has(id, "bigChancesCreated"), value: (id) => `${fmt(ct(id).bigChancesCreated)} big chances created` },
    { key: "bigChancesMissed", label: "Sitter Specialist", score: (id) => ct(id)?.bigChancesMissed ?? -Infinity,
      valid: (id) => has(id, "bigChancesMissed"), value: (id) => `${fmt(ct(id).bigChancesMissed)} big chances skied` },
    { key: "ballRecoveries", label: "Ball Hoover", score: (id) => ct(id)?.ballRecoveries ?? -Infinity,
      valid: (id) => has(id, "ballRecoveries"), value: (id) => `${fmt(ct(id).ballRecoveries)} ball recoveries` },
    { key: "tackles", label: "Tackle Tyrant", score: (id) => ct(id)?.tackles ?? -Infinity,
      valid: (id) => has(id, "tackles"), value: (id) => `${fmt(ct(id).tackles)} tackles won` },
    { key: "interceptions", label: "Mind Reader", score: (id) => ct(id)?.interceptions ?? -Infinity,
      valid: (id) => has(id, "interceptions"), value: (id) => `${fmt(ct(id).interceptions)} interceptions made` },
    { key: "offsides", label: "Offside Magnet", score: (id) => ct(id)?.offsides ?? -Infinity,
      valid: (id) => has(id, "offsides"), value: (id) => `${fmt(ct(id).offsides)} offside flags raised` },
    { key: "keyPasses", label: "Pass Master", score: (id) => ct(id)?.keyPasses ?? -Infinity,
      valid: (id) => has(id, "keyPasses"), value: (id) => `${fmt(ct(id).keyPasses)} key passes played` },
    { key: "aerials", label: "Aerial King", score: (id) => ct(id)?.aerials ?? -Infinity,
      valid: (id) => has(id, "aerials"), value: (id) => `${fmt(ct(id).aerials)} aerial duels won` },
    { key: "dribbles", label: "Silky Dribbler", score: (id) => ct(id)?.dribbles ?? -Infinity,
      valid: (id) => has(id, "dribbles"), value: (id) => `${fmt(ct(id).dribbles)} successful dribbles` },
    { key: "crosses", label: "Crossing Connoisseur", score: (id) => ct(id)?.crosses ?? -Infinity,
      valid: (id) => has(id, "crosses"), value: (id) => `${fmt(ct(id).crosses)} accurate crosses` },
    { key: "goalsOutsideBox", label: "Worldie Merchant", score: (id) => ct(id)?.goalsOutsideBox ?? -Infinity,
      valid: (id) => has(id, "goalsOutsideBox"), value: (id) => `${ct(id).goalsOutsideBox} goals from outside the box` },
    { key: "freeKickGoals", label: "Dead Ball Specialist", score: (id) => ct(id)?.freeKickGoals ?? -Infinity,
      valid: (id) => has(id, "freeKickGoals"), value: (id) => `${ct(id).freeKickGoals} free-kick goals` },
    { key: "pensWon", label: "Penalty Magnet", score: (id) => ct(id)?.pensWon ?? -Infinity,
      valid: (id) => has(id, "pensWon"), value: (id) => `${ct(id).pensWon} penalties won` },
    { key: "pensMissed", label: "Spot Kick Choker", score: (id) => ct(id)?.pensMissed ?? -Infinity,
      valid: (id) => has(id, "pensMissed"), value: (id) => `${ct(id).pensMissed} penalties missed` },
    { key: "pensSaved", label: "Penalty Stopper", score: (id) => ct(id)?.pensSaved ?? -Infinity,
      valid: (id) => has(id, "pensSaved"), value: (id) => `${ct(id).pensSaved} penalties saved` },
    { key: "pensConceded", label: "Clumsy Defender", score: (id) => ct(id)?.pensConceded ?? -Infinity,
      valid: (id) => has(id, "pensConceded"), value: (id) => `${ct(id).pensConceded} penalties given away` },
    { key: "foulsSuffered", label: "Most Fouled", score: (id) => ct(id)?.foulsSuffered ?? -Infinity,
      valid: (id) => has(id, "foulsSuffered"), value: (id) => `${fmt(ct(id).foulsSuffered)} fouls suffered` },
    { key: "ownGoals", label: "Wrong Net Specialist", score: (id) => ct(id)?.ownGoals ?? -Infinity,
      valid: (id) => has(id, "ownGoals"), value: (id) => `${ct(id).ownGoals} own goals scored` },
    { key: "errorGoals", label: "Howler Merchant", score: (id) => ct(id)?.errorGoals ?? -Infinity,
      valid: (id) => has(id, "errorGoals"), value: (id) => `${ct(id).errorGoals} errors leading to goals` },
    { key: "oneOnOnesWon", label: "1-v-1 Specialist", score: (id) => ct(id)?.oneOnOnesWon ?? -Infinity,
      valid: (id) => has(id, "oneOnOnesWon"), value: (id) => `${ct(id).oneOnOnesWon} 1-on-1s won` },
    { key: "draws", label: "Draw Master", score: (id) => Number(atRow(id)?.total_draws ?? -Infinity),
      valid: (id) => Number(atRow(id)?.total_draws ?? 0) > 0, value: (id) => `${atRow(id)!.total_draws} draws in the draft - the most` },
    { key: "yellows", label: "Card Magnet", score: (id) => ct(id)?.yellows ?? -Infinity,
      valid: (id) => has(id, "yellows"), value: (id) => `${ct(id).yellows} yellow cards collected` },
    { key: "reds", label: "Hot Heads", score: (id) => ct(id)?.reds ?? -Infinity,
      valid: (id) => has(id, "reds"), value: (id) => `${ct(id).reds} red cards collected` },
    { key: "minutes", label: "Iron Man Manager", score: (id) => ct(id)?.minutes ?? -Infinity,
      valid: (id) => has(id, "minutes"), value: (id) => `${fmt(ct(id).minutes)} player minutes fielded` },
    { key: "players", label: "Squad Rotator", score: (id) => mgrAgg[id]?.playersUsed ?? -Infinity,
      valid: (id) => !!mgrAgg[id], value: (id) => `${mgrAgg[id].playersUsed} different players used` },
    { key: "fewPlayers", label: "Lean Squad", score: (id) => mgrAgg[id]?.playersUsed ?? Infinity,
      valid: (id) => !!mgrAgg[id], value: (id) => `Only ${mgrAgg[id].playersUsed} players ever used`, mode: "min" },
    { key: "losses", label: "The Biggest Loser", score: (id) => Number(atRow(id)?.total_losses ?? -Infinity),
      valid: (id) => !!atRow(id), value: (id) => `${atRow(id)!.total_losses} career defeats` },
    { key: "pa", label: "Leakiest Defence", score: (id) => Number(atRow(id)?.total_points_against ?? -Infinity),
      valid: (id) => !!atRow(id), value: (id) => `${fmt(atRow(id)!.total_points_against)} points conceded all-time` },
    { key: "lossStreak", label: "Glass Jaw", score: (id) => worstLossStreak[id] ?? -Infinity,
      valid: (id) => (worstLossStreak[id] ?? 0) > 0, value: (id) => `${worstLossStreak[id]}-game losing skid` },
  ];

  // Compute leader of each stat among eligible managers.
  // Ties broken by lower manager id for stability.
  const leaderByKey: Record<string, string | null> = {};
  for (const def of leaderDefs) {
    const mode = def.mode ?? "max";
    let best: { id: string; v: number } | null = null;
    for (const id of allMgrIds) {
      if (!def.valid(id)) continue;
      const v = def.score(id);
      if (!isFinite(v)) continue;
      if (!best) { best = { id, v }; continue; }
      if (mode === "max" ? v > best.v : v < best.v) best = { id, v };
    }
    leaderByKey[def.key] = best?.id ?? null;
  }

  const definingStat = (id: string): { label: string; value: string } | null => {
    // Only show a stat if this manager actually leads the league in it.
    for (const def of leaderDefs) {
      if (leaderByKey[def.key] === id) {
        return { label: def.label, value: def.value(id) };
      }
    }
    // Fallback only for Average Team - never invents records.
    if (id === "12") return { label: "Mission Statement", value: "Just here to fill the numbers" };
    return null;
  };


  return (
    <div>
      {/* HERO - league crest centred, every competing team orbiting */}
      <section className="relative overflow-hidden border-b border-silver/20 min-h-[92vh] flex items-center">
        <div className="absolute inset-0 ucl-stars opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] max-w-[1200px] aspect-square rounded-full blur-3xl pointer-events-none animate-pulse"
          style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 60%)", opacity: 0.3 }}
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <div className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-silver mb-4">EST. 2022 · The Official Archive</div>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.85] mb-6">
              <span className="block">THE</span>
              <span className="block silver-gradient">FPL SUPER LEAGUE</span>
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {completedSeasons.length} completed season{completedSeasons.length === 1 ? "" : "s"}
              {currentSeason && !currentSeason.season_complete ? " · 1 live campaign" : ""}. {data.managers.length} managers. One eternal archive.
            </p>
          </div>

          <TeamConstellation managers={data.managers} logoSrc={logo} />

          <div className="flex flex-wrap gap-3 justify-center mt-12">
            <Link to="/records" className="px-6 py-3 bg-primary text-primary-foreground font-semibold uppercase tracking-[0.18em] text-xs rounded hover:opacity-90 transition primary-glow">
              Enter The Archive
            </Link>
            {currentSeason && (
              <Link to="/season/$seasonId" params={{ seasonId: currentSeason.id }} className="px-6 py-3 border border-silver/50 hover:border-primary hover:text-primary font-semibold uppercase tracking-[0.18em] text-xs rounded transition">
                Live Season →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* HALL OF CHAMPIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2 inline-flex items-center gap-2 justify-center">
            <Crown className="w-4 h-4" /> Roll of Honour
          </div>
          <h2 className="font-display text-4xl md:text-5xl">Hall of Champions</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
            League winners enshrined forever. Lift the trophy, earn your place.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {completedSeasons.map((s: any) => {
            const champ = managerById(s.champion_manager_id);
            const b = champ ? getBranding(String(champ.id)) : null;
            const tint = b?.primary ?? "#d4af37";
            const kit = champ ? MANAGER_KITS[String(champ.id)]?.home : null;
            return (
              <Link
                key={s.id}
                to="/season/$seasonId"
                params={{ seasonId: s.id }}
                className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-gold/70 transition-all hover:-translate-y-2 p-7 min-h-[260px] flex flex-col"
                style={{ background: `linear-gradient(135deg, ${tint}30 0%, ${tint}08 50%, rgba(10,17,48,0.85) 100%)` }}
              >
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition" style={{ background: tint }} />
                {kit && <img src={kit} alt="" className="absolute -bottom-6 -right-6 w-44 h-44 object-contain opacity-25 group-hover:opacity-40 transition" />}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-6 h-6 text-gold" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold/90 font-bold">{s.name} Champion</span>
                  </div>
                  {b?.badge && <img src={b.badge} alt="" className="w-16 h-16 object-contain mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />}
                  <div className="font-display text-4xl mb-1 capitalize text-white">{currentTeamName(champ?.id, champ?.team_name ?? champ?.name)}</div>
                  <div className="text-sm text-muted-foreground capitalize">Managed by {champ?.name}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HALL OF STINKERS */}
      {stinkers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
          <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-[0.3em] text-red-400/90 mb-2 inline-flex items-center gap-2 justify-center">
              <Skull className="w-4 h-4" /> Wall of Shame
            </div>
            <h2 className="font-display text-4xl md:text-5xl">Hall of Stinkers</h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
              Wooden-spoon winners. Last place isn't an accident - it's a legacy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stinkers.map((s: any, i: number) => {
              const b = getBranding(String(s.manager.id));
              const tint = b?.primary ?? "#b34747";
              const kit = MANAGER_KITS[String(s.manager.id)]?.home;
              return (
                <Link
                  key={s.manager.id}
                  to="/team/$managerId"
                  params={{ managerId: String(s.manager.id) }}
                  className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-red-400/60 transition-all hover:-translate-y-1 p-6 flex items-center gap-5 min-h-[140px]"
                  style={{ background: `linear-gradient(135deg, rgba(120,30,30,0.45) 0%, ${tint}15 60%, rgba(10,17,48,0.85) 100%)` }}
                >
                  <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition bg-red-500/40" />
                  {kit && <img src={kit} alt="" className="absolute -right-6 bottom-0 w-32 h-32 object-contain opacity-20 grayscale group-hover:opacity-30 transition" />}
                  <div className="relative flex items-center gap-4 w-full">
                    <div className="font-display text-5xl text-red-300/90 w-10 text-center leading-none">{i + 1}</div>
                    {b?.badge ? (
                      <img src={b.badge} alt="" className="w-14 h-14 object-contain grayscale-[0.4] flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0" style={{ background: tint }}>
                        {currentTeamName(s.manager.id, s.manager.team_name ?? s.manager.name).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-xl sm:text-2xl capitalize text-white leading-tight break-words">{currentTeamName(s.manager.id, s.manager.team_name ?? s.manager.name)}</div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground capitalize mt-0.5">{s.manager.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl text-red-300">{s.count}</div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">spoon{s.count > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}


      {/* CURRENT SEASON - LIVE TABLE (mobile-first) */}
      {currentSeason && currentStandings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-t border-border/50">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" /> Live Now
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl">{currentSeason.name} Table</h2>
            </div>
            <Link to="/season/$seasonId" params={{ seasonId: currentSeason.id }} className="text-xs sm:text-sm uppercase tracking-wider text-gold hover:underline">View Season →</Link>
          </div>

          <div className="premium-card rounded-xl overflow-hidden">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-[42px_1fr_36px_36px_36px_64px_64px] gap-2 px-4 py-3 bg-card/60 text-[10px] uppercase tracking-widest text-muted-foreground">
              <div>#</div><div>Team</div>
              <div className="text-center">W</div><div className="text-center">D</div><div className="text-center">L</div>
              <div className="text-right">PF</div><div className="text-right">Pts</div>
            </div>
            <div className="sm:hidden grid grid-cols-[28px_1fr_44px_52px] gap-2 px-3 py-2 bg-card/60 text-[10px] uppercase tracking-widest text-muted-foreground">
              <div>#</div><div>Team</div><div className="text-center">W-D-L</div><div className="text-right">Pts</div>
            </div>

            {currentStandings.map((row: any) => {
              const m = managerById(row.manager_id);
              const b = getBranding(String(row.manager_id));
              const tint = b?.primary ?? "#508cff";
              const display = currentTeamName(row.manager_id, m?.team_name ?? m?.name ?? "-");
              const rankCls = rankColor(row.position, currentStandings.length);
              return (
                <Link
                  key={row.id}
                  to="/team/$managerId"
                  params={{ managerId: String(row.manager_id) }}
                  className="block border-t border-border/40 hover:bg-gold/5 transition"
                >
                  {/* Desktop / tablet */}
                  <div className="hidden sm:grid grid-cols-[42px_1fr_36px_36px_36px_64px_64px] gap-2 px-4 py-3 items-center">
                    <div className={`font-display text-lg ${rankCls}`}>{row.position}</div>
                    <div className="flex items-center gap-3 min-w-0">
                      {b?.badge ? (
                        <img src={b.badge} alt="" className="w-7 h-7 object-contain shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: tint }}>{display.charAt(0)}</div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium capitalize truncate">{display}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground capitalize truncate">{m?.name}</div>
                      </div>
                    </div>
                    <div className="text-center text-sm tabular-nums">{row.wins}</div>
                    <div className="text-center text-sm tabular-nums">{row.draws}</div>
                    <div className="text-center text-sm tabular-nums">{row.losses}</div>
                    <div className="text-right text-sm tabular-nums">{Number(row.points_for ?? 0).toFixed(0)}</div>
                    <div className="text-right font-display text-lg text-gold tabular-nums">{row.total_points}</div>
                  </div>

                  {/* Mobile */}
                  <div className="sm:hidden grid grid-cols-[28px_1fr_44px_52px] gap-2 px-3 py-3 items-center">
                    <div className={`font-display text-base leading-none ${rankCls}`}>{row.position}</div>
                    <div className="flex items-center gap-2 min-w-0">
                      {b?.badge ? (
                        <img src={b.badge} alt="" className="w-6 h-6 object-contain shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white" style={{ background: tint }}>{display.charAt(0)}</div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium capitalize truncate leading-tight">{display}</div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground capitalize truncate">{m?.name}</div>
                      </div>
                    </div>
                    <div className="text-center text-[11px] tabular-nums text-muted-foreground">{row.wins}-{row.draws}-{row.losses}</div>
                    <div className="text-right font-display text-lg text-gold tabular-nums leading-none">{row.total_points}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* THE ENCYCLOPAEDIA OF TEAMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Every Competitor</div>
          <h2 className="font-display text-4xl md:text-5xl">The Encyclopaedia of Teams</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto">
            Every manager. Every crest. Every story. Tap a club to enter their archive.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {data.managers.map((m: any) => {
            const b = getBranding(String(m.id));
            const tint = b?.primary ?? "#508cff";
            const accent = (b as any)?.secondary ?? tint;
            const kit = MANAGER_KITS[String(m.id)]?.home;
            const titles = titleCounts[m.id] ?? 0;
            const spoons = spoonCounts[m.id] ?? 0;
            const allTime = data.alltime.find((r: any) => r.manager_id === m.id);
            const display = currentTeamName(m.id, m.team_name ?? m.name);
            const nickname = getNickname(m.id) ?? "The Originals";
            const defining = definingStat(String(m.id));
            return (
              <Link
                key={m.id}
                to="/team/$managerId"
                params={{ managerId: String(m.id) }}
                className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/40 transition-all hover:-translate-y-1 min-h-[210px] flex flex-col"
                style={{ background: `linear-gradient(135deg, ${tint}40 0%, ${accent}15 55%, rgba(10,17,48,0.9) 100%)` }}
              >
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ background: `repeating-linear-gradient(45deg, ${tint} 0 14px, transparent 14px 28px)` }} />
                <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition" style={{ background: tint }} />
                {kit ? (
                  <img src={kit} alt="" loading="lazy" className="absolute -right-4 -bottom-6 w-32 h-32 object-contain opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500" />
                ) : b?.badge ? (
                  <img src={b.badge} alt="" loading="lazy" className="absolute -right-4 -bottom-6 w-32 h-32 object-contain opacity-15 group-hover:opacity-25 group-hover:scale-105 transition-all duration-500" />
                ) : null}
                <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: tint }} />

                <div className="relative p-5 flex flex-col flex-1">
                  <div className="flex items-start gap-3">
                    {b?.badge ? (
                      <img src={b.badge} alt="" className="w-14 h-14 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0" style={{ background: tint }}>
                        {display?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] uppercase tracking-[0.3em] font-bold mb-0.5 truncate" style={{ color: tint }}>{nickname}</div>
                      <div className="font-display text-xl capitalize text-white truncate leading-tight">{display}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground capitalize truncate mt-0.5">{m.name}</div>
                    </div>
                  </div>

                  {defining && (
                    <div className="relative mt-4 rounded-lg border border-white/10 bg-black/25 backdrop-blur-sm px-3 py-2">
                      <div className="text-[9px] uppercase tracking-[0.25em] text-white/50">{defining.label}</div>
                      <div className="font-display text-base text-white leading-tight mt-0.5 truncate">{defining.value}</div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {titles > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-gold/40 bg-gold/10 text-gold">
                        <Crown className="w-3 h-3" /> {titles}× Champion
                      </span>
                    )}
                    {spoons > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-red-400/40 bg-red-500/10 text-red-300">
                        <Skull className="w-3 h-3" /> {spoons}× Spoon
                      </span>
                    )}
                    {allTime && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-white/15 bg-white/5 text-white/80">
                        {allTime.total_points} pts
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-white/50 group-hover:text-white transition flex items-center gap-1">
                    Enter Archive <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* EXPLORE - internal cross-links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
        <div className="text-center mb-10">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Keep Digging</div>
          <h2 className="font-display text-4xl md:text-5xl">Explore the Archive</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ExploreTile to="/records" tint="hsl(15 85% 55%)" kicker="The Numbers" title="All-Time Records" desc="Every record, milestone & milestone moment." />
          <ExploreTile to="/h2h" tint="hsl(0 80% 55%)" kicker="Rivalries" title="H2H History" desc="Manager vs manager, every meeting tracked." />
          <ExploreTile to="/table" tint="hsl(45 90% 55%)" kicker="Eternal" title="All-Time Table" desc="Where everyone sits across all seasons." />
          {currentSeason && (
            <ExploreTile to="/season/$seasonId" params={{ seasonId: currentSeason.id }} tint="hsl(195 80% 55%)" kicker="Live Now" title={`${currentSeason.name} Season`} desc="The campaign in motion. Follow the title race." />
          )}
        </div>
      </section>
    </div>
  );
}

function TeamConstellation({ managers, logoSrc }: { managers: any[]; logoSrc: string }) {
  const teams = managers.slice(0, 12);
  const n = teams.length;
  return (
    <div className="relative mx-auto mt-10 md:mt-14 w-[min(92vw,640px)] aspect-square">
      {/* orbit rings */}
      <div className="absolute inset-[6%] rounded-full border border-silver/15" />
      <div className="absolute inset-[18%] rounded-full border border-silver/10" />
      <div className="absolute inset-[32%] rounded-full border border-silver/10" />

      {/* central crest */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={logoSrc}
          alt="FPL Super League crest"
          className="w-[42%] h-[42%] object-contain drop-shadow-[0_0_60px_rgba(80,140,255,0.55)] animate-pulse-slow"
        />
      </div>

      {/* Ferris-wheel ring of badges. Outer wrapper rotates as a rigid
          circle around the centre; each badge counter-rotates to stay upright. */}
      <div className="absolute inset-0 ferris-spin">
        {teams.map((m, i) => {
          const b = getBranding(String(m.id));
          const tint = b?.primary ?? "#508cff";
          const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
          const r = 44; // radius as % of container
          const x = 50 + r * Math.cos(angle);
          const y = 50 + r * Math.sin(angle);
          return (
            <Link
              key={m.id}
              to="/team/$managerId"
              params={{ managerId: String(m.id) }}
              className="group absolute"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
              title={currentTeamName(m.id, m.team_name ?? m.name)}
            >
              <div className="ferris-counter">
                <div
                  className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border border-white/15 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:border-white/60"
                  style={{
                    background: `radial-gradient(circle, ${tint}40 0%, rgba(10,17,48,0.7) 70%)`,
                    boxShadow: `0 0 24px ${tint}55`,
                  }}
                >
                  {b?.badge ? (
                    <img src={b.badge} alt="" className="w-9 h-9 sm:w-12 sm:h-12 object-contain" />
                  ) : (
                    <span className="font-display text-base sm:text-lg text-white">
                      {currentTeamName(m.id, m.team_name ?? m.name).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ExploreTile({ to, params, tint, kicker, title, desc }: { to: string; params?: any; tint: string; kicker: string; title: string; desc: string }) {
  const linkProps: any = params ? { to, params } : { to };
  return (
    <Link
      {...linkProps}
      className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-white/40 transition-all hover:-translate-y-1 p-5 min-h-[140px] flex flex-col"
      style={{ background: `linear-gradient(135deg, ${tint}30 0%, ${tint}08 55%, rgba(10,17,48,0.85) 100%)` }}
    >
      <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: tint }} />
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition" style={{ background: tint }} />
      <div className="relative flex-1 flex flex-col">
        <div className="text-[9px] uppercase tracking-[0.3em] font-bold mb-1" style={{ color: tint }}>{kicker}</div>
        <div className="font-display text-2xl text-white leading-tight">{title}</div>
        <div className="text-[11px] text-white/60 mt-1 flex-1">{desc}</div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-white/70 group-hover:text-white flex items-center gap-1">
          Open <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ kicker, title, inline = false }: { kicker: string; title: string; inline?: boolean }) {
  return (
    <div className={inline ? "" : ""}>
      <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">{kicker}</div>
      <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-8">
      <Skeleton className="h-32 w-2/3" />
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    </div>
  );
}
