import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
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
    <div className="grid sm:grid-cols-3 gap-3">
      {champion && (
        <Link
          to="/world-cup/$managerId"
          params={{ managerId: String(champion.manager_id) }}
          className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-gold/70 transition-all hover:-translate-y-0.5 p-3.5 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${champion.primary_color}30 0%, ${champion.primary_color}08 50%, rgba(10,17,48,0.85) 100%)` }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition" style={{ background: champion.primary_color }} />
          {getBranding(champion.manager_id)?.badge ? (
            <img src={getBranding(champion.manager_id)!.badge!} alt="" className="relative w-10 h-10 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
          ) : (
            <Trophy className="relative w-8 h-8 text-gold shrink-0" />
          )}
          <div className="relative min-w-0 flex-1">
            <div className="text-[9px] uppercase tracking-[0.25em] text-gold/90 font-bold mb-0.5">Champion</div>
            <div className="font-display text-base leading-tight text-white truncate">{champion.nation_name}</div>
            <div className="text-xs text-muted-foreground">{champion.points} pts</div>
          </div>
        </Link>
      )}

      {topPlayer && (
        <div
          className="relative overflow-hidden rounded-lg border border-gold/40 p-3.5 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.05) 50%, rgba(10,17,48,0.85) 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 bg-gold/40" />
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gold/50">
            {COUNTRY_ISO[topPlayer.country] ? (
              <img
                src={`https://flagcdn.com/w80/${COUNTRY_ISO[topPlayer.country]}.png`}
                alt={topPlayer.country}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">🏳️</div>
            )}
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="text-[9px] uppercase tracking-[0.25em] text-gold/90 font-bold mb-0.5">Player of the Tournament</div>
            <div className="font-display text-base leading-tight text-white truncate">{topPlayer.player_name}</div>
            <div className="text-xs text-muted-foreground truncate">{topPlayer.total_points} pts · {topPlayer.manager_name}</div>
          </div>
        </div>
      )}

      {woodenSpoon && (
        <Link
          to="/world-cup/$managerId"
          params={{ managerId: String(woodenSpoon.manager_id) }}
          className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-red-400/60 transition-all hover:-translate-y-0.5 p-3.5 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(120,30,30,0.35) 0%, rgba(120,30,30,0.08) 50%, rgba(10,17,48,0.85) 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition bg-red-500/40" />
          {getBranding(woodenSpoon.manager_id)?.badge ? (
            <img src={getBranding(woodenSpoon.manager_id)!.badge!} alt="" className="relative w-10 h-10 object-contain shrink-0 opacity-80 grayscale-[0.3]" />
          ) : (
            <span className="relative text-2xl shrink-0" role="img" aria-label="wooden spoon">🥄</span>
          )}
          <div className="relative min-w-0 flex-1">
            <div className="text-[9px] uppercase tracking-[0.25em] text-red-300/90 font-bold mb-0.5">Wooden Spoon</div>
            <div className="font-display text-base leading-tight text-white truncate">{woodenSpoon.nation_name}</div>
            <div className="text-xs text-muted-foreground">{woodenSpoon.points} pts</div>
          </div>
        </Link>
      )}
    </div>
  );
}
