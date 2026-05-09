import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/StatCard";
import { FormationPitch } from "@/components/FormationPitch";
import { getBranding } from "@/lib/managerBranding";
import { Flame, Trophy, Crown, Target, Zap, Shield, Award, TrendingUp, TrendingDown, Star } from "lucide-react";
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

function RecordsPage() {
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("seasons").select("*").order("year_start"),
      supabase.from("managers").select("*"),
      supabase.from("alltime_table").select("*"),
      supabase.from("fixture_records").select("*"),
      supabase.from("win_streaks").select("*"),
      supabase.from("season_standings").select("*"),
      supabase.from("player_team_alltime").select("*"),
    ]).then(([s, m, a, f, st, sd, p]) => setD({
      seasons: s.data ?? [], managers: m.data ?? [], alltime: a.data ?? [],
      fixtures: f.data ?? [], streaks: st.data ?? [], standings: sd.data ?? [], players: p.data ?? [],
    }));
  }, []);

  if (!d) return <div className="max-w-7xl mx-auto px-4 py-20"><Skeleton className="h-96" /></div>;

  const mById = (id: string) => d.managers.find((m: any) => m.id === id);
  const sById = (id: string) => d.seasons.find((s: any) => s.id === id);

  // Match Records
  const completedFx = d.fixtures.filter((f: any) => f.home_score != null);
  const highest = [...completedFx].sort((a, b) => Math.max(b.home_score, b.away_score) - Math.max(a.home_score, a.away_score))[0];
  const biggestMargin = [...completedFx].sort((a, b) => (b.margin ?? 0) - (a.margin ?? 0))[0];
  const highestCombined = [...completedFx].sort((a, b) => ((b.home_score ?? 0) + (b.away_score ?? 0)) - ((a.home_score ?? 0) + (a.away_score ?? 0)))[0];
  const lowestWin = [...completedFx].filter(f => f.home_score !== f.away_score).sort((a, b) => Math.max(a.home_score, a.away_score) - Math.max(b.home_score, b.away_score))[0];
  const closest = [...completedFx].filter(f => f.margin > 0).sort((a, b) => a.margin - b.margin)[0];
  const lowestCombined = [...completedFx].sort((a, b) => ((a.home_score ?? 0) + (a.away_score ?? 0)) - ((b.home_score ?? 0) + (b.away_score ?? 0)))[0];

  // Season Records
  const mostWinsSeason = [...d.standings].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0))[0];
  const mostPointsSeason = [...d.standings].sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0))[0];
  const mostPFSeason = [...d.standings].sort((a, b) => (b.points_for ?? 0) - (a.points_for ?? 0))[0];
  const fewestLossesSeason = [...d.standings].filter(s => (s.wins ?? 0) + (s.draws ?? 0) + (s.losses ?? 0) > 0).sort((a, b) => (a.losses ?? 0) - (b.losses ?? 0))[0];

  // Streak Records
  const winStreaks = d.streaks.filter((s: any) => (s.streak_type ?? s.type) === "win" || (s.streak_type ?? s.type) === "W");
  const longestWin = [...winStreaks].sort((a, b) => b.streak_length - a.streak_length)[0];
  const lossStreaks = d.streaks.filter((s: any) => (s.streak_type ?? s.type) === "loss" || (s.streak_type ?? s.type) === "L");
  const longestLoss = [...lossStreaks].sort((a, b) => b.streak_length - a.streak_length)[0];

  // Manager / All-time totals
  const sortedAlltime = [...d.alltime].sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0));
  const mostTitlesEntry = (() => {
    const tc: Record<string, number> = {};
    d.seasons.filter((s: any) => s.champion_manager_id).forEach((s: any) => { tc[s.champion_manager_id] = (tc[s.champion_manager_id] ?? 0) + 1; });
    const top = Object.entries(tc).sort((a, b) => b[1] - a[1])[0];
    return top ? { manager_id: top[0], titles: top[1] } : null;
  })();
  const mostWinsAllTime = [...d.alltime].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0))[0];
  const bestWinPct = [...d.alltime].map((r: any) => {
    const g = (r.wins ?? 0) + (r.draws ?? 0) + (r.losses ?? 0);
    return { ...r, _wp: g ? r.wins / g : 0, _g: g };
  }).filter(r => r._g >= 20).sort((a, b) => b._wp - a._wp)[0];

  // All-time XI
  const sortedPlayers = [...d.players].sort((a, b) => (b.total_fantasy_points ?? 0) - (a.total_fantasy_points ?? 0));
  const seen = new Set<string>();
  const pickBest = (pos: string, n: number) => {
    const arr: any[] = [];
    for (const p of sortedPlayers) {
      if (p.position !== pos) continue;
      const pid = p.player_id ?? p.player_name;
      if (seen.has(pid)) continue;
      arr.push(p); seen.add(pid);
      if (arr.length === n) break;
    }
    return arr;
  };
  const allTimeXI = [...pickBest("GK", 1), ...pickBest("DEF", 4), ...pickBest("MID", 4), ...pickBest("FWD", 2)];
  const topPlayer = sortedPlayers[0];

  const fxLabel = (f: any) => f ? `${sById(f.season_id)?.name} · GW${f.gameweek}` : "";
  const fxWinner = (f: any) => f ? mById(f.home_score >= f.away_score ? f.home_manager_id : f.away_manager_id) : null;
  const fxLoser = (f: any) => f ? mById(f.home_score < f.away_score ? f.home_manager_id : f.away_manager_id) : null;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 ucl-stars opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl pointer-events-none opacity-50"
          style={{ background: "radial-gradient(circle, hsl(15 85% 55%) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex-shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ border: "2px solid hsl(15 85% 55% / 0.4)" }} />
              <div className="absolute inset-4 rounded-full" style={{ border: "1px solid hsl(15 85% 55% / 0.25)" }} />
              <div className="absolute inset-0 rounded-full"
                style={{ background: "conic-gradient(from 90deg, hsl(15 85% 55%) 0%, transparent 25%, hsl(15 70% 35%) 50%, transparent 75%, hsl(15 85% 55%) 100%)", opacity: 0.25 }} />
              <img src={logo} alt="" className="relative w-full h-full object-contain p-6 drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
                style={{ filter: "hue-rotate(155deg) saturate(1.05)" }} />
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

      {/* DYNASTIES — featured panel */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle kicker="Dynasties" title="Manager Greats" />
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {mostTitlesEntry && (
            <FeatureRecord
              icon={<Crown />}
              tint="hsl(45 90% 55%)"
              eyebrow="Most Titles"
              value={`${mostTitlesEntry.titles}`}
              valueSub="champion seasons"
              manager={mById(mostTitlesEntry.manager_id)}
            />
          )}
          {mostWinsAllTime && (
            <FeatureRecord
              icon={<Trophy />}
              tint="hsl(195 80% 55%)"
              eyebrow="Most Wins (All-Time)"
              value={`${mostWinsAllTime.wins}`}
              valueSub="career victories"
              manager={mById(mostWinsAllTime.manager_id)}
            />
          )}
          {bestWinPct && (
            <FeatureRecord
              icon={<TrendingUp />}
              tint="hsl(145 70% 50%)"
              eyebrow="Best Win Rate"
              value={`${(bestWinPct._wp * 100).toFixed(1)}%`}
              valueSub={`${bestWinPct.wins}W of ${bestWinPct._g}`}
              manager={mById(bestWinPct.manager_id)}
            />
          )}
        </div>

        {/* All-time leaders strip */}
        <div className="premium-card rounded-lg mt-6 p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">All-Time Points Leaders</div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {sortedAlltime.slice(0, 5).map((r, i) => {
              const m = mById(r.manager_id);
              const b = getBranding(r.manager_id);
              const tint = b?.primary ?? "#d4af37";
              return (
                <Link key={r.manager_id} to="/team/$managerId" params={{ managerId: r.manager_id }}
                  className="relative rounded-lg p-4 border border-white/10 hover:border-white/40 transition group"
                  style={{ background: `linear-gradient(135deg, ${tint}30 0%, ${tint}05 100%)` }}>
                  <div className="text-[10px] uppercase tracking-widest text-gold">#{i + 1}</div>
                  <div className="font-display text-2xl text-white mt-1">{r.total_points}</div>
                  <div className="text-[11px] uppercase tracking-wider text-white/70 capitalize mt-1 truncate">{m?.name}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* MATCH RECORDS */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="Single Match" title="Match Records" />
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <MatchRecordCard
            icon={<Flame />} tint="hsl(15 85% 55%)" eyebrow="Highest Single Score"
            value={highest ? Math.max(highest.home_score, highest.away_score) : 0}
            holder={fxWinner(highest)} sub={fxLabel(highest)}
          />
          <MatchRecordCard
            icon={<Target />} tint="hsl(0 80% 55%)" eyebrow="Biggest Margin"
            value={biggestMargin?.margin ?? 0}
            holder={fxWinner(biggestMargin)} loser={fxLoser(biggestMargin)} sub={fxLabel(biggestMargin)}
            showVs
          />
          <MatchRecordCard
            icon={<Zap />} tint="hsl(285 70% 60%)" eyebrow="Highest Combined"
            value={highestCombined ? (highestCombined.home_score + highestCombined.away_score) : 0}
            sub={highestCombined ? `${mById(highestCombined.home_manager_id)?.name} ${highestCombined.home_score} – ${highestCombined.away_score} ${mById(highestCombined.away_manager_id)?.name} · ${fxLabel(highestCombined)}` : ""}
          />
          <MatchRecordCard
            icon={<Shield />} tint="hsl(220 70% 55%)" eyebrow="Lowest Winning Score"
            value={lowestWin ? Math.max(lowestWin.home_score, lowestWin.away_score) : 0}
            holder={fxWinner(lowestWin)} sub={fxLabel(lowestWin)}
          />
          <MatchRecordCard
            icon={<Award />} tint="hsl(50 90% 55%)" eyebrow="Closest Margin"
            value={closest?.margin ?? 0}
            sub={closest ? `${mById(closest.home_manager_id)?.name} ${closest.home_score} – ${closest.away_score} ${mById(closest.away_manager_id)?.name} · ${fxLabel(closest)}` : ""}
          />
          <MatchRecordCard
            icon={<TrendingDown />} tint="hsl(200 30% 50%)" eyebrow="Lowest Combined"
            value={lowestCombined ? (lowestCombined.home_score + lowestCombined.away_score) : 0}
            sub={lowestCombined ? `${mById(lowestCombined.home_manager_id)?.name} ${lowestCombined.home_score} – ${lowestCombined.away_score} ${mById(lowestCombined.away_manager_id)?.name} · ${fxLabel(lowestCombined)}` : ""}
          />
        </div>
      </section>

      {/* SEASON RECORDS */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="Single Season" title="Season Records" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <SeasonRecordCard icon={<Trophy />} tint="hsl(45 90% 55%)" eyebrow="Most Wins" value={mostWinsSeason?.wins ?? 0}
            manager={mById(mostWinsSeason?.manager_id)} season={sById(mostWinsSeason?.season_id)} />
          <SeasonRecordCard icon={<Crown />} tint="hsl(285 70% 60%)" eyebrow="Most League Points" value={mostPointsSeason?.total_points ?? 0}
            manager={mById(mostPointsSeason?.manager_id)} season={sById(mostPointsSeason?.season_id)} />
          <SeasonRecordCard icon={<Flame />} tint="hsl(15 85% 55%)" eyebrow="Most Points For" value={Number(mostPFSeason?.points_for ?? 0).toFixed(0)}
            manager={mById(mostPFSeason?.manager_id)} season={sById(mostPFSeason?.season_id)} />
          <SeasonRecordCard icon={<Shield />} tint="hsl(195 80% 55%)" eyebrow="Fewest Losses" value={fewestLossesSeason?.losses ?? 0}
            manager={mById(fewestLossesSeason?.manager_id)} season={sById(fewestLossesSeason?.season_id)} />
        </div>
      </section>

      {/* STREAKS */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="Form" title="Streak Records" />
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <FeatureRecord icon={<Zap />} tint="hsl(45 90% 55%)" eyebrow="Longest Win Streak"
            value={longestWin?.streak_length ?? 0} valueSub="consecutive wins"
            manager={mById(longestWin?.manager_id)} />
          <FeatureRecord icon={<TrendingDown />} tint="hsl(0 70% 50%)" eyebrow="Longest Losing Streak"
            value={longestLoss?.streak_length ?? 0} valueSub="consecutive losses"
            manager={mById(longestLoss?.manager_id)} />
        </div>
      </section>

      {/* HALL OF CHAMPIONS */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="Roll of Honour" title="Hall of Champions" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {d.seasons.filter((s: any) => s.champion_manager_id).map((s: any) => {
            const champ = mById(s.champion_manager_id);
            const champStanding = d.standings.find((st: any) => st.season_id === s.id && st.manager_id === s.champion_manager_id);
            const b = getBranding(s.champion_manager_id);
            const tint = b?.primary ?? "#d4af37";
            return (
              <Link key={s.id} to="/season/$seasonId" params={{ seasonId: s.id }}
                className="premium-card rounded-lg p-8 hover:border-gold transition group relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition"
                  style={{ background: tint }} />
                <Crown className="w-10 h-10 text-gold mb-4 relative" strokeWidth={1.2} />
                <div className="text-xs uppercase tracking-widest text-muted-foreground relative">{s.name}</div>
                <div className="font-display text-3xl mt-2 capitalize relative">{champ?.name}</div>
                <div className="text-sm text-muted-foreground capitalize relative">{champ?.team_name}</div>
                {champStanding && <div className="mt-4 text-xs uppercase tracking-wider text-gold relative">{champStanding.total_points} PTS · {champStanding.wins}W</div>}
              </Link>
            );
          })}
        </div>
      </section>

      {/* IMMORTALS */}
      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-border/50">
        <SectionTitle kicker="The Immortals" title="All-Time XI" />
        {topPlayer && (
          <div className="premium-card rounded-lg p-6 mt-8 flex items-center gap-4 max-w-xl">
            <Star className="w-8 h-8 text-gold flex-shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-widest text-gold">All-Time Top Scorer</div>
              <div className="font-display text-2xl mt-1">{topPlayer.player_name ?? topPlayer.name}</div>
              <div className="text-sm text-muted-foreground">{Number(topPlayer.total_fantasy_points ?? 0).toFixed(0)} fantasy points</div>
            </div>
          </div>
        )}
        <div className="mt-6">
          <FormationPitch players={allTimeXI} getManagerName={(id: string) => mById(id)?.name ?? ""} />
        </div>
      </section>
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

function FeatureRecord({ icon, tint, eyebrow, value, valueSub, manager }: any) {
  const b = manager ? getBranding(manager.id) : null;
  return (
    <div className="relative rounded-xl p-6 overflow-hidden border border-white/10"
      style={{ background: `linear-gradient(135deg, ${tint}40 0%, ${tint}10 50%, rgba(10,17,48,0.6) 100%)` }}>
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-40" style={{ background: tint }} />
      <div className="relative flex items-start justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">{eyebrow}</div>
        <span style={{ color: tint }}>{icon}</span>
      </div>
      <div className="relative font-display text-5xl md:text-6xl text-white leading-none">{value}</div>
      {valueSub && <div className="relative text-xs uppercase tracking-wider text-white/60 mt-2">{valueSub}</div>}
      {manager && (
        <Link to="/team/$managerId" params={{ managerId: manager.id }} className="relative flex items-center gap-2 mt-4 pt-4 border-t border-white/10 hover:opacity-80 transition">
          {b?.badge ? <img src={b.badge} alt="" className="w-8 h-8 object-contain" /> :
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: tint }}>{manager.name?.charAt(0).toUpperCase()}</div>}
          <span className="text-sm font-bold capitalize text-white">{manager.name}</span>
        </Link>
      )}
    </div>
  );
}

function MatchRecordCard({ icon, tint, eyebrow, value, holder, loser, sub, showVs }: any) {
  const bH = holder ? getBranding(holder.id) : null;
  const bL = loser ? getBranding(loser.id) : null;
  return (
    <div className="relative rounded-xl p-6 overflow-hidden border border-white/10"
      style={{ background: `linear-gradient(120deg, ${tint}38 0%, ${tint}08 60%, rgba(10,17,48,0.6) 100%)` }}>
      <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full blur-3xl opacity-40" style={{ background: tint }} />
      <div className="relative flex items-center gap-3 mb-3">
        <span className="p-2 rounded-md" style={{ background: `${tint}25`, color: tint }}>{icon}</span>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/80 font-bold">{eyebrow}</div>
      </div>
      <div className="relative flex items-baseline gap-4 mt-2">
        <div className="font-display text-6xl md:text-7xl leading-none" style={{ color: tint }}>{value}</div>
        {showVs && holder && loser && (
          <div className="flex items-center gap-2 text-sm text-white/80 capitalize">
            {bH?.badge && <img src={bH.badge} alt="" className="w-6 h-6 object-contain" />}
            <span className="font-bold">{holder.name}</span>
            <span className="text-white/40 text-xs">beat</span>
            {bL?.badge && <img src={bL.badge} alt="" className="w-6 h-6 object-contain" />}
            <span>{loser.name}</span>
          </div>
        )}
        {!showVs && holder && (
          <Link to="/team/$managerId" params={{ managerId: holder.id }} className="flex items-center gap-2 text-sm text-white/85 capitalize hover:text-white transition">
            {bH?.badge && <img src={bH.badge} alt="" className="w-6 h-6 object-contain" />}
            <span className="font-bold">{holder.name}</span>
          </Link>
        )}
      </div>
      {sub && <div className="relative text-[11px] uppercase tracking-wider text-white/55 mt-3">{sub}</div>}
    </div>
  );
}

function SeasonRecordCard({ icon, tint, eyebrow, value, manager, season }: any) {
  const b = manager ? getBranding(manager.id) : null;
  return (
    <div className="relative rounded-xl p-5 overflow-hidden border border-white/10"
      style={{ background: `linear-gradient(135deg, ${tint}38 0%, ${tint}08 100%)` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold">{eyebrow}</div>
        <span style={{ color: tint }}>{icon}</span>
      </div>
      <div className="font-display text-4xl md:text-5xl text-white leading-none">{value}</div>
      {manager && (
        <div className="flex items-center gap-2 mt-4">
          {b?.badge ? <img src={b.badge} alt="" className="w-6 h-6 object-contain" /> :
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: tint }}>{manager.name?.charAt(0).toUpperCase()}</div>}
          <span className="text-xs font-bold capitalize text-white truncate">{manager.name}</span>
        </div>
      )}
      {season && <div className="text-[10px] uppercase tracking-widest text-white/50 mt-1">{season.name}</div>}
    </div>
  );
}
