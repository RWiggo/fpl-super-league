import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { FormationPitch } from "@/components/FormationPitch";
import { getBranding } from "@/lib/managerBranding";
import { Flame, Trophy, Crown, Target, Zap, Shield, TrendingDown, X } from "lucide-react";
import logo from "@/assets/fpl-super-league-logo.png";

export const Route = createFileRoute("/records")({
  component: RecordsPage,
  head: () => ({
    meta: [
      { title: "All-Time Records — FPL Super League" },
      { name: "description", content: "Every record, every milestone, every legendary feat across the entire history of the league." },
    ],
  }),
});

// ---------- Types ----------
type Entry = {
  // Required for ranking + bar
  value: number;
  // What we show as the headline number on the bar
  formatted: string;
  // Manager identification (id preferred so we can link/badge)
  managerId?: string | number | null;
  managerName?: string | null;
  // Optional second line of context (season, gameweek, etc.)
  context?: string;
};

type RecordDef = {
  key: string;
  label: string;
  icon: ReactNode;
  tint: string;
  // pre-sorted DESC by value, top-N entries to show
  entries: Entry[];
  // suffix shown after the value in the modal list (e.g. "wins")
  unit?: string;
};

// ---------- Page ----------
function RecordsPage() {
  const [d, setD] = useState<any>(null);
  const [open, setOpen] = useState<RecordDef | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("seasons").select("*").order("year_start"),
      supabase.from("managers").select("*"),
      supabase.from("alltime_table").select("*"),
      supabase.from("fixture_records").select("*"),
      supabase.from("win_streaks").select("*"),
      supabase.from("season_standings").select("*"),
      supabase.from("team_of_the_season").select("*"),
      supabase.from("player_team_history").select("*"),
    ]).then(([s, m, a, f, st, sd, tots, pth]) =>
      setD({
        seasons: s.data ?? [],
        managers: m.data ?? [],
        alltime: a.data ?? [],
        fixtures: f.data ?? [],
        streaks: st.data ?? [],
        standings: sd.data ?? [],
        tots: tots.data ?? [],
        playerHistory: pth.data ?? [],
      })
    );
  }, []);

  const records = useMemo(() => buildRecords(d), [d]);

  if (!d || !records) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Skeleton className="h-96" />
      </div>
    );
  }

  const mById = (id: any) => d.managers.find((m: any) => String(m.id) === String(id));

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 ucl-stars opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl pointer-events-none opacity-50"
          style={{ background: "radial-gradient(circle, hsl(15 85% 55%) 0%, transparent 65%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex-shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid hsl(15 85% 55% / 0.4)" }} />
              <div className="absolute inset-4 rounded-full" style={{ border: "1px solid hsl(15 85% 55% / 0.25)" }} />
              <img
                src={logo}
                alt=""
                className="relative w-full h-full object-contain p-6 drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
                style={{ filter: "hue-rotate(155deg) saturate(1.05)" }}
              />
              <Flame className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 text-orange-400 drop-shadow-lg" />
            </div>
            <div className="text-center lg:text-left">
              <div className="text-xs uppercase tracking-[0.35em] text-gold mb-4">Greatest Feats</div>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none mb-4">
                <span className="gold-gradient">ALL-TIME RECORDS</span>
              </h1>
              <div className="h-px w-24 bg-gold/60 my-6 mx-auto lg:mx-0" />
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                The biggest scores. The longest streaks. The legends written into the league forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RecordSection kicker="Career" title="Competition Records" defs={records.competition} onOpen={setOpen} mById={mById} />
      <RecordSection kicker="Single Gameweek" title="Gameweek Records" defs={records.gameweek} onOpen={setOpen} mById={mById} />
      <RecordSection kicker="Single Season" title="Season Records" defs={records.season} onOpen={setOpen} mById={mById} />
      <RecordSection kicker="Form" title="Streak Records" defs={records.streaks} onOpen={setOpen} mById={mById} />

      {/* All-Time XI */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="The Immortals" title="All-Time XI" />
        <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
          The highest-scoring single-season performances at every position, fitted into the legal formation
          ({records.bestXI.formation.def}-{records.bestXI.formation.mid}-{records.bestXI.formation.fwd}) that maximises total fantasy points.
        </p>
        <div className="mt-6">
          <FormationPitch players={records.bestXI.players} getManagerName={(id: string) => mById(id)?.name ?? ""} />
        </div>
      </section>

      {open && <RecordModal def={open} mById={mById} onClose={() => setOpen(null)} />}
    </div>
  );
}

