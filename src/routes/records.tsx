import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { FormationPitch } from "@/components/FormationPitch";
import { getBranding } from "@/lib/managerBranding";
import { Flame, Trophy, Crown, Target, Zap, Shield, TrendingDown, X, Award } from "lucide-react";

export const Route = createFileRoute("/records")({
  component: RecordsPage,
  head: () => ({
    meta: [
      { title: "All-Time Records - FPL Super League" },
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
  // Optional second manager (used for joint records like a fixture)
  secondaryManagerId?: string | number | null;
  secondaryManagerName?: string | null;
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
      supabase.from("unbeaten_streaks").select("*"),
      supabase.from("winless_streaks").select("*"),
      supabase.from("losing_streaks").select("*"),
      supabase.from("team_season_stats_full").select("*"),
    ]).then(([s, m, a, f, st, sd, tots, pth, ub, wl, ls, tss]) =>
      setD({
        seasons: s.data ?? [],
        managers: m.data ?? [],
        alltime: a.data ?? [],
        fixtures: f.data ?? [],
        streaks: st.data ?? [],
        standings: sd.data ?? [],
        tots: tots.data ?? [],
        playerHistory: pth.data ?? [],
        unbeaten: ub.data ?? [],
        winless: wl.data ?? [],
        losing: ls.data ?? [],
        teamSeasonStats: tss.data ?? [],
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
              <div
                className="absolute inset-0 rounded-2xl rotate-[8deg]"
                style={{
                  background: "linear-gradient(140deg, hsl(15 85% 55% / 0.35) 0%, hsl(0 0% 0% / 0.25) 100%)",
                  border: "1.5px solid hsl(15 85% 55% / 0.5)",
                  boxShadow: "0 8px 40px hsl(15 85% 55% / 0.25)",
                }}
              />
              <div className="absolute inset-2 rounded-2xl -rotate-[8deg] border border-gold/30 bg-background/60 backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <Flame className="w-24 h-24 sm:w-28 sm:h-28 text-orange-400 drop-shadow-[0_4px_18px_rgba(255,140,40,0.6)]" />
                  <Award className="absolute -bottom-2 -right-2 w-9 h-9 text-gold drop-shadow-lg" />
                </div>
              </div>
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
          <FormationPitch players={records.bestXI.players} getManagerName={(id: string) => { const mm = mById(id); return mm?.team_name ?? mm?.name ?? ""; }} />
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

  const fplCareer = (asc = false): Entry[] =>
    [...d.alltime]
      .map((r: any) => ({
        managerId: r.manager_id,
        managerName: r.manager_name,
        value: Number(r.total_points_for ?? 0),
        formatted: Number(r.total_points_for ?? 0).toLocaleString(),
      }))
      .sort((a, b) => (asc ? a.value - b.value : b.value - a.value));

  const competition: RecordDef[] = [
    { key: "titles", label: "Most Titles", icon: <Crown />, tint: "hsl(45 90% 55%)", entries: titlesEntries, unit: "titles" },
    { key: "career-wins", label: "Most Wins", icon: <Trophy />, tint: "hsl(145 70% 50%)", entries: careerEntry("total_wins"), unit: "wins" },
    { key: "career-draws", label: "Most Draws", icon: <Shield />, tint: "hsl(45 60% 60%)", entries: careerEntry("total_draws"), unit: "draws" },
    { key: "career-losses", label: "Most Losses", icon: <TrendingDown />, tint: "hsl(0 70% 55%)", entries: careerEntry("total_losses"), unit: "losses" },
    { key: "career-fpl-high", label: "Most FPL Points", icon: <Flame />, tint: "hsl(15 85% 55%)", entries: fplCareer(false), unit: "pts" },
    { key: "career-fpl-low", label: "Fewest FPL Points", icon: <TrendingDown />, tint: "hsl(200 40% 55%)", entries: fplCareer(true), unit: "pts" },
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
      context: `${ctx} · vs ${f.away_manager} (${f.home_score}-${f.away_score})`,
    });
    sideScores.push({
      managerId: mIdByName(f.away_manager),
      managerName: f.away_manager,
      value: Number(f.away_score),
      formatted: String(f.away_score),
      context: `${ctx} · vs ${f.home_manager} (${f.away_score}-${f.home_score})`,
    });
  });
  const highestGW = [...sideScores].sort((a, b) => b.value - a.value);
  // Lowest GW score: exclude 0s as outliers (missed deadlines, etc.)
  const lowestGW = [...sideScores].filter((e) => e.value > 0).sort((a, b) => a.value - b.value);

  // Margins (winner's margin - held by the winning manager)
  const margins: Entry[] = fx
    .filter((f: any) => f.margin > 0)
    .map((f: any) => ({
      managerId: mIdByName(f.winner_name),
      managerName: f.winner_name,
      value: Number(f.margin),
      formatted: String(f.margin),
      context: `${f.season_name} · GW${f.gameweek} · beat ${f.loser_name} ${f.winning_score}-${f.losing_score}`,
    }))
    .sort((a: Entry, b: Entry) => b.value - a.value);

  // Combined-fixture totals (held by both managers)
  const combined: Entry[] = fx
    .map((f: any) => ({
      managerId: mIdByName(f.home_manager),
      managerName: f.home_manager,
      secondaryManagerId: mIdByName(f.away_manager),
      secondaryManagerName: f.away_manager,
      value: Number(f.combined_score ?? f.home_score + f.away_score),
      formatted: String(f.combined_score ?? f.home_score + f.away_score),
      context: `${f.season_name} · GW${f.gameweek} · ${f.home_manager} ${f.home_score}-${f.away_score} ${f.away_manager}`,
    }))
    .sort((a: Entry, b: Entry) => b.value - a.value);
  // Lowest combined: exclude fixtures where either side scored 0 (outliers)
  const combinedLow = [...combined]
    .filter((e: any) => {
      const ctxScores = String(e.context).match(/(\d+)-(\d+)/);
      if (!ctxScores) return e.value > 0;
      return Number(ctxScores[1]) > 0 && Number(ctxScores[2]) > 0;
    })
    .sort((a: Entry, b: Entry) => a.value - b.value);

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

  // League TOTS = best legal-formation 11 across all managers per season.
  // Across the league's first 3 seasons that's exactly 33 selections.
  const tots1to3SeasonNames = new Set(
    [...d.seasons].sort((a: any, b: any) => a.year_start - b.year_start).slice(0, 3).map((s: any) => s.name),
  );
  const totsRows = d.tots.filter((t: any) => tots1to3SeasonNames.has(t.season_name));
  const totsCareer: Record<string, number> = {};
  const totsBySeason: Record<string, any[]> = {};
  totsRows.forEach((r: any) => { (totsBySeason[r.season_name] ??= []).push(r); });
  const tFormations = [
    { def: 3, mid: 4, fwd: 3 }, { def: 3, mid: 5, fwd: 2 }, { def: 4, mid: 3, fwd: 3 },
    { def: 4, mid: 4, fwd: 2 }, { def: 4, mid: 5, fwd: 1 }, { def: 5, mid: 3, fwd: 2 }, { def: 5, mid: 4, fwd: 1 },
  ];
  const posMapTots: Record<string, string> = { G: "GK", D: "DEF", M: "MID", F: "FWD" };
  Object.values(totsBySeason).forEach((rows: any[]) => {
    const byPos: Record<string, any[]> = { GK: [], DEF: [], MID: [], FWD: [] };
    for (const p of rows) {
      const pos = posMapTots[p.position];
      if (pos) byPos[pos].push(p);
    }
    Object.keys(byPos).forEach((k) => byPos[k].sort((a, b) => (b.fantasy_points ?? 0) - (a.fantasy_points ?? 0)));
    let best = { total: -1, players: [] as any[] };
    for (const f of tFormations) {
      const gk = byPos.GK.slice(0, 1);
      const def = byPos.DEF.slice(0, f.def);
      const mid = byPos.MID.slice(0, f.mid);
      const fwd = byPos.FWD.slice(0, f.fwd);
      if (gk.length < 1 || def.length < f.def || mid.length < f.mid || fwd.length < f.fwd) continue;
      const all = [...gk, ...def, ...mid, ...fwd];
      const total = all.reduce((s, p) => s + (p.fantasy_points ?? 0), 0);
      if (total > best.total) best = { total, players: all };
    }
    for (const p of best.players) totsCareer[p.manager_name] = (totsCareer[p.manager_name] ?? 0) + 1;
  });
  const totsCareerEntries: Entry[] = Object.entries(totsCareer)
    .map(([name, c]) => ({ managerId: mIdByName(name), managerName: name, value: c, formatted: String(c) }))
    .sort((a, b) => b.value - a.value);

  const season: RecordDef[] = [
    { key: "s-wins", label: "Most Wins (Season)", icon: <Trophy />, tint: "hsl(45 90% 55%)", entries: seasonEntry("wins"), unit: "wins" },
    { key: "s-pts", label: "Most League Points (Season)", icon: <Crown />, tint: "hsl(285 70% 60%)", entries: seasonEntry("total_points"), unit: "pts" },
    { key: "s-pf", label: "Most FPL Points (Season)", icon: <Flame />, tint: "hsl(15 85% 55%)", entries: seasonEntry("points_for", (v) => v.toFixed(0)), unit: "pts" },
    { key: "s-losses", label: "Fewest Losses (Season)", icon: <Shield />, tint: "hsl(195 80% 55%)", entries: seasonEntry("losses", String, true), unit: "losses" },
    { key: "s-tots-career", label: "Most TOTS Players (All-Time)", icon: <Crown />, tint: "hsl(45 90% 60%)", entries: totsCareerEntries, unit: "players" },
  ];

  // ---- Streaks ----
  const fromStreakTable = (rows: any[]): Entry[] =>
    [...rows]
      .map((s: any) => ({
        managerId: mIdByName(s.manager_name),
        managerName: s.manager_name,
        value: s.streak_length,
        formatted: String(s.streak_length),
        context: `${s.season_name} · GW${s.streak_start_gw}-${s.streak_end_gw}`,
      }))
      .sort((a, b) => b.value - a.value);

  const winRows = (d.streaks ?? []).filter((s: any) => s.outcome === "W");
  const lossRows = (d.losing ?? []).length
    ? d.losing
    : (d.streaks ?? []).filter((s: any) => s.outcome === "L");

  const streaks: RecordDef[] = [
    { key: "st-win", label: "Longest Winning Streak", icon: <Flame />, tint: "hsl(45 90% 55%)", entries: fromStreakTable(winRows), unit: "wins" },
    { key: "st-unbeaten", label: "Longest Unbeaten Streak", icon: <Shield />, tint: "hsl(145 70% 50%)", entries: fromStreakTable(d.unbeaten ?? []), unit: "matches" },
    { key: "st-winless", label: "Longest Winless Run", icon: <TrendingDown />, tint: "hsl(30 60% 50%)", entries: fromStreakTable(d.winless ?? []), unit: "matches" },
    { key: "st-loss", label: "Longest Losing Run", icon: <TrendingDown />, tint: "hsl(0 75% 50%)", entries: fromStreakTable(lossRows), unit: "losses" },
  ];

  // ---- All-Time XI from single-season performances ----
  const bestXI = buildBestXI(d.playerHistory, mgrByName);

  return { competition, gameweek, season, streaks, bestXI };
}

// Build an All-Time XI from the best single-season performances per player,
// trying every legal formation and picking the one with the highest total.
function buildBestXI(history: any[], mgrByName: Record<string, any>) {
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
  // Normalise for FormationPitch (carry manager_id so each player wears their kit)
  const mapped = best.players.map((p) => ({
    player_name: p.player_name,
    position: ({ G: "GK", D: "DEF", M: "MID", F: "FWD" } as any)[p.position],
    club: p.club,
    total_fantasy_points: p.fantasy_points,
    avg_points_per_game: p.avg_points_per_game,
    manager_id: p.manager_id ?? mgrByName[p.manager_name]?.id,
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
          const m2 = e.secondaryManagerId != null ? mById(e.secondaryManagerId) : null;
          const b2 = e.secondaryManagerId != null ? getBranding(String(e.secondaryManagerId)) : null;
          const tint = b?.primary ?? def.tint;
          const pct = max > 0 ? Math.max(4, (e.value / max) * 100) : 0;
          const name = m?.team_name ?? m?.name ?? e.managerName ?? "-";
          const name2 = m2?.team_name ?? m2?.name ?? e.secondaryManagerName;
          return (
            <div key={i} className="flex items-center gap-2">
              <span className={`font-display text-sm w-4 text-right ${i === 0 ? "text-gold" : "text-white/40"}`}>{i + 1}</span>
              <div className="flex items-center -space-x-2 flex-shrink-0">
                {b?.badge ? (
                  <img src={b.badge} alt="" className="w-6 h-6 object-contain" />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: tint }}>
                    {String(name).charAt(0).toUpperCase()}
                  </div>
                )}
                {name2 && (b2?.badge ? (
                  <img src={b2.badge} alt="" className="w-6 h-6 object-contain ring-1 ring-background rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-background" style={{ background: b2?.primary ?? def.tint }}>
                    {String(name2).charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs capitalize truncate text-white/85 font-medium">
                    {name2 ? `${name} vs ${name2}` : name}
                  </span>
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
            const name = m?.team_name ?? m?.name ?? e.managerName ?? "-";
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
                  <div className="capitalize font-medium truncate">
                    {e.secondaryManagerName || e.secondaryManagerId
                      ? `${name} vs ${(e.secondaryManagerId != null ? (mById(e.secondaryManagerId)?.team_name ?? mById(e.secondaryManagerId)?.name) : null) ?? e.secondaryManagerName}`
                      : name}
                  </div>
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
