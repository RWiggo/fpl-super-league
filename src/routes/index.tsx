import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StatCard, Skeleton } from "@/components/StatCard";
import { Trophy, Flame, Target, Crown, TrendingUp, Zap, Skull } from "lucide-react";
import logo from "@/assets/fpl-super-league-logo.png";
import { getBranding } from "@/lib/managerBranding";
import { MANAGER_KITS } from "@/lib/managerKits";

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
      setData({
        seasons: seasons.data ?? [],
        managers: managers.data ?? [],
        alltime: alltime.data ?? [],
        fixtures: fixtures.data ?? [],
        streaks: streaks.data ?? [],
        weeklyHigh: weeklyHigh.data ?? [],
        standings: currentStandings.data ?? [],
      });
    })();
  }, []);

  if (!data) return <HomeSkeleton />;

  const managerById = (id: string) => data.managers.find((m: any) => m.id === id);
  const seasonById = (id: string) => data.seasons.find((s: any) => s.id === id);
  const completedSeasons = data.seasons.filter((s: any) => s.champion_manager_id);
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
    `🏆 Highest Score: ${highestVal} pts (${managerById(highestTeam)?.name ?? "—"})`,
    `⚔️ Biggest Margin: ${biggestMargin?.margin ?? 0} pts`,
    `🔥 Longest Win Streak: ${longestWinStreak?.streak_length ?? 0}`,
    `👑 Most Titles: ${mostTitles ? `${managerById(mostTitles[0])?.name} — ${mostTitles[1]}` : "—"}`,
    `📊 ${data.fixtures.length} Fixtures Played`,
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-silver/20 min-h-[80vh] flex items-center">
        <div className="absolute inset-0 ucl-stars opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl pointer-events-none animate-pulse"
             style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 65%)", opacity: 0.35 }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.4em] text-silver mb-6">EST. 2022 · The Official Archive</div>
              <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.85] mb-4">
                THE<br />
                <span className="silver-gradient">FPL SUPER</span><br />
                <span className="silver-gradient">LEAGUE</span>
              </h1>
              <div className="h-px w-32 bg-silver/50 my-6" />
              <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mb-10">
                Three seasons. One archive. Every champion, every record, every legend.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/records" className="px-7 py-3 bg-primary text-primary-foreground font-semibold uppercase tracking-[0.18em] text-xs rounded hover:opacity-90 transition primary-glow">
                  Enter The Archive
                </Link>
                {currentSeason && (
                  <Link to="/season/$seasonId" params={{ seasonId: currentSeason.id }} className="px-7 py-3 border border-silver/50 hover:border-primary hover:text-primary font-semibold uppercase tracking-[0.18em] text-xs rounded transition">
                    Live Season →
                  </Link>
                )}
              </div>
            </div>
            <img
              src={logo}
              alt="FPL Super League crest"
              width={420}
              height={420}
              className="hidden lg:block w-[320px] xl:w-[420px] h-auto drop-shadow-[0_0_60px_rgba(80,140,255,0.45)]"
            />
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="border-y border-border/50 bg-card/30 py-4 overflow-hidden">
        <div className="marquee flex gap-12 whitespace-nowrap text-sm uppercase tracking-widest">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="text-muted-foreground">
              <span className="text-gold mr-2">●</span>{t}
            </span>
          ))}
        </div>
      </div>

      {/* HALL OF CHAMPIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeader kicker="Roll of Honour" title="Hall of Champions" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {completedSeasons.map((s: any) => {
            const champ = managerById(s.champion_manager_id);
            return (
              <Link key={s.id} to="/season/$seasonId" params={{ seasonId: s.id }} className="premium-card rounded-lg p-8 group hover:border-gold transition-all hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/10 blur-2xl group-hover:bg-gold/20 transition" />
                <Trophy className="w-12 h-12 text-gold mb-4" strokeWidth={1.2} />
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{s.name} Champion</div>
                <div className="font-display text-4xl mb-2 capitalize">{champ?.name ?? "—"}</div>
                <div className="text-sm text-muted-foreground capitalize">{champ?.team_name}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECORDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
        <SectionHeader kicker="The Numbers" title="All-Time Records" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          <StatCard label="Highest Single Score" value={highestVal} sub={highestTeam ? `${managerById(highestTeam)?.name} · ${seasonById(highestScore.season_id)?.name} GW${highestScore.gameweek}` : ""} icon={<Flame className="w-5 h-5" />} />
          <StatCard label="Biggest Margin" value={biggestMargin?.margin ?? 0} sub={biggestMargin ? `${seasonById(biggestMargin.season_id)?.name} GW${biggestMargin.gameweek}` : ""} icon={<Target className="w-5 h-5" />} />
          <StatCard label="Longest Win Streak" value={longestWinStreak?.streak_length ?? 0} sub={longestWinStreak ? `${managerById(longestWinStreak.manager_id)?.name}` : ""} icon={<Zap className="w-5 h-5" />} />
          <StatCard label="Most Titles" value={mostTitles?.[1] ?? 0} sub={mostTitles ? managerById(mostTitles[0])?.name : ""} icon={<Crown className="w-5 h-5" />} />
          <StatCard label="Best Win % (50+ games)" value={winPctLeader ? `${((winPctLeader.wins / (winPctLeader.wins + winPctLeader.draws + winPctLeader.losses)) * 100).toFixed(1)}%` : "—"} sub={winPctLeader?.name ?? winPctLeader?.manager_name} icon={<TrendingUp className="w-5 h-5" />} />
          <StatCard label="Total Fixtures" value={data.fixtures.length} sub="and counting" icon={<Trophy className="w-5 h-5" />} />
        </div>
      </section>

      {/* CURRENT SEASON */}
      {currentSeason && currentStandings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" /> LIVE
              </div>
              <h2 className="font-display text-4xl md:text-5xl">Season {currentSeason.name}</h2>
            </div>
            <Link to="/season/$seasonId" params={{ seasonId: currentSeason.id }} className="text-sm uppercase tracking-wider text-gold hover:underline">View Full Season →</Link>
          </div>
          <div className="premium-card rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-4 w-12">#</th>
                  <th className="text-left p-4">Manager / Team</th>
                  <th className="text-center p-4">W</th>
                  <th className="text-center p-4">D</th>
                  <th className="text-center p-4">L</th>
                  <th className="text-right p-4">PF</th>
                  <th className="text-right p-4">Pts</th>
                </tr>
              </thead>
              <tbody>
                {currentStandings.map((row: any) => {
                  const m = managerById(row.manager_id);
                  return (
                    <tr key={row.id} className="border-t border-border/40 hover:bg-gold/5">
                      <td className="p-4 font-display text-lg text-gold">{row.position}</td>
                      <td className="p-4 capitalize">
                        <Link to="/team/$managerId" params={{ managerId: row.manager_id }} className="hover:text-gold">
                          <div className="font-medium">{m?.name}</div>
                          <div className="text-xs text-muted-foreground">{m?.team_name}</div>
                        </Link>
                      </td>
                      <td className="text-center p-4">{row.wins}</td>
                      <td className="text-center p-4">{row.draws}</td>
                      <td className="text-center p-4">{row.losses}</td>
                      <td className="text-right p-4">{Number(row.points_for ?? 0).toFixed(0)}</td>
                      <td className="text-right p-4 font-display text-lg text-gold">{row.total_points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ALL TIME PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <SectionHeader kicker="Eternal Standings" title="All-Time Top 5" inline />
          <Link to="/table" className="text-sm uppercase tracking-wider text-gold hover:underline">Full Table →</Link>
        </div>
        <div className="grid gap-3">
          {data.alltime.slice(0, 5).map((row: any, i: number) => {
            const m = managerById(row.manager_id);
            return (
              <Link key={row.manager_id} to="/team/$managerId" params={{ managerId: row.manager_id }} className="premium-card rounded-lg p-5 flex items-center gap-6 hover:border-gold transition group">
                <div className="font-display text-4xl text-gold w-12 text-center">{i + 1}</div>
                <div className="flex-1 capitalize">
                  <div className="font-display text-2xl">{m?.name ?? row.manager_name}</div>
                  <div className="text-xs text-muted-foreground">{row.wins}W · {row.draws}D · {row.losses}L</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl text-foreground">{row.total_points}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Points</div>
                </div>
                {i === 0 && <Trophy className="w-6 h-6 text-gold" />}
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECENT RESULTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
        <SectionHeader kicker="The Latest" title="Recent Results" />
        <div className="grid sm:grid-cols-2 gap-3 mt-10">
          {recentFixtures.slice(0, 8).map((f: any) => {
            const home = managerById(f.home_manager_id);
            const away = managerById(f.away_manager_id);
            const homeWin = f.home_score > f.away_score;
            const awayWin = f.away_score > f.home_score;
            return (
              <div key={f.id} className="premium-card rounded-lg p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{seasonById(f.season_id)?.name} · GW{f.gameweek}</div>
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex-1 capitalize ${homeWin ? "text-gold" : ""}`}>
                    <div className="text-sm font-medium truncate">{home?.name}</div>
                  </div>
                  <div className="font-display text-2xl tabular-nums">
                    {f.home_score} <span className="text-muted-foreground mx-1">–</span> {f.away_score}
                  </div>
                  <div className={`flex-1 text-right capitalize ${awayWin ? "text-gold" : ""}`}>
                    <div className="text-sm font-medium truncate">{away?.name}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TEAM TEASERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/50">
        <SectionHeader kicker="The Managers" title="Every Team" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-10">
          {data.managers.map((m: any) => (
            <Link key={m.id} to="/team/$managerId" params={{ managerId: m.id }} className="premium-card rounded-lg p-5 hover:border-gold hover:-translate-y-1 transition-all group">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Manager</div>
              <div className="font-display text-xl capitalize group-hover:text-gold transition">{m.name}</div>
              {m.team_name && <div className="text-xs text-muted-foreground mt-1 truncate">{m.team_name}</div>}
            </Link>
          ))}
        </div>
      </section>
    </div>
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
