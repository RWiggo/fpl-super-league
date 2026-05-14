import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

  // Wooden spoons (most last-place finishes)
  const spoonCounts: Record<string, number> = {};
  data.seasons.forEach((s: any) => {
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

  return (
    <div>
      {/* HERO — league crest centred, every competing team orbiting */}
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
              Three seasons. {data.managers.length} managers. One eternal archive.
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
        <SectionHeader kicker="Roll of Honour" title="Hall of Champions" />
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
                  <div className="font-display text-4xl mb-1 capitalize text-white">{champ?.team_name ?? champ?.name ?? "—"}</div>
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
              Wooden-spoon winners. Last place isn't an accident — it's a legacy.
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
                        {(s.manager.team_name ?? s.manager.name)?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-2xl capitalize text-white truncate">{s.manager.team_name ?? s.manager.name}</div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground capitalize">{s.manager.name}</div>
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

      {/* badges */}
      {teams.map((m, i) => {
        const b = getBranding(String(m.id));
        const tint = b?.primary ?? "#508cff";
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const radius = 44; // % from centre
        const x = 50 + Math.cos(angle) * radius;
        const y = 50 + Math.sin(angle) * radius;
        return (
          <Link
            key={m.id}
            to="/team/$managerId"
            params={{ managerId: String(m.id) }}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            title={m.team_name ?? m.name}
          >
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
                  {(m.team_name ?? m.name)?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
        );
      })}
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
