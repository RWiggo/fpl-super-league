import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getBranding } from "@/lib/managerBranding";
import { fetchWorldCupStandings, type WcStandingsRow } from "@/lib/worldCup";
import { COUNTRY_ISO } from "@/lib/flags";

type TopPlayer = {
  player_name: string;
  country: string;
  manager_name: string;
  total_points: number;
};

export function WorldCupCompletedSummary() {
  const [standings, setStandings] = useState<WcStandingsRow[] | null>(null);
  const [topPlayer, setTopPlayer] = useState<TopPlayer | null>(null);

  useEffect(() => {
    (async () => {
      const [rows, lbRes] = await Promise.all([
        fetchWorldCupStandings(),
        supabase.from("wc_player_leaderboard").select("*").order("total_points", { ascending: false }).limit(1),
      ]);
      setStandings(rows);
      if (lbRes.data && lbRes.data.length > 0) setTopPlayer(lbRes.data[0] as TopPlayer);
    })();
  }, []);

  if (!standings) {
    return (
      <div className="rounded-xl p-6 animate-pulse bg-white/5 border border-white/10">
        <div className="h-6 w-40 bg-white/10 rounded mb-3" />
        <div className="h-32 bg-white/5 rounded" />
      </div>
    );
  }

  const champion = standings[0];
  const woodenSpoon = standings[standings.length - 1];

  return (
    <div className="grid sm:grid-cols-3 gap-5">
      {champion && (
        <Link
          to="/world-cup/$managerId"
          params={{ managerId: String(champion.manager_id) }}
          className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-gold/70 transition-all hover:-translate-y-1.5 p-6 min-h-[180px] flex flex-col"
          style={{ background: `linear-gradient(135deg, ${champion.primary_color}30 0%, ${champion.primary_color}08 50%, rgba(10,17,48,0.85) 100%)` }}
        >
          <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition" style={{ background: champion.primary_color }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-gold" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold/90 font-bold">Champion</span>
            </div>
            {getBranding(champion.manager_id)?.badge && (
              <img src={getBranding(champion.manager_id)!.badge!} alt="" className="w-14 h-14 object-contain mb-3 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
            )}
            <div className="font-display text-2xl mb-1 text-white truncate">{champion.nation_name}</div>
            <div className="text-sm text-muted-foreground">{champion.points} pts</div>
          </div>
        </Link>
      )}

      {topPlayer && (
        <div
          className="relative overflow-hidden rounded-xl border border-gold/40 p-6 min-h-[180px] flex flex-col"
          style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.05) 50%, rgba(10,17,48,0.85) 100%)" }}
        >
          <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full blur-3xl opacity-40 bg-gold/40" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-gold" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold/90 font-bold">Player of the Tournament</span>
            </div>
            <div className="w-14 h-14 rounded-full overflow-hidden mb-3 border border-gold/50">
              {COUNTRY_ISO[topPlayer.country] ? (
                <img
                  src={`https://flagcdn.com/w80/${COUNTRY_ISO[topPlayer.country]}.png`}
                  alt={topPlayer.country}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🏳️</div>
              )}
            </div>
            <div className="font-display text-2xl mb-1 text-white truncate">{topPlayer.player_name}</div>
            <div className="text-sm text-muted-foreground truncate">{topPlayer.total_points} pts · {topPlayer.manager_name}</div>
          </div>
        </div>
      )}

      {woodenSpoon && (
        <Link
          to="/world-cup/$managerId"
          params={{ managerId: String(woodenSpoon.manager_id) }}
          className="group relative overflow-hidden rounded-xl border border-white/10 hover:border-red-400/60 transition-all hover:-translate-y-1.5 p-6 min-h-[180px] flex flex-col"
          style={{ background: "linear-gradient(135deg, rgba(120,30,30,0.35) 0%, rgba(120,30,30,0.08) 50%, rgba(10,17,48,0.85) 100%)" }}
        >
          <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition bg-red-500/40" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg" role="img" aria-label="wooden spoon">🥄</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-red-300/90 font-bold">Wooden Spoon</span>
            </div>
            {getBranding(woodenSpoon.manager_id)?.badge && (
              <img src={getBranding(woodenSpoon.manager_id)!.badge!} alt="" className="w-14 h-14 object-contain mb-3 opacity-80 grayscale-[0.3]" />
            )}
            <div className="font-display text-2xl mb-1 text-white truncate">{woodenSpoon.nation_name}</div>
            <div className="text-sm text-muted-foreground">{woodenSpoon.points} pts</div>
          </div>
        </Link>
      )}
    </div>
  );
}
