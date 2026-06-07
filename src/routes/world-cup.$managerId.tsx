import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WC_PARTICIPANT_FALLBACK, WC_THEME, type WcParticipant } from "@/lib/worldCup";
import { getPlClubBadge } from "@/lib/plClubBadges";

export const Route = createFileRoute("/world-cup/$managerId")({
  component: SquadPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-white">Nation not found.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-white">{error.message}</div>
  ),
});

type SquadPlayer = {
  id: string;
  manager_id: number;
  player_name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  club?: string;
  shirt_number?: number;
  is_captain?: boolean;
};

type PlayerStat = {
  manager_id: number;
  player_name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  club?: string;
  goals: number;
  assists: number;
  clean_sheets: number;
  fantasy_points: number;
  appearances: number;
};

const ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 } as const;

function SquadPage() {
  const { managerId } = Route.useParams();
  const id = Number(managerId);
  const [participant, setParticipant] = useState<WcParticipant | null>(null);
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [stats, setStats] = useState<PlayerStat[]>([]);

  useEffect(() => {
    (async () => {
      const [p, sq, st, gw] = await Promise.all([
        supabase.from("wc_participants").select("*").eq("manager_id", id).maybeSingle(),
        supabase.from("wc_squad").select("*").eq("manager_id", id),
        supabase.from("wc_player_stats").select("*").eq("manager_id", id),
        supabase.from("wc_manager_gameweek").select("points").eq("manager_id", id),
      ]);
      const fallback = WC_PARTICIPANT_FALLBACK.find((x) => x.manager_id === id);
      setParticipant((p.data as any) ?? fallback ?? null);
      setSquad((sq.data as any) ?? []);
      setStats((st.data as any) ?? []);
      void gw;
    })();
  }, [id]);

  if (participant === null) {
    return <div className="min-h-screen flex items-center justify-center text-white/70">Loading…</div>;
  }
  if (!participant) throw notFound();

  const statFor = (name: string) => stats.find((s) => s.player_name === name);
  const totalPoints = stats.reduce((a, b) => a + (b.fantasy_points ?? 0), 0);
  const totalGoals = stats.reduce((a, b) => a + (b.goals ?? 0), 0);
  const totalAssists = stats.reduce((a, b) => a + (b.assists ?? 0), 0);
  const totalCleans = stats.reduce((a, b) => a + (b.clean_sheets ?? 0), 0);

  const grouped = ["GK", "DEF", "MID", "FWD"].map((pos) => ({
    pos,
    players: [...squad].filter((p) => p.position === pos).sort((a, b) => (a.shirt_number ?? 99) - (b.shirt_number ?? 99)),
  }));

  return (
    <div
      className="min-h-screen"
      style={{ background: `radial-gradient(ellipse at top, ${WC_THEME.maroonDeep} 0%, #100308 65%)` }}
    >
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${participant.primary_color}55 0%, ${WC_THEME.maroonDeep} 60%, ${WC_THEME.maroonInk} 100%)`,
          borderBottom: `1px solid ${WC_THEME.gold}44`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <Link
            to="/world-cup"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] mb-6"
            style={{ color: WC_THEME.gold }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Nations
          </Link>
          <div className="flex flex-wrap items-end gap-6">
            <div className="text-7xl sm:text-8xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]">{participant.flag_emoji}</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.35em]" style={{ color: WC_THEME.gold }}>
                Group {participant.group_name}
              </div>
              <h1 className="font-display text-5xl sm:text-7xl text-white leading-none mt-1">
                {participant.nation_name}
              </h1>
              <div
                className="mt-3 h-1 w-32 rounded-full"
                style={{ background: `linear-gradient(90deg, ${participant.primary_color}, ${participant.secondary_color})` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-2xl">
            <Stat label="FPL Points" value={totalPoints} />
            <Stat label="Goals" value={totalGoals} />
            <Stat label="Assists" value={totalAssists} />
            <Stat label="Clean Sheets" value={totalCleans} />
          </div>
        </div>
      </section>

      {/* SQUAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {grouped.map(({ pos, players }) => (
          <div key={pos}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-2xl text-white">{posLabel(pos)}</h2>
              <div className="flex-1 h-px" style={{ background: `${WC_THEME.gold}33` }} />
              <span className="text-[10px] uppercase tracking-widest text-white/50">{players.length}</span>
            </div>
            {players.length === 0 ? (
              <p className="text-sm text-white/40 italic">No {posLabel(pos).toLowerCase()} added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((p) => {
                  const s = statFor(p.player_name);
                  const badge = getPlClubBadge(p.club);
                  return (
                    <div
                      key={p.id}
                      className="rounded-lg p-4 flex items-center gap-4"
                      style={{
                        background: `linear-gradient(150deg, ${WC_THEME.maroonDeep}, ${WC_THEME.maroonInk})`,
                        border: `1px solid ${WC_THEME.gold}33`,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-display text-lg shrink-0"
                        style={{
                          background: `${participant.primary_color}33`,
                          border: `1px solid ${WC_THEME.gold}66`,
                          color: WC_THEME.goldBright,
                        }}
                      >
                        {p.shirt_number ?? "-"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <div className="text-sm text-white font-semibold truncate">{p.player_name}</div>
                          {p.is_captain && <Star className="w-3 h-3" style={{ color: WC_THEME.goldBright }} fill={WC_THEME.goldBright} />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {badge && <img src={badge} alt="" className="w-3.5 h-3.5 object-contain" />}
                          <div className="text-[10px] uppercase tracking-wider text-white/55 truncate">
                            {p.club ?? "Unattached"}
                          </div>
                        </div>
                      </div>
                      {s && (
                        <div className="text-right">
                          <div className="font-display text-lg tabular-nums" style={{ color: WC_THEME.goldBright }}>
                            {s.fantasy_points}
                          </div>
                          <div className="text-[9px] uppercase tracking-widest text-white/45">pts</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {squad.length === 0 && (
          <div
            className="rounded-xl p-10 text-center text-white/55"
            style={{ background: `${WC_THEME.maroonDeep}`, border: `1px dashed ${WC_THEME.gold}55` }}
          >
            Squad will appear here once players are added to <code>wc_squad</code>.
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{ background: `${WC_THEME.maroonInk}cc`, border: `1px solid ${WC_THEME.gold}33` }}
    >
      <div className="text-[9px] uppercase tracking-widest text-white/55">{label}</div>
      <div className="font-display text-2xl tabular-nums" style={{ color: WC_THEME.goldBright }}>
        {value}
      </div>
    </div>
  );
}

function posLabel(pos: string) {
  return pos === "GK" ? "Goalkeepers" : pos === "DEF" ? "Defenders" : pos === "MID" ? "Midfielders" : "Forwards";
}
