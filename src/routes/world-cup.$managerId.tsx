import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WC_PARTICIPANT_FALLBACK, WC_THEME, type WcParticipant } from "@/lib/worldCup";

export const Route = createFileRoute("/world-cup/$managerId")({
  component: SquadPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center text-white">Nation not found.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center text-white">{error.message}</div>
  ),
});

type DbPos = "G" | "D" | "M" | "F";
type UiPos = "GK" | "DEF" | "MID" | "FWD";

type SquadPlayer = {
  id: number;
  player_id: string;
  player_name: string;
  country: string;
  position: UiPos;
  draft_pick: number | null;
  total_points: number;
  rounds_played: number;
};

const POS_MAP: Record<DbPos, UiPos> = { G: "GK", D: "DEF", M: "MID", F: "FWD" };
const POS_ORDER: UiPos[] = ["GK", "DEF", "MID", "FWD"];

// Lightweight country -> flag emoji map for player rows.
const COUNTRY_FLAGS: Record<string, string> = {
  Germany: "🇩🇪", Belgium: "🇧🇪", France: "🇫🇷", Spain: "🇪🇸", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Switzerland: "🇨🇭", Senegal: "🇸🇳", Brazil: "🇧🇷", Argentina: "🇦🇷", Morocco: "🇲🇦",
  Portugal: "🇵🇹", Canada: "🇨🇦", Uruguay: "🇺🇾", Netherlands: "🇳🇱", Ecuador: "🇪🇨",
  Paraguay: "🇵🇾", Austria: "🇦🇹", Turkey: "🇹🇷", USA: "🇺🇸", Norway: "🇳🇴",
  Colombia: "🇨🇴", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", Mexico: "🇲🇽", Japan: "🇯🇵", Egypt: "🇪🇬",
  Sweden: "🇸🇪", Ghana: "🇬🇭", Croatia: "🇭🇷", "Ivory Coast": "🇨🇮",
};

function SquadPage() {
  const { managerId } = Route.useParams();
  const id = Number(managerId);
  const [participant, setParticipant] = useState<WcParticipant | null>(null);
  const [squad, setSquad] = useState<SquadPlayer[] | null>(null);

  useEffect(() => {
    (async () => {
      const fallback = WC_PARTICIPANT_FALLBACK.find((x) => x.manager_id === id) ?? null;
      setParticipant(fallback);

      const { data, error } = await supabase
        .from("wc_squads")
        .select("id, player_id, draft_pick, wc_players(name, country, position)")
        .eq("manager_id", id);
      if (error) {
        console.error("wc_squads fetch failed", error);
        setSquad([]);
        return;
      }
      const rows = data ?? [];
      const playerIds = rows.map((r: any) => r.player_id);

      const scoreAgg: Record<string, { total: number; rounds: number }> = {};
      if (playerIds.length > 0) {
        const { data: scores } = await supabase
          .from("wc_player_scores")
          .select("player_id, fpl_points")
          .in("player_id", playerIds);
        for (const s of (scores ?? []) as Array<{ player_id: string; fpl_points: number | null }>) {
          const cur = scoreAgg[s.player_id] ?? { total: 0, rounds: 0 };
          cur.total += Number(s.fpl_points ?? 0);
          cur.rounds += 1;
          scoreAgg[s.player_id] = cur;
        }
      }

      const mapped: SquadPlayer[] = rows.map((r: any) => ({
        id: r.id,
        player_id: r.player_id,
        player_name: r.wc_players?.name ?? r.player_id,
        country: r.wc_players?.country ?? "",
        position: POS_MAP[(r.wc_players?.position as DbPos) ?? "M"] ?? "MID",
        draft_pick: r.draft_pick,
        total_points: scoreAgg[r.player_id]?.total ?? 0,
        rounds_played: scoreAgg[r.player_id]?.rounds ?? 0,
      }));
      setSquad(mapped);
    })();
  }, [id]);

  if (participant === null || squad === null) {
    return <div className="min-h-screen flex items-center justify-center text-white/70">Loading…</div>;
  }
  if (!participant) throw notFound();

  const grouped = POS_ORDER.map((pos) => ({
    pos,
    players: squad
      .filter((p) => p.position === pos)
      .sort((a, b) => {
        if (a.draft_pick != null && b.draft_pick != null) return a.draft_pick - b.draft_pick;
        return a.player_name.localeCompare(b.player_name);
      }),
  }));

  return (
    <div
      className="min-h-screen"
      style={{ background: `radial-gradient(ellipse at top, ${WC_THEME.maroonDeep} 0%, #100308 65%)` }}
    >
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
              <div className="mt-3 text-[11px] uppercase tracking-[0.25em] text-white/55">
                {squad.length} players drafted
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {grouped.map(({ pos, players }) => (
          <div key={pos}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-2xl text-white">{posLabel(pos)}</h2>
              <div className="flex-1 h-px" style={{ background: `${WC_THEME.gold}33` }} />
              <span className="text-[10px] uppercase tracking-widest text-white/50">{players.length}</span>
            </div>
            {players.length === 0 ? (
              <p className="text-sm text-white/40 italic">No {posLabel(pos).toLowerCase()} drafted.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg p-4 flex items-center gap-4"
                    style={{
                      background: `linear-gradient(150deg, ${WC_THEME.maroonDeep}, ${WC_THEME.maroonInk})`,
                      border: `1px solid ${WC_THEME.gold}33`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                      style={{
                        background: `${participant.primary_color}33`,
                        border: `1px solid ${WC_THEME.gold}66`,
                      }}
                    >
                      {COUNTRY_FLAGS[p.country] ?? "🏳️"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white font-semibold truncate">{p.player_name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/55 truncate mt-0.5">
                        {p.country || "Unknown"}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/45 mt-1 tabular-nums">
                        {p.total_points} pts · {p.rounds_played} {p.rounds_played === 1 ? "game" : "games"}
                      </div>
                    </div>
                    {p.draft_pick != null && (
                      <div className="text-right">
                        <div className="font-display text-lg tabular-nums" style={{ color: WC_THEME.goldBright }}>
                          #{p.draft_pick}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/45">pick</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {squad.length === 0 && (
          <div
            className="rounded-xl p-10 text-center text-white/55"
            style={{ background: `${WC_THEME.maroonDeep}`, border: `1px dashed ${WC_THEME.gold}55` }}
          >
            No players drafted for this nation yet.
          </div>
        )}
      </section>
    </div>
  );
}

function posLabel(pos: UiPos) {
  return pos === "GK" ? "Goalkeepers" : pos === "DEF" ? "Defenders" : pos === "MID" ? "Midfielders" : "Forwards";
}
