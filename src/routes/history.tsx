import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHero } from "@/components/PageHero";
import { StatCard, Skeleton } from "@/components/StatCard";
import { FormationPitch } from "@/components/FormationPitch";
import { Trophy, Crown, Flame, Target, Zap, Shield } from "lucide-react";

export const Route = createFileRoute("/history")({
  component: History,
  head: () => ({
    meta: [
      { title: "The Archive — All-Time Records" },
      { name: "description", content: "Every champion, every record, every legend in the league archive." },
    ],
  }),
});

function History() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [seasons, managers, alltime, fixtures, streaks, h2h, players, standings] = await Promise.all([
        supabase.from("seasons").select("*").order("year_start"),
        supabase.from("managers").select("*"),
        supabase.from("alltime_table").select("*"),
        supabase.from("fixture_records").select("*"),
        supabase.from("win_streaks").select("*"),
        supabase.from("h2h_records").select("*"),
        supabase.from("player_team_alltime").select("*"),
        supabase.from("season_standings").select("*"),
      ]);
      setD({
        seasons: seasons.data ?? [],
        managers: managers.data ?? [],
        alltime: alltime.data ?? [],
        fixtures: fixtures.data ?? [],
        streaks: streaks.data ?? [],
        h2h: h2h.data ?? [],
        players: players.data ?? [],
        standings: standings.data ?? [],
      });
    })();
  }, []);

  const [m1, setM1] = useState<string>("");
  const [m2, setM2] = useState<string>("");

  const h2hPair = useMemo(() => {
    if (!d || !m1 || !m2) return null;
    return d.h2h.find((r: any) =>
      (r.manager_a_id === m1 && r.manager_b_id === m2) || (r.manager_a_id === m2 && r.manager_b_id === m1)
    );
  }, [d, m1, m2]);

  const pairFixtures = useMemo(() => {
    if (!d || !m1 || !m2) return [];
    return d.fixtures.filter((f: any) =>
      (f.home_manager_id === m1 && f.away_manager_id === m2) ||
      (f.home_manager_id === m2 && f.away_manager_id === m1)
    );
  }, [d, m1, m2]);

  if (!d) return <Skel />;

  const mById = (id: string) => d.managers.find((m: any) => m.id === id);
  const sById = (id: string) => d.seasons.find((s: any) => s.id === id);

  const totalPoints = d.standings.reduce((acc: number, s: any) => acc + Number(s.points_for ?? 0), 0);

  // Records
  const sortedAlltime = [...d.alltime].sort((a: any, b: any) => (b.total_points ?? 0) - (a.total_points ?? 0));
  const titleCounts: Record<string, number> = {};
  d.seasons.filter((s: any) => s.champion_manager_id).forEach((s: any) => {
    titleCounts[s.champion_manager_id] = (titleCounts[s.champion_manager_id] ?? 0) + 1;
  });

  // Match records
  const fxByMaxScore = [...d.fixtures].filter((f: any) => f.home_score != null).sort((a: any, b: any) => Math.max(b.home_score, b.away_score) - Math.max(a.home_score, a.away_score));
  const highest = fxByMaxScore[0];
  const lowestWin = [...d.fixtures].filter((f: any) => f.home_score != null && f.home_score !== f.away_score).sort((a: any, b: any) => Math.max(a.home_score, a.away_score) - Math.max(b.home_score, b.away_score))[0];
  const biggestMargin = [...d.fixtures].sort((a: any, b: any) => (b.margin ?? 0) - (a.margin ?? 0))[0];
  const highestCombined = [...d.fixtures].sort((a: any, b: any) => ((b.home_score ?? 0) + (b.away_score ?? 0)) - ((a.home_score ?? 0) + (a.away_score ?? 0)))[0];

  // Season records
  const standingsBySeason = [...d.standings].sort((a: any, b: any) => (b.wins ?? 0) - (a.wins ?? 0));
  const mostWinsSeason = standingsBySeason[0];
  const mostPointsSeason = [...d.standings].sort((a: any, b: any) => (b.total_points ?? 0) - (a.total_points ?? 0))[0];
  const mostPFSeason = [...d.standings].sort((a: any, b: any) => (b.points_for ?? 0) - (a.points_for ?? 0))[0];

  // Streaks
  const winStreaks = d.streaks.filter((s: any) => (s.streak_type ?? s.type) === "win" || (s.streak_type ?? s.type) === "W");
  const longestWin = [...winStreaks].sort((a: any, b: any) => b.streak_length - a.streak_length)[0];
  const lossStreaks = d.streaks.filter((s: any) => (s.streak_type ?? s.type) === "loss" || (s.streak_type ?? s.type) === "L");
  const longestLoss = [...lossStreaks].sort((a: any, b: any) => b.streak_length - a.streak_length)[0];

  // Players
  const sortedPlayers = [...d.players].sort((a: any, b: any) => (b.total_fantasy_points ?? 0) - (a.total_fantasy_points ?? 0));
  const topPlayers = sortedPlayers.slice(0, 20);

  // All-time best 11 (best per position by total fantasy points, no duplicates)
  const seenPlayerIds = new Set<string>();
  const pickBest = (pos: string, n: number) => {
    const arr: any[] = [];
    for (const p of sortedPlayers) {
      if (p.position !== pos) continue;
      const pid = p.player_id ?? p.player_name;
      if (seenPlayerIds.has(pid)) continue;
      arr.push(p);
      seenPlayerIds.add(pid);
      if (arr.length === n) break;
    }
    return arr;
  };
  const allTimeXI = [
    ...pickBest("GK", 1),
    ...pickBest("DEF", 4),
    ...pickBest("MID", 4),
    ...pickBest("FWD", 2),
  ];

  return (
    <div>
      <PageHero
        kicker="The Eternal Record"
        title={<><span className="gold-gradient">THE ARCHIVE</span></>}
        subtitle="Every champion, every fixture, every legend that ever played."
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
          <MiniStat label="Seasons" value={d.seasons.filter((s: any) => s.champion_manager_id).length} />
          <MiniStat label="Managers" value={d.managers.length} />
          <MiniStat label="Fixtures" value={d.fixtures.length} />
          <MiniStat label="Total Points" value={totalPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
        </div>
      </PageHero>

      {/* All Time Table */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle kicker="Eternal Standings" title="All-Time Table" />
        <div className="premium-card rounded-lg overflow-x-auto mt-8">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Manager</th>
                <th className="p-3 text-center">Sea</th>
                <th className="p-3 text-center">W</th>
                <th className="p-3 text-center">D</th>
                <th className="p-3 text-center">L</th>
                <th className="p-3 text-right">PF</th>
                <th className="p-3 text-right">Pts</th>
                <th className="p-3 text-right">Win%</th>
                <th className="p-3 text-center">Titles</th>
              </tr>
            </thead>
            <tbody>
              {sortedAlltime.map((r: any, i: number) => {
                const m = mById(r.manager_id);
                const games = (r.wins ?? 0) + (r.draws ?? 0) + (r.losses ?? 0);
                const wp = games ? ((r.wins / games) * 100).toFixed(1) : "0";
                const titles = titleCounts[r.manager_id] ?? 0;
                return (
                  <tr key={r.manager_id} className="border-t border-border/40 hover:bg-gold/5">
                    <td className="p-3 font-display text-lg text-gold">{i + 1}</td>
                    <td className="p-3 capitalize">
                      <Link to="/team/$managerId" params={{ managerId: r.manager_id }} className="hover:text-gold flex items-center gap-2">
                        {m?.name ?? r.manager_name}
                        {titles > 0 && <Trophy className="w-3.5 h-3.5 text-gold" />}
                      </Link>
                    </td>
                    <td className="text-center p-3">{r.seasons_played ?? r.seasons ?? "—"}</td>
                    <td className="text-center p-3">{r.wins}</td>
                    <td className="text-center p-3">{r.draws}</td>
                    <td className="text-center p-3">{r.losses}</td>
                    <td className="text-right p-3">{Number(r.points_for ?? 0).toFixed(0)}</td>
                    <td className="text-right p-3 font-display text-gold text-base">{r.total_points}</td>
                    <td className="text-right p-3">{wp}%</td>
                    <td className="text-center p-3">{titles > 0 ? <span className="text-gold font-display">{titles}</span> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Hall of Champions */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="Roll of Honour" title="Hall of Champions" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {d.seasons.filter((s: any) => s.champion_manager_id).map((s: any) => {
            const champ = mById(s.champion_manager_id);
            const champStanding = d.standings.find((st: any) => st.season_id === s.id && st.manager_id === s.champion_manager_id);
            return (
              <Link key={s.id} to="/season/$seasonId" params={{ seasonId: s.id }} className="premium-card rounded-lg p-8 hover:border-gold transition group">
                <Crown className="w-10 h-10 text-gold mb-4" strokeWidth={1.2} />
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.name}</div>
                <div className="font-display text-3xl mt-2 capitalize">{champ?.name}</div>
                <div className="text-sm text-muted-foreground capitalize">{champ?.team_name}</div>
                {champStanding && <div className="mt-4 text-xs uppercase tracking-wider text-gold">{champStanding.total_points} PTS · {champStanding.wins}W</div>}
              </Link>
            );
          })}
        </div>
      </section>

      {/* H2H Lookup */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="Rivalries" title="Head to Head" />
        <div className="grid sm:grid-cols-2 gap-4 mt-8 max-w-2xl">
          <select value={m1} onChange={(e) => setM1(e.target.value)} className="bg-input border border-border rounded px-4 py-3 capitalize">
            <option value="">Select Manager 1</option>
            {d.managers.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={m2} onChange={(e) => setM2(e.target.value)} className="bg-input border border-border rounded px-4 py-3 capitalize">
            <option value="">Select Manager 2</option>
            {d.managers.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>

        {h2hPair && (() => {
          const aIsM1 = h2hPair.manager_a_id === m1;
          const wA = aIsM1 ? h2hPair.manager_a_wins : h2hPair.manager_b_wins;
          const wB = aIsM1 ? h2hPair.manager_b_wins : h2hPair.manager_a_wins;
          const total = (wA ?? 0) + (wB ?? 0) + (h2hPair.draws ?? 0);
          const pctA = total ? (wA / total) * 100 : 50;
          return (
            <div className="premium-card rounded-lg p-8 mt-8">
              <div className="flex items-center justify-between mb-4 capitalize">
                <div className="font-display text-2xl">{mById(m1)?.name}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">vs</div>
                <div className="font-display text-2xl text-right">{mById(m2)?.name}</div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
                <div className="bg-gold" style={{ width: `${pctA}%` }} />
                <div className="bg-muted" style={{ width: `${total ? (h2hPair.draws / total) * 100 : 0}%` }} />
                <div className="bg-destructive/70 ml-auto" style={{ width: `${100 - pctA - (total ? (h2hPair.draws / total) * 100 : 0)}%` }} />
              </div>
              <div className="grid grid-cols-3 text-center mt-6 text-sm">
                <div><div className="font-display text-3xl text-gold">{wA ?? 0}</div><div className="text-xs text-muted-foreground uppercase tracking-wider">Wins</div></div>
                <div><div className="font-display text-3xl">{h2hPair.draws ?? 0}</div><div className="text-xs text-muted-foreground uppercase tracking-wider">Draws</div></div>
                <div><div className="font-display text-3xl">{wB ?? 0}</div><div className="text-xs text-muted-foreground uppercase tracking-wider">Wins</div></div>
              </div>
              <div className="mt-8 space-y-2">
                {pairFixtures.map((f: any) => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-card/40 rounded text-sm">
                    <span className="text-xs text-muted-foreground">{sById(f.season_id)?.name} GW{f.gameweek}</span>
                    <span className="capitalize">{mById(f.home_manager_id)?.name}</span>
                    <span className="font-display text-lg">{f.home_score} - {f.away_score}</span>
                    <span className="capitalize">{mById(f.away_manager_id)?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Records Board */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="The Greats" title="Records Board" />

        <RecordGroup title="Match Records">
          <StatCard label="Highest Single Score" value={highest ? Math.max(highest.home_score, highest.away_score) : 0} sub={highest ? `${mById(highest.home_score >= highest.away_score ? highest.home_manager_id : highest.away_manager_id)?.name} · ${sById(highest.season_id)?.name} GW${highest.gameweek}` : ""} icon={<Flame className="w-5 h-5" />} />
          <StatCard label="Biggest Margin" value={biggestMargin?.margin ?? 0} sub={biggestMargin ? `${sById(biggestMargin.season_id)?.name} GW${biggestMargin.gameweek}` : ""} icon={<Target className="w-5 h-5" />} />
          <StatCard label="Highest Combined" value={highestCombined ? (highestCombined.home_score + highestCombined.away_score) : 0} sub={highestCombined ? `${sById(highestCombined.season_id)?.name} GW${highestCombined.gameweek}` : ""} icon={<Flame className="w-5 h-5" />} />
          <StatCard label="Lowest Winning Score" value={lowestWin ? Math.max(lowestWin.home_score, lowestWin.away_score) : 0} sub={lowestWin ? `${sById(lowestWin.season_id)?.name} GW${lowestWin.gameweek}` : ""} icon={<Shield className="w-5 h-5" />} />
        </RecordGroup>

        <RecordGroup title="Season Records">
          <StatCard label="Most Wins (Season)" value={mostWinsSeason?.wins ?? 0} sub={mostWinsSeason ? `${mById(mostWinsSeason.manager_id)?.name} · ${sById(mostWinsSeason.season_id)?.name}` : ""} icon={<Trophy className="w-5 h-5" />} />
          <StatCard label="Most Points (Season)" value={mostPointsSeason?.total_points ?? 0} sub={mostPointsSeason ? `${mById(mostPointsSeason.manager_id)?.name} · ${sById(mostPointsSeason.season_id)?.name}` : ""} icon={<Crown className="w-5 h-5" />} />
          <StatCard label="Most PF (Season)" value={Number(mostPFSeason?.points_for ?? 0).toFixed(0)} sub={mostPFSeason ? `${mById(mostPFSeason.manager_id)?.name} · ${sById(mostPFSeason.season_id)?.name}` : ""} icon={<Flame className="w-5 h-5" />} />
        </RecordGroup>

        <RecordGroup title="Streak Records">
          <StatCard label="Longest Win Streak" value={longestWin?.streak_length ?? 0} sub={longestWin ? `${mById(longestWin.manager_id)?.name}` : ""} icon={<Zap className="w-5 h-5" />} />
          <StatCard label="Longest Losing Streak" value={longestLoss?.streak_length ?? 0} sub={longestLoss ? `${mById(longestLoss.manager_id)?.name}` : ""} icon={<Target className="w-5 h-5" />} />
        </RecordGroup>
      </section>

      {/* All Time XI */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="The Immortals" title="All-Time XI" />
        <div className="mt-8">
          <FormationPitch players={allTimeXI} getManagerName={(id) => mById(id)?.name ?? ""} />
        </div>
      </section>

      {/* Top Players */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="Player Archive" title="Top 20 All-Time Scorers" />
        <div className="premium-card rounded-lg overflow-x-auto mt-8">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Player</th>
                <th className="p-3 text-center">Pos</th>
                <th className="p-3 text-left">Team / Manager</th>
                <th className="p-3 text-center">Sea</th>
                <th className="p-3 text-center">GP</th>
                <th className="p-3 text-right">Pts</th>
                <th className="p-3 text-right">PPG</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((p: any, i: number) => (
                <tr key={`${p.player_id ?? p.player_name}-${p.manager_id ?? i}`} className="border-t border-border/40 hover:bg-gold/5">
                  <td className="p-3 font-display text-gold">{i + 1}</td>
                  <td className="p-3 font-medium">{p.player_name ?? p.name}</td>
                  <td className="p-3 text-center text-xs uppercase tracking-wider text-muted-foreground">{p.position}</td>
                  <td className="p-3 capitalize text-muted-foreground">{mById(p.manager_id)?.name ?? "—"}</td>
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
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: any }) {
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
      <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
    </div>
  );
}

function RecordGroup({ title, children }: { title: string; children: any }) {
  return (
    <div className="mt-12">
      <h3 className="font-display text-2xl text-muted-foreground mb-4 uppercase tracking-wider">{title}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

function Skel() {
  return <div className="max-w-7xl mx-auto px-4 py-20 space-y-4"><Skeleton className="h-32" /><Skeleton className="h-96" /></div>;
}
