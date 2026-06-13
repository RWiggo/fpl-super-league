import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { getBranding } from "@/lib/managerBranding";
import { WC_PARTICIPANT_FALLBACK, WC_THEME, type WcParticipant } from "@/lib/worldCup";

type Row = WcParticipant & { played: number; points: number };

export function WorldCupLiveTable({ compact = false }: { compact?: boolean }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      // Calculate from the scoring table directly; the standings view currently
      // reports every drafted squad member as "used" even when no scores exist.
      const [squadsRes, scoresRes] = await Promise.all([
        supabase.from("wc_squads").select("manager_id, player_id"),
        supabase.from("wc_player_scores").select("player_id, fpl_points"),
      ]);
      const playerToMgr = new Map<string, number>();
      for (const s of (squadsRes.data ?? []) as Array<{ manager_id: number; player_id: string }>) {
        playerToMgr.set(s.player_id, s.manager_id);
      }
      const pointsByMgr: Record<number, { points: number; played: number }> = {};
      for (const s of (scoresRes.data ?? []) as Array<{ player_id: string; fpl_points: number | null }>) {
        const mgr = playerToMgr.get(s.player_id);
        if (mgr == null) continue;
        const current = pointsByMgr[mgr] ?? { points: 0, played: 0 };
        current.points += Number(s.fpl_points ?? 0);
        current.played += 1;
        pointsByMgr[mgr] = current;
      }
      const merged = WC_PARTICIPANT_FALLBACK.map((p) => ({
        ...p,
        played: pointsByMgr[p.manager_id]?.played ?? 0,
        points: pointsByMgr[p.manager_id]?.points ?? 0,
      }));
      merged.sort((a, b) => b.points - a.points || a.nation_name.localeCompare(b.nation_name));
      setRows(merged);
    })();
  }, []);

  if (!rows) {
    return (
      <div className="rounded-xl p-6 animate-pulse" style={{ background: `${WC_THEME.maroon}22` }}>
        <div className="h-6 w-40 bg-white/10 rounded mb-3" />
        <div className="h-72 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{
        background: `linear-gradient(160deg, ${WC_THEME.maroonDeep} 0%, ${WC_THEME.maroonInk} 100%)`,
        borderColor: `${WC_THEME.gold}55`,
        boxShadow: `0 18px 60px -20px ${WC_THEME.maroonInk}, 0 0 0 1px ${WC_THEME.gold}33`,
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: `${WC_THEME.maroon}55`, borderBottom: `1px solid ${WC_THEME.gold}33` }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: WC_THEME.gold }} />
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: WC_THEME.gold }}>Live Standings</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">FPL points</span>
      </div>

      <div
        className="hidden sm:grid grid-cols-[40px_1fr_60px_80px_80px] gap-2 px-4 py-2 text-[10px] uppercase tracking-widest"
        style={{ color: `${WC_THEME.gold}cc`, background: `${WC_THEME.maroon}22` }}
      >
        <div>#</div><div>Nation</div><div className="text-center">Used</div>
        <div className="text-right">PPG</div><div className="text-right">Pts</div>
      </div>
      <div
        className="sm:hidden grid grid-cols-[24px_1fr_36px_56px] gap-1.5 px-2 py-2 text-[9px] uppercase tracking-widest"
        style={{ color: `${WC_THEME.gold}cc`, background: `${WC_THEME.maroon}22` }}
      >
        <div>#</div><div>Nation</div><div className="text-center">Used</div><div className="text-right">Pts</div>
      </div>

      {rows.map((r, i) => {
        const pos = i + 1;
        const ppg = r.played > 0 ? r.points / r.played : 0;
        const isLead = pos === 1;
        return (
          <Link
            key={r.manager_id}
            to="/world-cup/$managerId"
            params={{ managerId: String(r.manager_id) }}
            className="block transition-colors"
            style={{ borderTop: `1px solid ${WC_THEME.gold}1f` }}
          >
            <div
              className="hidden sm:grid grid-cols-[40px_1fr_60px_80px_80px] gap-2 px-4 py-3 items-center hover:bg-white/[0.04]"
              style={isLead ? { background: `${WC_THEME.gold}15` } : {}}
            >
              <div
                className="font-display text-lg tabular-nums"
                style={{ color: isLead ? WC_THEME.goldBright : "#fff" }}
              >
                {pos}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl leading-none">{r.flag_emoji}</span>
                <span
                  className="inline-block w-1.5 h-7 rounded-sm shrink-0"
                  style={{ background: getBranding(String(r.manager_id))?.primary ?? r.primary_color }}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate text-white">{r.nation_name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Group {r.group_name}</div>
                </div>
              </div>
              <div className="text-center text-sm text-white/80 tabular-nums">{r.played}</div>
              <div className="text-right text-sm text-white/70 tabular-nums">{ppg.toFixed(1)}</div>
              <div className="text-right font-display text-xl tabular-nums" style={{ color: WC_THEME.goldBright }}>
                {r.points}
              </div>
            </div>

            <div
              className="sm:hidden grid grid-cols-[24px_1fr_36px_56px] gap-1.5 px-2 py-2.5 items-center hover:bg-white/[0.04]"
              style={isLead ? { background: `${WC_THEME.gold}15` } : {}}
            >
              <div className="font-display text-base tabular-nums" style={{ color: isLead ? WC_THEME.goldBright : "#fff" }}>
                {pos}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg leading-none">{r.flag_emoji}</span>
                <span className="inline-block w-1 h-5 rounded-sm shrink-0" style={{ background: getBranding(String(r.manager_id))?.primary ?? r.primary_color }} />
                <div className="text-[11px] font-semibold truncate text-white">{r.nation_name}</div>
              </div>
              <div className="text-center text-[11px] text-white/70 tabular-nums">{r.played}</div>
              <div className="text-right font-display text-base tabular-nums" style={{ color: WC_THEME.goldBright }}>
                {r.points}
              </div>
            </div>
          </Link>
        );
      })}

      {!compact && (
        <div
          className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-center"
          style={{ background: `${WC_THEME.maroon}33`, color: `${WC_THEME.gold}cc`, borderTop: `1px solid ${WC_THEME.gold}33` }}
        >
          Single league - no head to head - pure FPL points
        </div>
      )}
    </div>
  );
}
