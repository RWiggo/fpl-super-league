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
import { useIsMobile } from "@/hooks/use-mobile";
import { getKit } from "@/lib/managerKits";
import { getSeasonBadge, getSeasonTeamName } from "@/lib/seasonBadges";
import { getSeasonKit } from "@/lib/seasonKits";
import { useSeasonAssets } from "@/lib/seasonAssets";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { normalizeStreaks } from "@/lib/streaks";

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
      const [seasons, allManagers, mst, standings, allStandings, fixtures, streaks, h2h, overall, teamStats, legends, tots, history, alltimePlayers, unbeaten, winless, losing, allClubs, alltimeTable, cupsWon, cupResults] = await Promise.all([
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
        supabase.from("alltime_table").select("*"),
        supabase.from("manager_cups_won").select("*"),
        supabase.from("special_tournament_results").select("*, special_tournaments(short_name, linked_season_id)").eq("manager_id", managerId),
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
        unbeaten: normalizeStreaks(unbeaten.data),
        winless: normalizeStreaks(winless.data),
        losing: normalizeStreaks(losing.data),
        allClubs: [...new Set((allClubs.data ?? []).map((r: any) => r.club).filter(Boolean))] as string[],
        alltimeTable: alltimeTable.data ?? [],
        cupsWon: cupsWon.data ?? [],
        cupResults: cupResults.data ?? [],
      });
    })();
  }, [managerId]);

  const [statSeason, setStatSeason] = useState<string>("");
  useEffect(() => { if (d?.standings?.length && !statSeason) setStatSeason(d.seasons.find((x: any) => x.id === d.standings[d.standings.length - 1].season_id)?.name ?? ""); }, [d]);
  const [totsSeason, setTotsSeason] = useState<string>("");
  const [h2hPage, setH2hPage] = useState(0);
  const isMobile = useIsMobile();
  useSeasonAssets();

  // Apply this team's primary colour globally (header / menu / focus rings)
  // for the duration of this page, then restore on unmount.
  const earlyBranding = getBranding(managerId);
  useEffect(() => {
    if (!earlyBranding) return;
    const root = document.documentElement;
    const props = ["--gold", "--color-gold", "--gold-bright", "--color-gold-bright", "--primary", "--color-primary", "--team-primary"];
    const prev = Object.fromEntries(props.map((p) => [p, root.style.getPropertyValue(p)]));
    props.forEach((p) => root.style.setProperty(p, earlyBranding.primary));
    let prevFg: Record<string, string> | null = null;
    if (earlyBranding.primaryFg) {
      const fgProps = ["--primary-foreground", "--color-primary-foreground"];
      prevFg = Object.fromEntries(fgProps.map((p) => [p, root.style.getPropertyValue(p)]));
      fgProps.forEach((p) => root.style.setProperty(p, earlyBranding.primaryFg!));
    }
    document.body.classList.add("team-branded");
    return () => {
      Object.entries(prev).forEach(([p, v]) => v ? root.style.setProperty(p, v) : root.style.removeProperty(p));
      if (prevFg) Object.entries(prevFg).forEach(([p, v]) => v ? root.style.setProperty(p, v) : root.style.removeProperty(p));
      document.body.classList.remove("team-branded");
    };
  }, [earlyBranding?.primary, earlyBranding?.primaryFg]);


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

  // titles (exclude active/incomplete seasons - not won until season is complete)
  const titles = d.standings.filter((s: any) => {
    if (s.position !== 1) return false;
    const season = d.seasons.find((x: any) => x.id === s.season_id);
    return season?.season_complete !== false;
  }).length;
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

  // All-time league rank - mirrors the exact algorithm on /table (titles, then cups,
  // then raw PPG, then FPL points) so the two pages never disagree.
  const completedChampionsAllTime = new Map<string, number>();
  for (const s of d.seasons as any[]) {
    if (s.champion_manager_id && s.season_complete !== false) {
      const k = String(s.champion_manager_id);
      completedChampionsAllTime.set(k, (completedChampionsAllTime.get(k) ?? 0) + 1);
    }
  }
  const cupsByManagerAllTime = new Map<string, number>();
  for (const c of d.cupsWon as any[]) {
    cupsByManagerAllTime.set(String(c.manager_id), c.cups_won ?? 0);
  }
  const allTimeRanked = (d.alltimeTable as any[])
    .map((r) => {
      const w = r.total_wins ?? 0, dr = r.total_draws ?? 0, l = r.total_losses ?? 0;
      const games = w + dr + l;
      return {
        id: r.manager_id,
        _titles: completedChampionsAllTime.get(String(r.manager_id)) ?? 0,
        _cups: cupsByManagerAllTime.get(String(r.manager_id)) ?? 0,
        _ppgRaw: games ? (Number(r.total_league_points ?? 0)) / games : 0,
        _pf: Number(r.total_points_for ?? 0),
      };
    })
    .sort((a, b) => (b._titles - a._titles) || (b._cups - a._cups) || (b._ppgRaw - a._ppgRaw) || (b._pf - a._pf));
  const allTimeRank = allTimeRanked.findIndex((x) => String(x.id) === String(managerId)) + 1;
  const cupsWonCount = cupsByManagerAllTime.get(String(managerId)) ?? 0;
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
  // Map each player to their most-used club (by fantasy points contributed).
  const playerClubAgg = new Map<string, Map<string, number>>();
  for (const r of (d.history as any[])) {
    if (!r.player_name || !r.club) continue;
    const inner = playerClubAgg.get(r.player_name) ?? new Map<string, number>();
    inner.set(r.club, (inner.get(r.club) ?? 0) + Number(r.fantasy_points ?? 0));
    playerClubAgg.set(r.player_name, inner);
  }
  const topClubFor = (name: string): string | undefined => {
    const inner = playerClubAgg.get(name);
    if (!inner) return undefined;
    return [...inner.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const enrichedPlayers = (d.alltimePlayers as any[]).map((p) => ({
    ...p,
    club: p.club ?? topClubFor(p.player_name),
  }));
  const sortedPlayers = [...enrichedPlayers].sort((a, b) => (b.total_fantasy_points ?? 0) - (a.total_fantasy_points ?? 0));
  // We compute season counts later; defer enrichment via a post-step
  const top5PlayersRaw = sortedPlayers.slice(0, 5);
  const bottom5PlayersRaw = [...sortedPlayers].reverse().slice(0, 5);

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

  // Player → distinct seasons in this manager's squad
  const playerSeasonsMap = new Map<string, Set<any>>();
  for (const r of (d.history as any[])) {
    if (!r.player_name) continue;
    const key = r.season_id ?? r.season_name;
    if (key == null) continue;
    if (!playerSeasonsMap.has(r.player_name)) playerSeasonsMap.set(r.player_name, new Set());
    playerSeasonsMap.get(r.player_name)!.add(key);
  }
  const seasonsForPlayer = (name: string) => playerSeasonsMap.get(name)?.size ?? 0;

  // Club → distinct players the manager used from that club
  const clubPlayersMap = new Map<string, Set<string>>();
  for (const r of (d.history as any[])) {
    if (!r.club || !r.player_name) continue;
    if (!clubPlayersMap.has(r.club)) clubPlayersMap.set(r.club, new Set());
    clubPlayersMap.get(r.club)!.add(r.player_name);
  }
  const playersFromClub = (club: string) => clubPlayersMap.get(club)?.size ?? 0;

  const top5Clubs = clubsRanked.slice(0, 5).map((c) => ({ ...c, playerCount: playersFromClub(c.club) }));
  const bottom5Clubs = [...clubsRanked].reverse().slice(0, 5).map((c) => ({ ...c, playerCount: playersFromClub(c.club) }));
  const top5Players = top5PlayersRaw.map((p) => ({ ...p, seasonCount: seasonsForPlayer(p.player_name) }));
  const bottom5Players = bottom5PlayersRaw.map((p) => ({ ...p, seasonCount: seasonsForPlayer(p.player_name) }));

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

  // Distinct former team names (case-insensitive, excluding current)
  const formerlyKnownAs = (() => {
    const seen = new Set<string>([currentTeamName.toLowerCase()]);
    const out: string[] = [];
    for (const t of d.mst as any[]) {
      const name = t.team_name?.trim();
      if (!name) continue;
      const k = name.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(name);
    }
    return out;
  })();

  // Best XI subs: next-highest scorer per position not already in the XI
  const subsByPos = bestXI.length === 11
    ? {
        GK: byPos.GK[1],
        DEF: byPos.DEF[bestFormation[0]],
        MID: byPos.MID[bestFormation[1]],
        FWD: byPos.FWD[bestFormation[2]],
      }
    : null;

  const kit = getKit(managerId);

  // Per-season badge + kit archive (sorted oldest -> newest)
  const seasonsChrono = [...d.standings].sort((a: any, b: any) => {
    const sa = d.seasons.find((s: any) => s.id === a.season_id)?.year_start ?? 0;
    const sb = d.seasons.find((s: any) => s.id === b.season_id)?.year_start ?? 0;
    return sa - sb;
  });
  const dedupeAdjacent = <T extends { __key: string }>(rows: T[]) => {
    const out: (T & { spanLabels: string[] })[] = [];
    for (const r of rows) {
      const last = out[out.length - 1];
      if (last && last.__key === r.__key) {
        last.spanLabels.push((r as any).seasonName);
      } else {
        out.push({ ...r, spanLabels: [(r as any).seasonName] });
      }
    }
    return out;
  };
  const badgeArchive = dedupeAdjacent(
    seasonsChrono
      .map((s: any) => {
        const season = sById(s.season_id);
        const badge = getSeasonBadge(managerId, s.season_id);
        return {
          seasonId: s.season_id,
          seasonName: season?.name,
          badge,
          teamName: getSeasonTeamName(managerId, s.season_id, d.mst.find((t: any) => t.season_id === s.season_id)?.team_name),
          __key: `${badge ?? ""}`,
        };
      })
      .filter((r) => r.badge),
  );
  const kitArchive = dedupeAdjacent(
    seasonsChrono
      .map((s: any) => {
        const season = sById(s.season_id);
        const kit = getSeasonKit(managerId, s.season_id);
        return {
          seasonId: s.season_id,
          seasonName: season?.name,
          kit,
          teamName: getSeasonTeamName(managerId, s.season_id, d.mst.find((t: any) => t.season_id === s.season_id)?.team_name),
          __key: `${kit?.home ?? ""}`,
        };
      })
      .filter((r) => r.kit?.home),
  );

  // Per-player best-scoring season at this club for Best XI kit display
  const playerBestSeason = new Map<string, { seasonId: string | number; points: number }>();
  for (const r of d.history as any[]) {
    if (!r.player_name) continue;
    const season = r.season_id
      ? d.seasons.find((s: any) => s.id === r.season_id)
      : d.seasons.find((s: any) => s.name === r.season_name);
    if (!season) continue;
    const pts = Number(r.fantasy_points ?? 0);
    const prev = playerBestSeason.get(r.player_name);
    if (!prev || pts > prev.points) {
      playerBestSeason.set(r.player_name, { seasonId: season.id, points: pts });
    }
  }

  const bestXIWithSeason = bestXIForPitch.map((p: any) => ({
    ...p,
    manager_id: managerId,
    season_id: playerBestSeason.get(p.player_name)?.seasonId ?? p.season_id,
  }));

  return (
    <div className="team-page" style={brandStyle}>

      <TeamHero
        managerName={d.manager.name}
        teamName={currentTeamName}
        badge={branding?.badge}
        primary={branding?.primary}
        nickname={getNickname(managerId)}
        formerlyKnownAs={formerlyKnownAs}
        extras={
          <ArchiveButtons badgeArchive={badgeArchive} kitArchive={kitArchive} teamName={currentTeamName} />
        }
        facts={[
          { label: "Seasons Played in", value: d.standings.length },
          { label: "League Titles Won", value: titles },
          { label: "Cups Won", value: cupsWonCount },
          { label: "All-Time Rank", value: allTimeRank > 0 ? ordinal(allTimeRank) : "-" },
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


      {/* Season Hist - eye-catching kit-driven cards */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
        <SectionTitle kicker={`${currentTeamName} · Season History`} title="The Journey so far" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {d.standings.map((s: any) => {
            const teamName = d.mst.find((t: any) => t.season_id === s.season_id)?.team_name;
            const seasonName = sById(s.season_id)?.name;
            const seasonHistory = (d.history as any[]).filter(
              (h) => h.season_id === s.season_id || h.season_name === seasonName
            );
            const star = [...seasonHistory].sort(
              (a, b) => Number(b.fantasy_points ?? 0) - Number(a.fantasy_points ?? 0)
            )[0];
            const seasonSize = new Set(
              (d.allStandings as any[]).filter((x) => x.season_id === s.season_id).map((x) => x.manager_id)
            ).size;
            const pos = s.position;
            const seasonObj = d.seasons.find((x: any) => x.id === s.season_id);
            const seasonComplete = seasonObj?.season_complete !== false;
            let posClass = "text-yellow-400";
            let posBg = "bg-yellow-400/10 border-yellow-400/30";
            if (pos === 1 && seasonComplete) { posClass = "text-emerald-300"; posBg = "bg-emerald-400/15 border-emerald-400/40"; }
            else if ((pos === 2 || pos === 3) && seasonComplete) { posClass = "text-emerald-500"; posBg = "bg-emerald-500/10 border-emerald-500/30"; }
            else if (seasonComplete && seasonSize > 0 && pos === seasonSize) { posClass = "text-red-500"; posBg = "bg-red-500/15 border-red-500/40"; }
            else if (seasonComplete && seasonSize > 0 && pos > seasonSize - 3) { posClass = "text-red-400"; posBg = "bg-red-400/10 border-red-400/30"; }
            const diff = Number(s.points_for ?? 0) - Number(s.points_against ?? 0);
            const tint = branding?.primary ?? "var(--color-primary)";
            return (
              <Link
                key={s.id}
                to="/season/$seasonId"
                params={{ seasonId: s.season_id }}
                className="group relative premium-card rounded-xl overflow-hidden block hover:-translate-y-1 hover:border-gold/60 transition-all"
              >
                {/* tint wash */}
                <div
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{ background: `linear-gradient(120deg, color-mix(in oklab, ${tint} 18%, transparent) 0%, transparent 55%)` }}
                />
                {/* top stripe */}
                <div className="h-1 w-full" style={{ background: tint }} />

                <div className="relative p-4 flex items-start gap-3">
                  {/* Kit */}
                  {(() => {
                    const seasonKit = getSeasonKit(managerId, s.season_id) ?? kit;
                    return seasonKit ? (
                      <img
                        src={seasonKit.home}
                        alt=""
                        loading="lazy"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform"
                      />
                    ) : null;
                  })()}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-silver/70">{seasonName}</div>
                        <div className="font-display text-base sm:text-lg uppercase truncate group-hover:text-gold transition-colors">
                          {teamName}
                        </div>
                      </div>
                      <div className={`shrink-0 rounded-md border px-2 py-1 text-center ${posBg}`}>
                        <div className="text-[8px] uppercase tracking-widest text-muted-foreground leading-none">Pos</div>
                        <div className={`font-display text-lg leading-tight flex items-center gap-1 ${posClass}`}>
                          {pos === 1 && seasonComplete && <Trophy className="w-3.5 h-3.5 text-gold" />}
                          {pos}
                          <span className="text-[9px] text-muted-foreground">/{seasonSize || "-"}</span>
                        </div>
                      </div>
                    </div>
                    {star && (
                      <div className="mt-2 text-[11px] truncate">
                        <span className="text-gold mr-1">★</span>
                        <span className="font-medium">{star.player_name}</span>
                        <span className="text-muted-foreground ml-1">({Number(star.fantasy_points ?? 0).toFixed(0)})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative grid grid-cols-5 divide-x divide-border/40 border-t border-border/40 bg-black/20">
                  <CardStat label="W" value={s.wins} valueClass="text-emerald-400" />
                  <CardStat label="D" value={s.draws} valueClass="text-yellow-400" />
                  <CardStat label="L" value={s.losses} valueClass="text-red-400" />
                  <CardStat label="Pts" value={s.total_points} />
                  <CardStat
                    label="Diff"
                    value={`${diff >= 0 ? "+" : ""}${diff.toFixed(0)}`}
                    valueClass={diff >= 0 ? "text-emerald-400" : "text-red-400"}
                  />
                </div>

                {(() => {
                  const cupResult = (d.cupResults as any[]).find(
                    (c) => c.special_tournaments?.linked_season_id === s.season_id
                  );
                  if (!cupResult) return null;
                  return (
                    <div className="relative border-t border-border/40 bg-black/30 px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-gold" />
                        {cupResult.special_tournaments?.short_name}
                      </span>
                      <span className={`text-[11px] font-display ${cupResult.position === 1 ? "text-gold" : "text-silver/90"}`}>
                        {cupResult.position === 1 && <Trophy className="w-3 h-3 inline mr-1 -mt-0.5" />}
                        {ordinal(cupResult.position)}
                      </span>
                    </div>
                  );
                })()}
              </Link>
            );
          })}
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

        const perPage = isMobile ? 1 : 3;
        const pageCount = Math.max(1, Math.ceil(cards.length / perPage));
        const page = Math.min(h2hPage, pageCount - 1);
        const visible = cards.slice(page * perPage, page * perPage + perPage);
        const canPrev = page > 0;
        const canNext = page < pageCount - 1;

        return (
          <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <SectionTitle kicker={`${currentTeamName} · vs The Field`} title="Head to Head" />
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
                    opponentName={opp?.name ?? "-"}
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
      <RecordsSection
        teamName={currentTeamName}
        topPlayers={top5Players}
        bottomPlayers={bottom5Players}
        allPlayersSorted={sortedPlayers}
        seasonsForPlayer={seasonsForPlayer}
        topClubs={top5Clubs}
        bottomClubs={bottom5Clubs}
        allClubsRanked={clubsRanked.map((c) => ({ ...c, playerCount: playersFromClub(c.club) }))}
        allStreaks={{
          win: (d.streaks as any[]).filter((r) => r.outcome === "W"),
          unbeaten: d.unbeaten as any[],
          winless: d.winless as any[],
          losing: d.losing as any[],
        }}
        bestWinRun={bestWinRun}
        bestUnbeatenRun={bestUnbeatenRun}
        worstWinlessRun={worstWinlessRun}
        worstLosingRun={worstLosingRun}
      />

      {/* Best XI */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
        {bestXI.length === 11 && (
          <div>
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-gold mb-1">{currentTeamName} · All-Time XI</div>
                <h3 className="font-display text-2xl md:text-3xl">Best Eleven · {bestFormation.join("-")}</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                Combined Points · <span className="text-gold font-display text-lg">{bestXISum.toFixed(0)}</span>
              </div>
            </div>
            <FormationPitch players={bestXIWithSeason} />

            {/* Subs bench - next-highest scorer per position */}
            {subsByPos && (
              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.3em] text-silver/70 mb-3">On the bench</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(["GK", "DEF", "MID", "FWD"] as const).map((pos) => {
                    const sub = subsByPos[pos];
                    return (
                      <div key={pos} className="premium-card rounded-lg p-3 flex items-center gap-3">
                        <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${POSITION_STYLES[pos]}`}>
                          {pos}
                        </span>
                        {sub ? (
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium leading-tight break-words">{sub.player_name ?? sub.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {sub.club ?? "-"} · <span className="text-gold font-display">{Number(sub.total_fantasy_points ?? 0).toFixed(0)}</span> pts
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">No reserve</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        {(() => {
                          const headerCrest = getPlClubBadge(searchClub);
                          return headerCrest ? (
                            <img src={headerCrest} alt={searchClub} className="w-8 h-8 object-contain shrink-0" />
                          ) : null;
                        })()}
                        <div>
                          <div className="font-display text-2xl">{searchPlayer}</div>
                          <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                            {selectedPlayerData.position} · {selectedPlayerData.clubs} · {selectedPlayerData.seasons}
                          </div>
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
                            {selectedPlayerData.rows.map((r: any, i: number) => {
                              const rowCrest = getPlClubBadge(r.club);
                              return (
                                <tr key={i} className="border-t border-border/40">
                                  <td className="p-2">{r.season_name}</td>
                                  <td className="p-2">
                                    <div className="flex items-center gap-2">
                                      {rowCrest && <img src={rowCrest} alt="" loading="lazy" className="w-8 h-8 object-contain" />}
                                      <span>{r.club}</span>
                                    </div>
                                  </td>
                                  <td className="text-center p-2">{r.games_played ?? "-"}</td>
                                  <td className="text-right p-2 font-display text-gold">{Number(r.fantasy_points ?? 0).toFixed(0)}</td>
                                  <td className="text-right p-2">{r.avg_points_per_game != null ? Number(r.avg_points_per_game).toFixed(1) : "-"}</td>
                                </tr>
                              );
                            })}
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
  "text-amber-300",       // 1st - gold
  "text-slate-300",       // 2nd - silver
  "text-orange-400",      // 3rd - bronze
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
          {players.map((p, i) => {
            const crest = getPlClubBadge(p.club);
            return (
              <tr key={`${p.player_id ?? p.player_name}-${i}`} className="border-t border-border/40 odd:bg-card/30 hover:bg-card/60 transition-colors">
                <td className={`p-3 w-10 font-display text-lg ${RANK_STYLES[i] ?? "text-muted-foreground"}`}>{i + 1}</td>
                <td className="p-3 w-10">
                  {crest ? (
                    <img src={crest} alt={p.club ?? ""} loading="lazy" className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="w-8 h-8 inline-block rounded-sm bg-muted/30 border border-border/40" aria-hidden />
                  )}
                </td>
                <td className="p-3 font-medium">
                  <div>{p.player_name ?? p.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    {p.club && <span>{p.club}</span>}
                    {p.seasonCount != null && (
                      <span className="px-1.5 py-px rounded-sm bg-muted/30 border border-border/40 text-muted-foreground">
                        {p.seasonCount} {p.seasonCount === 1 ? "season" : "seasons"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 w-14 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${POSITION_STYLES[p.position] ?? "bg-muted/20 text-muted-foreground border-border"}`}>
                    {p.position}
                  </span>
                </td>
                <td className={`p-3 text-right font-display ${valueClass}`}>{Number(p.total_fantasy_points ?? 0).toFixed(0)}</td>
              </tr>
            );
          })}
          {players.length === 0 && (
            <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">No data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ClubLeaderboard({ title, subtitle, rows, accent }: { title: string; subtitle?: string; rows: { club: string; pts: number; playerCount?: number }[]; accent?: boolean }) {
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
          {rows.map((r, i) => {
            const crest = getPlClubBadge(r.club);
            const muted = !(r.pts > 0);
            return (
              <tr key={r.club} className="border-t border-border/40 odd:bg-card/30 hover:bg-card/60 transition-colors">
                <td className={`p-3 w-10 font-display text-lg ${RANK_STYLES[i] ?? "text-muted-foreground"}`}>{i + 1}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {crest ? (
                      <img
                        src={crest}
                        alt=""
                        loading="lazy"
                        className={`w-8 h-8 object-contain shrink-0 ${muted ? "opacity-40 grayscale" : ""}`}
                      />
                    ) : (
                      <span className="w-8 h-8 shrink-0 rounded-sm bg-muted/30 border border-border/40" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <div className="font-display tracking-wider truncate">{r.club}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80 mt-0.5">
                        {r.playerCount ?? 0} {r.playerCount === 1 ? "player used" : "players used"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`p-3 text-right font-display ${valueClass}`}>
                  {r.pts > 0 ? r.pts.toFixed(0) : <span className="text-muted-foreground/60 text-xs italic">Never used</span>}
                </td>
              </tr>
            );
          })}
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
    <>
      <div className="relative premium-card rounded-lg overflow-hidden w-full">
        <div className="h-1 w-full" style={{ background: tint }} />
        <button onClick={() => setOpen(true)} className="w-full text-left">
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
          <div className="px-4 pb-3 grid grid-cols-3 gap-2 text-xs">
            <div className="text-muted-foreground">PF <span className="text-foreground font-display ml-1">{pf.toFixed(0)}</span></div>
            <div className="text-muted-foreground text-center">PA <span className="text-foreground font-display ml-1">{pa.toFixed(0)}</span></div>
            <div className="text-muted-foreground text-right">PD <span className={`font-display ml-1 ${pf - pa > 0 ? "text-emerald-400" : pf - pa < 0 ? "text-red-400" : "text-foreground"}`}>{`${pf - pa > 0 ? "+" : ""}${(pf - pa).toFixed(0)}`}</span></div>
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
            <div className="mt-3 text-[10px] uppercase tracking-wider text-silver/50">Tap for every result</div>
          </div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {opponentBadge && <img src={opponentBadge} alt="" className="w-10 h-10" />}
              <div>
                <DialogTitle className="font-display text-2xl uppercase">vs {opponentName}</DialogTitle>
                <DialogDescription>
                  {wins}W · {draws}D · {losses}L · {wp}% win rate
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <table className="w-full text-sm mt-2">
            <thead className="bg-card/60 text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0">
              <tr>
                <th className="p-2 text-left">Season</th>
                <th className="p-2 text-center">GW</th>
                <th className="p-2 text-right">Score</th>
                <th className="p-2 text-center w-10">R</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No fixtures yet</td></tr>
              )}
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
                      <span className="text-muted-foreground mx-1">-</span>
                      <span className="text-muted-foreground">{Number(f.op).toFixed(0)}</span>
                    </td>
                    <td className="p-2 text-center">
                      <span className={`inline-flex w-6 h-6 rounded text-[10px] font-display items-center justify-center ${resultClass(r)}`}>{r}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ArchiveButtons({
  badgeArchive,
  kitArchive,
  teamName,
}: {
  badgeArchive: { seasonId: string | number; seasonName?: string; badge: string | null; teamName: string; spanLabels: string[] }[];
  kitArchive: { seasonId: string | number; seasonName?: string; kit: any; teamName: string; spanLabels: string[] }[];
  teamName: string;
}) {
  const [open, setOpen] = useState<"badge" | "kit" | null>(null);
  const spanLabel = (labels: string[]) =>
    labels.length <= 1 ? labels[0] ?? "" : `${labels[0]} – ${labels[labels.length - 1]}`;
  return (
    <>
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen("badge")}
          className="text-[10px] uppercase tracking-[0.3em] text-gold/90 hover:text-gold border-b border-gold/40 hover:border-gold pb-0.5 transition"
        >
          Badge Archive →
        </button>
        <button
          type="button"
          onClick={() => setOpen("kit")}
          className="text-[10px] uppercase tracking-[0.3em] text-gold/90 hover:text-gold border-b border-gold/40 hover:border-gold pb-0.5 transition"
        >
          Kit Archive →
        </button>
      </div>
      <Dialog open={open === "badge"} onOpenChange={(o) => { if (!o) setOpen(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase">{teamName} · Badge Archive</DialogTitle>
            <DialogDescription>Crests worn through the seasons.</DialogDescription>
          </DialogHeader>
          <ArchiveTimeline
            items={badgeArchive.map((b) => ({
              seasonLabel: spanLabel(b.spanLabels),
              teamName: b.teamName,
              image: b.badge ?? "",
              imageClass: "w-24 h-24 sm:w-28 sm:h-28 object-contain",
            }))}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={open === "kit"} onOpenChange={(o) => { if (!o) setOpen(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase">{teamName} · Kit Archive</DialogTitle>
            <DialogDescription>Home kits worn through the seasons.</DialogDescription>
          </DialogHeader>
          <ArchiveTimeline
            items={kitArchive.map((k) => ({
              seasonLabel: spanLabel(k.spanLabels),
              teamName: k.teamName,
              image: k.kit?.home ?? "",
              imageClass: "w-24 h-24 sm:w-28 sm:h-28 object-contain",
            }))}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ArchiveTimeline({
  items,
}: {
  items: { seasonLabel: string; teamName: string; image: string; imageClass: string }[];
}) {
  if (!items.length) return <div className="text-sm text-muted-foreground p-6 text-center">No archive entries yet.</div>;
  return (
    <ol className="relative mt-4 border-l border-gold/30 ml-4">
      {items.map((it, i) => (
        <li key={i} className="relative pl-8 pb-8 last:pb-2">
          <span className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-gold shadow-[0_0_0_4px_rgba(0,0,0,0.6)]" />
          <div className="flex items-center gap-5">
            <div className="shrink-0 bg-black/30 rounded-lg p-3 border border-border/40">
              {it.image ? (
                <img src={it.image} alt="" loading="lazy" className={it.imageClass} />
              ) : (
                <div className="w-24 h-24 grid place-items-center text-xs text-muted-foreground">No asset</div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-silver/60">{it.seasonLabel}</div>
              <div className="font-display text-xl uppercase truncate">{it.teamName}</div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Stat({ label, value, valueClass }: { label: string; value: any; valueClass?: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-sm ${valueClass ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

function CardStat({ label, value, valueClass }: { label: string; value: any; valueClass?: string }) {
  return (
    <div className="py-2.5 text-center">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground leading-none">{label}</div>
      <div className={`font-display text-base mt-1 leading-none ${valueClass ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

type StreakRow = {
  streak_length?: number;
  season_name?: string;
  streak_start_gw?: number;
  streak_end_gw?: number;
};

function StreakList({ rows, accent }: { rows: StreakRow[]; accent: "good" | "bad" }) {
  const sorted = [...rows].sort((a, b) => (b.streak_length ?? 0) - (a.streak_length ?? 0)).slice(0, 15);
  const valueClass = accent === "good" ? "text-emerald-300" : "text-red-400";
  if (!sorted.length) return <div className="text-sm text-muted-foreground p-4">No streaks recorded.</div>;
  return (
    <ol className="divide-y divide-border/40">
      {sorted.map((s, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5">
          <span className="font-display text-base w-6 text-muted-foreground text-right">{i + 1}</span>
          <span className={`font-display text-2xl w-10 text-center ${valueClass}`}>{s.streak_length ?? 0}</span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">games</span>
          <span className="ml-auto text-xs text-silver/80 truncate">
            {s.season_name} · GW{s.streak_start_gw}-{s.streak_end_gw}
          </span>
        </li>
      ))}
    </ol>
  );
}

function PlayersList({ players, accent }: { players: any[]; accent: "good" | "bad" }) {
  const valueClass = accent === "good" ? "text-emerald-300" : "text-rose-300";
  const list = accent === "good" ? players.slice(0, 20) : [...players].reverse().slice(0, 20);
  return (
    <ol className="divide-y divide-border/40">
      {list.map((p, i) => {
        const crest = getPlClubBadge(p.club);
        return (
          <li key={`${p.player_id ?? p.player_name}-${i}`} className="flex items-center gap-3 py-2">
            <span className="font-display text-sm w-6 text-muted-foreground text-right">{i + 1}</span>
            {crest ? <img src={crest} alt="" loading="lazy" className="w-7 h-7 object-contain shrink-0" /> : <span className="w-7 h-7 shrink-0" />}
            <div className="min-w-0 flex-1">
              <div className="text-sm truncate">{p.player_name ?? p.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80">{p.club ?? "-"} · {p.position}</div>
            </div>
            <span className={`font-display ${valueClass}`}>{Number(p.total_fantasy_points ?? 0).toFixed(0)}</span>
          </li>
        );
      })}
    </ol>
  );
}

function ClubsList({ rows, accent }: { rows: { club: string; pts: number; playerCount?: number }[]; accent: "good" | "bad" }) {
  const valueClass = accent === "good" ? "text-emerald-300" : "text-rose-300";
  const list = accent === "good" ? rows.slice(0, 20) : [...rows].reverse().slice(0, 20);
  return (
    <ol className="divide-y divide-border/40">
      {list.map((r, i) => {
        const crest = getPlClubBadge(r.club);
        const muted = !(r.pts > 0);
        return (
          <li key={r.club} className="flex items-center gap-3 py-2">
            <span className="font-display text-sm w-6 text-muted-foreground text-right">{i + 1}</span>
            {crest ? (
              <img src={crest} alt="" loading="lazy" className={`w-7 h-7 object-contain shrink-0 ${muted ? "opacity-40 grayscale" : ""}`} />
            ) : (
              <span className="w-7 h-7 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm truncate">{r.club}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/80">
                {r.playerCount ?? 0} {r.playerCount === 1 ? "player used" : "players used"}
              </div>
            </div>
            <span className={`font-display ${valueClass}`}>
              {r.pts > 0 ? r.pts.toFixed(0) : <span className="text-muted-foreground/60 text-xs italic">Never used</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

type RecordsSectionProps = {
  topPlayers: any[];
  bottomPlayers: any[];
  allPlayersSorted: any[];
  seasonsForPlayer: (name: string) => number;
  topClubs: { club: string; pts: number; playerCount?: number }[];
  bottomClubs: { club: string; pts: number; playerCount?: number }[];
  allClubsRanked: { club: string; pts: number; playerCount?: number }[];
  allStreaks: { win: any[]; unbeaten: any[]; winless: any[]; losing: any[] };
  bestWinRun?: StreakRow;
  bestUnbeatenRun?: StreakRow;
  worstWinlessRun?: StreakRow;
  worstLosingRun?: StreakRow;
  teamName: string;
};

function RecordsSection({
  topPlayers, bottomPlayers, allPlayersSorted, seasonsForPlayer,
  topClubs, bottomClubs, allClubsRanked,
  allStreaks, bestWinRun, bestUnbeatenRun, worstWinlessRun, worstLosingRun,
  teamName,
}: RecordsSectionProps) {
  type DialogKey =
    | { kind: "players"; accent: "good" | "bad"; title: string }
    | { kind: "clubs"; accent: "good" | "bad"; title: string }
    | { kind: "streaks"; accent: "good" | "bad"; rows: any[]; title: string };
  const [dialog, setDialog] = useState<DialogKey | null>(null);

  const allPlayersWithSeasons = allPlayersSorted.map((p) => ({ ...p, seasonCount: seasonsForPlayer(p.player_name) }));

  return (
    <section className="max-w-7xl mx-auto px-4 py-12 border-t border-border/50">
      <SectionTitle kicker={`${teamName} · The Highs and Lows`} title="Records and Statistics" />

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div onClick={() => setDialog({ kind: "players", accent: "good", title: "All Players · Best to Worst" })} className="cursor-pointer">
          <PlayerLeaderboard title="Top 5 Players" subtitle="By all-time fantasy points · tap for full list" players={topPlayers} icon={<Crown className="w-4 h-4" />} accent />
        </div>
        <div onClick={() => setDialog({ kind: "players", accent: "bad", title: "All Players · Worst to Best" })} className="cursor-pointer">
          <PlayerLeaderboard title="Worst 5 Players" subtitle="By all-time fantasy points · tap for full list" players={bottomPlayers} icon={<Skull className="w-4 h-4" />} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        <StatCard
          align="center"
          label="Greatest Winning Run"
          value={bestWinRun?.streak_length ?? 0}
          sub={bestWinRun ? `${bestWinRun.season_name} · GW${bestWinRun.streak_start_gw}-${bestWinRun.streak_end_gw}` : undefined}
          icon={<Zap className="w-5 h-5" />}
          onClick={() => setDialog({ kind: "streaks", accent: "good", rows: allStreaks.win, title: "All Winning Runs" })}
          hint="Tap for full list"
        />
        <StatCard
          align="center"
          label="Greatest Unbeaten Run"
          value={bestUnbeatenRun?.streak_length ?? 0}
          sub={bestUnbeatenRun ? `${bestUnbeatenRun.season_name} · GW${bestUnbeatenRun.streak_start_gw}-${bestUnbeatenRun.streak_end_gw}` : undefined}
          icon={<Award className="w-5 h-5" />}
          onClick={() => setDialog({ kind: "streaks", accent: "good", rows: allStreaks.unbeaten, title: "All Unbeaten Runs" })}
          hint="Tap for full list"
        />
        <StatCard
          align="center"
          label="Worst Winless Run"
          value={worstWinlessRun?.streak_length ?? 0}
          sub={worstWinlessRun ? `${worstWinlessRun.season_name} · GW${worstWinlessRun.streak_start_gw}-${worstWinlessRun.streak_end_gw}` : undefined}
          icon={<ShieldOff className="w-5 h-5" />}
          onClick={() => setDialog({ kind: "streaks", accent: "bad", rows: allStreaks.winless, title: "All Winless Runs" })}
          hint="Tap for full list"
        />
        <StatCard
          align="center"
          label="Worst Losing Run"
          value={worstLosingRun?.streak_length ?? 0}
          sub={worstLosingRun ? `${worstLosingRun.season_name} · GW${worstLosingRun.streak_start_gw}-${worstLosingRun.streak_end_gw}` : undefined}
          icon={<TrendingDown className="w-5 h-5" />}
          onClick={() => setDialog({ kind: "streaks", accent: "bad", rows: allStreaks.losing, title: "All Losing Runs" })}
          hint="Tap for full list"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div onClick={() => setDialog({ kind: "clubs", accent: "good", title: "All PL Clubs · Most to Least Used" })} className="cursor-pointer">
          <ClubLeaderboard title="Top 5 PL Clubs Relied On" subtitle="By total fantasy points · tap for full list" rows={topClubs} accent />
        </div>
        <div onClick={() => setDialog({ kind: "clubs", accent: "bad", title: "All PL Clubs · Least to Most Used" })} className="cursor-pointer">
          <ClubLeaderboard title="Bottom 5 PL Clubs Trusted" subtitle="Includes never-used clubs · tap for full list" rows={bottomClubs} />
        </div>
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => { if (!o) setDialog(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl uppercase">{dialog?.title}</DialogTitle>
            <DialogDescription>Extended records - top performers across every season.</DialogDescription>
          </DialogHeader>
          {dialog?.kind === "players" && (
            <PlayersList players={allPlayersWithSeasons} accent={dialog.accent} />
          )}
          {dialog?.kind === "clubs" && (
            <ClubsList rows={allClubsRanked} accent={dialog.accent} />
          )}
          {dialog?.kind === "streaks" && (
            <StreakList rows={dialog.rows} accent={dialog.accent} />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