// ---------- Record-building ----------
function buildRecords(d: any) {
  if (!d) return null;

  const mgrByName: Record<string, any> = {};
  d.managers.forEach((m: any) => {
    mgrByName[m.name] = m;
  });
  const mIdByName = (n?: string | null) => (n && mgrByName[n] ? mgrByName[n].id : null);
  const seasonById: Record<string, any> = {};
  d.seasons.forEach((s: any) => {
    seasonById[s.id] = s;
  });

  // ---- Competition (career totals) ----
  const titleCounts: Record<string, { count: number; firstYear: number }> = {};
  d.seasons
    .filter((s: any) => s.champion_manager_id)
    .forEach((s: any) => {
      const id = String(s.champion_manager_id);
      if (!titleCounts[id]) titleCounts[id] = { count: 0, firstYear: Infinity };
      titleCounts[id].count += 1;
      if (s.year_start < titleCounts[id].firstYear) titleCounts[id].firstYear = s.year_start;
    });
  const titlesEntries: Entry[] = Object.entries(titleCounts)
    .map(([id, v]) => ({
      managerId: id,
      value: v.count,
      formatted: String(v.count),
      context: `First in ${v.firstYear}`,
      _firstYear: v.firstYear,
    }))
    .sort((a: any, b: any) => b.value - a.value || a._firstYear - b._firstYear);

  const careerEntry = (key: "total_wins" | "total_draws" | "total_losses"): Entry[] =>
    [...d.alltime]
      .map((r: any) => ({
        managerId: r.manager_id,
        managerName: r.manager_name,
        value: Number(r[key] ?? 0),
        formatted: String(r[key] ?? 0),
      }))
      .sort((a, b) => b.value - a.value);

  const competition: RecordDef[] = [
    { key: "titles", label: "Most Titles", icon: <Crown />, tint: "hsl(45 90% 55%)", entries: titlesEntries, unit: "titles" },
    { key: "career-wins", label: "Most Wins", icon: <Trophy />, tint: "hsl(145 70% 50%)", entries: careerEntry("total_wins"), unit: "wins" },
    { key: "career-draws", label: "Most Draws", icon: <Shield />, tint: "hsl(45 60% 60%)", entries: careerEntry("total_draws"), unit: "draws" },
    { key: "career-losses", label: "Most Losses", icon: <TrendingDown />, tint: "hsl(0 70% 55%)", entries: careerEntry("total_losses"), unit: "losses" },
  ];

  // ---- Gameweek (per fixture / per side) ----
  const fx = d.fixtures.filter((f: any) => f.home_score != null && f.away_score != null);

  // Each side of every fixture as a single GW score
  const sideScores: Entry[] = [];
  fx.forEach((f: any) => {
    const ctx = `${f.season_name} · GW${f.gameweek}`;
    sideScores.push({
      managerId: mIdByName(f.home_manager),
      managerName: f.home_manager,
      value: Number(f.home_score),
      formatted: String(f.home_score),
      context: `${ctx} · vs ${f.away_manager} (${f.home_score}–${f.away_score})`,
    });
    sideScores.push({
      managerId: mIdByName(f.away_manager),
      managerName: f.away_manager,
      value: Number(f.away_score),
      formatted: String(f.away_score),
      context: `${ctx} · vs ${f.home_manager} (${f.away_score}–${f.home_score})`,
    });
  });
  const highestGW = [...sideScores].sort((a, b) => b.value - a.value);
  const lowestGW = [...sideScores].sort((a, b) => a.value - b.value);

  // Margins (winner's margin — held by the winning manager)
  const margins: Entry[] = fx
    .filter((f: any) => f.margin > 0)
    .map((f: any) => ({
      managerId: mIdByName(f.winner_name),
      managerName: f.winner_name,
      value: Number(f.margin),
      formatted: String(f.margin),
      context: `${f.season_name} · GW${f.gameweek} · beat ${f.loser_name} ${f.winning_score}–${f.losing_score}`,
    }))
    .sort((a: Entry, b: Entry) => b.value - a.value);

  // Combined-fixture totals (held by both managers — credit the winner / first listed)
  const combined: Entry[] = fx
    .map((f: any) => ({
      managerId: mIdByName(f.winner_name ?? f.home_manager),
      managerName: f.winner_name ?? f.home_manager,
      value: Number(f.combined_score ?? f.home_score + f.away_score),
      formatted: String(f.combined_score ?? f.home_score + f.away_score),
      context: `${f.season_name} · GW${f.gameweek} · ${f.home_manager} ${f.home_score}–${f.away_score} ${f.away_manager}`,
    }))
    .sort((a, b) => b.value - a.value);
  const combinedLow = [...combined].sort((a, b) => a.value - b.value);

  const gameweek: RecordDef[] = [
    { key: "gw-high", label: "Highest GW Score", icon: <Flame />, tint: "hsl(15 85% 55%)", entries: highestGW, unit: "pts" },
    { key: "gw-margin", label: "Biggest Winning Margin", icon: <Target />, tint: "hsl(0 80% 55%)", entries: margins, unit: "pts" },
    { key: "gw-combined-high", label: "Highest Scoring Fixture", icon: <Zap />, tint: "hsl(285 70% 60%)", entries: combined, unit: "pts" },
    { key: "gw-low", label: "Lowest GW Score", icon: <TrendingDown />, tint: "hsl(200 30% 55%)", entries: lowestGW, unit: "pts" },
    { key: "gw-combined-low", label: "Lowest Combined Fixture", icon: <Shield />, tint: "hsl(220 40% 50%)", entries: combinedLow, unit: "pts" },
  ];

  // ---- Season ----
  const seasonEntry = (
    key: "wins" | "total_points" | "points_for" | "losses",
    formatter: (v: number) => string = String,
    asc = false,
  ): Entry[] => {
    const arr: Entry[] = d.standings.map((s: any) => ({
      managerId: s.manager_id,
      value: Number(s[key] ?? 0),
      formatted: formatter(Number(s[key] ?? 0)),
      context: seasonById[s.season_id]?.name,
    }));
    return arr.sort((a, b) => (asc ? a.value - b.value : b.value - a.value));
  };

  // Most TOTS appearances by manager (one per season)
  const totsByMgrSeason: Record<string, number> = {};
  d.tots.forEach((t: any) => {
    const k = `${t.manager_name}__${t.season_name}`;
    totsByMgrSeason[k] = (totsByMgrSeason[k] ?? 0) + 1;
  });
  const totsBestSingleSeason: Entry[] = Object.entries(totsByMgrSeason)
    .map(([k, count]) => {
      const [name, season] = k.split("__");
      return {
        managerId: mIdByName(name),
        managerName: name,
        value: count,
        formatted: String(count),
        context: season,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Most TOTS players across all seasons (career)
  const totsCareer: Record<string, number> = {};
  d.tots.forEach((t: any) => {
    totsCareer[t.manager_name] = (totsCareer[t.manager_name] ?? 0) + 1;
  });
  const totsCareerEntries: Entry[] = Object.entries(totsCareer)
    .map(([name, c]) => ({ managerId: mIdByName(name), managerName: name, value: c, formatted: String(c) }))
    .sort((a, b) => b.value - a.value);

  const season: RecordDef[] = [
    { key: "s-wins", label: "Most Wins (Season)", icon: <Trophy />, tint: "hsl(45 90% 55%)", entries: seasonEntry("wins"), unit: "wins" },
    { key: "s-pts", label: "Most League Points (Season)", icon: <Crown />, tint: "hsl(285 70% 60%)", entries: seasonEntry("total_points"), unit: "pts" },
    { key: "s-pf", label: "Most FPL Points (Season)", icon: <Flame />, tint: "hsl(15 85% 55%)", entries: seasonEntry("points_for", (v) => v.toFixed(0)), unit: "pts" },
    { key: "s-losses", label: "Fewest Losses (Season)", icon: <Shield />, tint: "hsl(195 80% 55%)", entries: seasonEntry("losses", String, true), unit: "losses" },
    { key: "s-tots-season", label: "Most TOTS Players (Season)", icon: <Trophy />, tint: "hsl(45 80% 50%)", entries: totsBestSingleSeason, unit: "players" },
    { key: "s-tots-career", label: "Most TOTS Players (All-Time)", icon: <Crown />, tint: "hsl(45 90% 60%)", entries: totsCareerEntries, unit: "players" },
  ];

  // ---- Streaks ----
  const streakOf = (predicate: (o: string) => boolean): Entry[] => {
    // Group consecutive same-outcome rows in the right order? The win_streaks table
    // already stores discrete maximal runs. To compute "unbeaten" or "winless", we
    // need to merge — but since the table only stores W/L/D individually, the best
    // approximation we have is the longest single-outcome run that satisfies the
    // predicate. For longest unbeaten/winless, we treat it as max(streak) where
    // outcome matches the predicate set; if both W and D rows exist back-to-back
    // for the same manager/season, the merged streak isn't represented here, so
    // we fall back to the longest single-outcome qualifying run.
    return [...d.streaks]
      .filter((s: any) => predicate(s.outcome))
      .map((s: any) => ({
        managerId: mIdByName(s.manager_name),
        managerName: s.manager_name,
        value: s.streak_length,
        formatted: String(s.streak_length),
        context: `${s.season_name} · GW${s.streak_start_gw}–${s.streak_end_gw}`,
      }))
      .sort((a, b) => b.value - a.value);
  };

  // For unbeaten / winless we compute properly from raw fixtures because the
  // streaks table only stores single-outcome maximal runs.
  const merged = computeMergedStreaks(d.fixtures, d.managers, seasonById);

  const streaks: RecordDef[] = [
    { key: "st-win", label: "Longest Winning Streak", icon: <Flame />, tint: "hsl(45 90% 55%)", entries: streakOf((o) => o === "W"), unit: "wins" },
    { key: "st-unbeaten", label: "Longest Unbeaten Streak", icon: <Shield />, tint: "hsl(145 70% 50%)", entries: merged.unbeaten, unit: "matches" },
    { key: "st-winless", label: "Longest Winless Run", icon: <TrendingDown />, tint: "hsl(30 60% 50%)", entries: merged.winless, unit: "matches" },
    { key: "st-loss", label: "Longest Losing Run", icon: <TrendingDown />, tint: "hsl(0 75% 50%)", entries: streakOf((o) => o === "L"), unit: "losses" },
  ];

  // ---- All-Time XI from single-season performances ----
  const bestXI = buildBestXI(d.playerHistory);

  return { competition, gameweek, season, streaks, bestXI };
}

// Compute longest unbeaten (W/D) and winless (D/L) per (manager, season) by
// scanning fixtures in gameweek order. Returns the longest run per manager.
function computeMergedStreaks(fixtures: any[], managers: any[], seasonById: Record<string, any>) {
  const fxByMgrSeason: Record<string, any[]> = {};
  fixtures
    .filter((f) => f.home_score != null && f.away_score != null)
    .forEach((f) => {
      const homeId = f.home_manager_id;
      const awayId = f.away_manager_id;
      const homeRes = f.home_score > f.away_score ? "W" : f.home_score < f.away_score ? "L" : "D";
      const awayRes = f.away_score > f.home_score ? "W" : f.away_score < f.home_score ? "L" : "D";
      const kH = `${homeId}__${f.season_id}`;
      const kA = `${awayId}__${f.season_id}`;
      (fxByMgrSeason[kH] ||= []).push({ gw: f.gameweek, res: homeRes });
      (fxByMgrSeason[kA] ||= []).push({ gw: f.gameweek, res: awayRes });
    });

  const longest = (predicate: (r: string) => boolean) => {
    const best: Record<string, { len: number; season: string; start: number; end: number }> = {};
    for (const k of Object.keys(fxByMgrSeason)) {
      const [mgrId, seasonId] = k.split("__");
      const arr = fxByMgrSeason[k].sort((a, b) => a.gw - b.gw);
      let cur = 0;
      let curStart = 0;
      let topLen = 0;
      let topStart = 0;
      let topEnd = 0;
      for (const r of arr) {
        if (predicate(r.res)) {
          if (cur === 0) curStart = r.gw;
          cur += 1;
          if (cur > topLen) {
            topLen = cur;
            topStart = curStart;
            topEnd = r.gw;
          }
        } else {
          cur = 0;
        }
      }
      if (topLen > (best[mgrId]?.len ?? 0)) {
        best[mgrId] = { len: topLen, season: seasonById[seasonId]?.name ?? "", start: topStart, end: topEnd };
      }
    }
    return Object.entries(best)
      .map(([mgrId, v]) => {
        const m = managers.find((mm) => String(mm.id) === String(mgrId));
        return {
          managerId: mgrId,
          managerName: m?.name,
          value: v.len,
          formatted: String(v.len),
          context: `${v.season} · GW${v.start}–${v.end}`,
        } as Entry;
      })
      .sort((a, b) => b.value - a.value);
  };

  return {
    unbeaten: longest((r) => r === "W" || r === "D"),
    winless: longest((r) => r === "L" || r === "D"),
  };
}

// Build an All-Time XI from the best single-season performances per player,
// trying every legal formation and picking the one with the highest total.
function buildBestXI(history: any[]) {
  // Best single season per player (by player_name, since player_id may collide across managers)
  const bestPerPlayer: Record<string, any> = {};
  for (const r of history) {
    const k = r.player_name;
    if (!bestPerPlayer[k] || r.fantasy_points > bestPerPlayer[k].fantasy_points) {
      bestPerPlayer[k] = r;
    }
  }
  const players = Object.values(bestPerPlayer);
  const posMap: Record<string, string> = { G: "GK", D: "DEF", M: "MID", F: "FWD" };
  const byPos: Record<string, any[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of players as any[]) {
    const pos = posMap[p.position];
    if (!pos) continue;
    byPos[pos].push(p);
  }
  for (const k of Object.keys(byPos)) {
    byPos[k].sort((a, b) => (b.fantasy_points ?? 0) - (a.fantasy_points ?? 0));
  }

  const formations = [
    { def: 3, mid: 4, fwd: 3 },
    { def: 3, mid: 5, fwd: 2 },
    { def: 4, mid: 3, fwd: 3 },
    { def: 4, mid: 4, fwd: 2 },
    { def: 4, mid: 5, fwd: 1 },
    { def: 5, mid: 3, fwd: 2 },
    { def: 5, mid: 4, fwd: 1 },
  ];
  let best: { total: number; formation: any; players: any[] } = { total: -1, formation: formations[0], players: [] };
  for (const f of formations) {
    const gk = byPos.GK.slice(0, 1);
    const def = byPos.DEF.slice(0, f.def);
    const mid = byPos.MID.slice(0, f.mid);
    const fwd = byPos.FWD.slice(0, f.fwd);
    if (gk.length < 1 || def.length < f.def || mid.length < f.mid || fwd.length < f.fwd) continue;
    const all = [...gk, ...def, ...mid, ...fwd];
    const total = all.reduce((s, p) => s + (p.fantasy_points ?? 0), 0);
    if (total > best.total) best = { total, formation: f, players: all };
  }
  // Normalise for FormationPitch
  const mapped = best.players.map((p) => ({
    player_name: p.player_name,
    position: ({ G: "GK", D: "DEF", M: "MID", F: "FWD" } as any)[p.position],
    club: p.club,
    total_fantasy_points: p.fantasy_points,
    avg_points_per_game: p.avg_points_per_game,
  }));
  return { formation: best.formation, players: mapped };
}

// ---------- UI: Section ----------
function RecordSection({
  kicker,
  title,
  defs,
  onOpen,
  mById,
}: {
  kicker: string;
  title: string;
  defs: RecordDef[];
  onOpen: (d: RecordDef) => void;
  mById: (id: any) => any;
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
      <SectionTitle kicker={kicker} title={title} />
      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        {defs.map((def) => (
          <RecordCard key={def.key} def={def} onOpen={() => onOpen(def)} mById={mById} />
        ))}
      </div>
    </section>
  );
}

// ---------- UI: Card with bar chart ----------
function RecordCard({ def, onOpen, mById }: { def: RecordDef; onOpen: () => void; mById: (id: any) => any }) {
  const top = def.entries.slice(0, 5);
  if (top.length === 0) return null;
  const max = top[0].value || 1;
  return (
    <div
      className="relative rounded-xl p-5 overflow-hidden border border-white/10"
      style={{ background: `linear-gradient(135deg, ${def.tint}38 0%, ${def.tint}08 60%, rgba(10,17,48,0.75) 100%)` }}
    >
      <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full blur-3xl opacity-30" style={{ background: def.tint }} />
      <div className="relative flex items-center gap-3 mb-4">
        <span className="p-2 rounded-md" style={{ background: `${def.tint}25`, color: def.tint }}>
          {def.icon}
        </span>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/85 font-bold">{def.label}</div>
      </div>

      <div className="relative space-y-2">
        {top.map((e, i) => {
          const m = e.managerId != null ? mById(e.managerId) : null;
          const b = e.managerId != null ? getBranding(String(e.managerId)) : null;
          const tint = b?.primary ?? def.tint;
          const pct = max > 0 ? Math.max(4, (e.value / max) * 100) : 0;
          const name = m?.name ?? e.managerName ?? "—";
          return (
            <div key={i} className="flex items-center gap-2">
              <span className={`font-display text-sm w-4 text-right ${i === 0 ? "text-gold" : "text-white/40"}`}>{i + 1}</span>
              {b?.badge ? (
                <img src={b.badge} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: tint }}
                >
                  {String(name).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs capitalize truncate text-white/85 font-medium">{name}</span>
                  <span className="font-display text-base text-white tabular-nums">{e.formatted}</span>
                </div>
                <div className="h-1.5 mt-1 rounded-full overflow-hidden bg-white/5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tint} 0%, ${tint}99 100%)` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onOpen}
        className="relative mt-4 w-full text-[11px] uppercase tracking-[0.18em] font-bold py-2 rounded-md border border-white/15 hover:border-white/40 hover:bg-white/5 transition"
        style={{ color: def.tint }}
      >
        Full list →
      </button>
    </div>
  );
}

// ---------- UI: Modal ----------
function RecordModal({ def, mById, onClose }: { def: RecordDef; mById: (id: any) => any; onClose: () => void }) {
  const list = def.entries.slice(0, 10);
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl max-w-md w-full p-6 relative max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Top {list.length}</div>
        <h3 className="font-display text-2xl md:text-3xl mt-1 mb-5">{def.label}</h3>
        <ol className="space-y-2">
          {list.map((e, i) => {
            const m = e.managerId != null ? mById(e.managerId) : null;
            const b = e.managerId != null ? getBranding(String(e.managerId)) : null;
            const tint = b?.primary ?? def.tint;
            const name = m?.name ?? e.managerName ?? "—";
            const inner = (
              <div
                className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-white/40 transition"
                style={{ background: `linear-gradient(90deg, ${tint}25 0%, transparent 80%)` }}
              >
                <span className={`font-display text-xl w-6 text-center ${i === 0 ? "text-gold" : "text-muted-foreground"}`}>{i + 1}</span>
                {b?.badge ? (
                  <img src={b.badge} alt="" className="w-9 h-9 object-contain" />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: tint }}>
                    {String(name).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="capitalize font-medium truncate">{name}</div>
                  {e.context && <div className="text-[11px] text-muted-foreground truncate">{e.context}</div>}
                </div>
                <span className="font-display text-lg text-gold tabular-nums">
                  {e.formatted}
                  {def.unit && <span className="text-[10px] uppercase tracking-wider text-muted-foreground ml-1">{def.unit}</span>}
                </span>
              </div>
            );
            return (
              <li key={i}>
                {m ? (
                  <Link to="/team/$managerId" params={{ managerId: String(m.id) }} onClick={onClose}>
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">{kicker}</div>
      <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
    </div>
  );
}
