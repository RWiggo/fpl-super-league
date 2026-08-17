import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { getBranding } from "@/lib/managerBranding";

const SEASON_5_ID = 5;

// Matches the SEASON_HUES palette on the season page: Season 5 (id 5) -> hue 285 (purple).
const SEASON_5_ACCENT = "hsl(285 80% 55%)";
const SEASON_5_ACCENT_DEEP = "hsl(285 70% 35%)";

type Row = {
  manager_id: number;
  team_name: string;
  name: string;
  position: number;
  wins: number;
  draws: number;
  losses: number;
  points_for: number;
  points_difference: number;
  total_points: number;
};

export function SeasonFiveLiveTableSection() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    (async () => {
      const [standingsRes, teamsRes] = await Promise.all([
        supabase.from("season_standings").select("*").eq("season_id", SEASON_5_ID),
        supabase.from("manager_season_teams").select("manager_id, team_name, managers(name)").eq("season_id", SEASON_5_ID),
      ]);
      const teamMap = new Map<number, { team_name: string; name: string }>();
      (teamsRes.data as any[] ?? []).forEach((t) => {
        teamMap.set(t.manager_id, { team_name: t.team_name, name: t.managers?.name ?? "" });
      });
      const merged = (standingsRes.data ?? [])
        .map((s: any) => {
          const t = teamMap.get(s.manager_id);
          return {
            manager_id: s.manager_id,
            team_name: t?.team_name ?? "",
            name: t?.name ?? "",
            position: s.position,
            wins: s.wins,
            draws: s.draws,
            losses: s.losses,
            points_for: s.points_for,
            points_difference: s.points_difference,
            total_points: s.total_points,
          } as Row;
        })
        .sort((a, b) => a.position - b.position || b.total_points - a.total_points || b.points_for - a.points_for);
      setRows(merged);
    })();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${SEASON_5_ACCENT}26 0%, ${SEASON_5_ACCENT_DEEP}22 35%, rgba(10,17,48,0.75) 70%)`, border: `1px solid ${SEASON_5_ACCENT}55` }}
      >
        <div className="p-5 sm:p-7 pb-5 sm:pb-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] mb-2 flex items-center gap-2" style={{ color: SEASON_5_ACCENT }}>
              <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: SEASON_5_ACCENT }} /> Season 5 &middot; Live
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl">2026/27 League Table</h2>
          </div>
          <Link
            to="/season/$seasonId"
            params={{ seasonId: String(SEASON_5_ID) }}
            className="text-xs sm:text-sm uppercase tracking-wider hover:underline"
            style={{ color: SEASON_5_ACCENT }}
          >
            Full Season Hub →
          </Link>
        </div>

        {rows && rows.length > 0 && (
          <div className="overflow-x-auto" style={{ borderTop: `1px solid ${SEASON_5_ACCENT}26` }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="text-left font-medium px-3 sm:px-6 py-3">#</th>
                  <th className="text-left font-medium px-2 py-3">Team</th>
                  <th className="text-center font-medium px-1.5 sm:px-2 py-3">W</th>
                  <th className="text-center font-medium px-1.5 sm:px-2 py-3 hidden sm:table-cell">D</th>
                  <th className="text-center font-medium px-1.5 sm:px-2 py-3 hidden sm:table-cell">L</th>
                  <th className="text-center font-medium px-2 py-3 hidden sm:table-cell">Diff</th>
                  <th className="text-center font-medium px-3 sm:px-6 py-3">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const badge = getBranding(r.manager_id)?.badge;
                  return (
                    <tr
                      key={r.manager_id}
                      className="border-t hover:bg-white/[0.03] transition-colors"
                      style={{ borderColor: `${SEASON_5_ACCENT}1a` }}
                    >
                      <td className="px-3 sm:px-6 py-3 font-display text-lg" style={{ color: i === 0 ? SEASON_5_ACCENT : undefined }}>{r.position}</td>
                      <td className="px-2 py-3 max-w-[110px] sm:max-w-none">
                        <Link to="/team/$managerId" params={{ managerId: String(r.manager_id) }} className="flex items-center gap-2 sm:gap-3 group">
                          {badge ? (
                            <img src={badge} alt="" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" />
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted/50 flex items-center justify-center text-xs shrink-0">{r.name?.[0]}</div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate group-hover:underline">{r.team_name}</div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate hidden sm:block">{r.name}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="text-center px-1.5 sm:px-2 py-3 text-green-400">{r.wins}</td>
                      <td className="text-center px-1.5 sm:px-2 py-3 text-yellow-400 hidden sm:table-cell">{r.draws}</td>
                      <td className="text-center px-1.5 sm:px-2 py-3 text-red-400 hidden sm:table-cell">{r.losses}</td>
                      <td className="text-center px-2 py-3 hidden sm:table-cell text-muted-foreground">{r.points_difference > 0 ? `+${r.points_difference}` : r.points_difference}</td>
                      <td className="text-center px-3 sm:px-6 py-3 font-display text-lg">{r.total_points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
