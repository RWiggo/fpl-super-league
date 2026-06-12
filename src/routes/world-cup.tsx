import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Star, Shield, Goal, HandMetal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WC_PARTICIPANT_FALLBACK, WC_THEME, type WcParticipant } from "@/lib/worldCup";
import { WorldCupLiveTable } from "@/components/WorldCupLiveTable";
import { FormationPitch } from "@/components/FormationPitch";

export const Route = createFileRoute("/world-cup")({
  component: WorldCupPage,
  head: () => ({
    meta: [
      { title: "World Cup Special - FPL Super League" },
      { name: "description", content: "The FPL Super League World Cup edition - standings, squads and tournament records." },
      { property: "og:title", content: "FPL Super League - World Cup Special" },
      { property: "og:description", content: "Live World Cup standings, squads and records." },
    ],
  }),
});

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

function WorldCupPage() {
  const [participants] = useState<WcParticipant[]>(WC_PARTICIPANT_FALLBACK);
  const [squadCounts, setSquadCounts] = useState<Record<number, number>>({});
  const [stats] = useState<PlayerStat[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("wc_squads").select("manager_id");
      if (error || !data) return;
      const counts: Record<number, number> = {};
      for (const r of data as Array<{ manager_id: number }>) {
        counts[r.manager_id] = (counts[r.manager_id] ?? 0) + 1;
      }
      setSquadCounts(counts);
    })();
  }, []);

  const byManager = (id: number) => participants.find((x) => x.manager_id === id);

  const topGoals = [...stats].sort((a, b) => b.goals - a.goals).filter((s) => s.goals > 0).slice(0, 5);
  const topAssists = [...stats].sort((a, b) => b.assists - a.assists).filter((s) => s.assists > 0).slice(0, 5);
  const topCleans = [...stats]
    .filter((s) => s.position === "GK" || s.position === "DEF")
    .sort((a, b) => b.clean_sheets - a.clean_sheets)
    .filter((s) => s.clean_sheets > 0)
    .slice(0, 5);

  const totFlat: Array<{ player_name: string; position: string; club?: string; total_fantasy_points: number; manager_id: string }> = [];
  const subs: PlayerStat[] = [];

  const getManagerName = (id: string) => byManager(Number(id))?.nation_name ?? "-";

  return (
    <div
      className="wc-page min-h-screen"
      style={{
        background: `radial-gradient(ellipse at top, ${WC_THEME.maroonDeep} 0%, #100308 65%)`,
      }}
    >
      <WCStyles />

      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 wc-stars opacity-60" />
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl pointer-events-none"
          style={{ background: `radial-gradient(circle, ${WC_THEME.gold}33 0%, transparent 60%)` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${WC_THEME.gold}, transparent)` }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: `${WC_THEME.gold}1f`, border: `1px solid ${WC_THEME.gold}66`, color: WC_THEME.goldBright }}>
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-[0.35em] font-bold">Special Edition</span>
          </div>
          <h1
            className="font-display text-6xl sm:text-7xl md:text-9xl leading-[0.95] mb-6"
            style={{
              background: `linear-gradient(180deg, ${WC_THEME.goldBright} 0%, ${WC_THEME.gold} 60%, #8a6d1b 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: `0 4px 30px ${WC_THEME.maroonInk}`,
            }}
          >
            World Cup
          </h1>
          <div
            className="mx-auto h-px w-32 my-6"
            style={{ background: `linear-gradient(90deg, transparent, ${WC_THEME.gold}, transparent)` }}
          />
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/80">
            Ten nations. One trophy. No head to head - just pure FPL points and tournament glory.
          </p>

          <div className="flex justify-center flex-wrap gap-2 mt-8 max-w-2xl mx-auto">
            {participants.map((p) => (
              <span
                key={p.manager_id}
                title={p.nation_name}
                className="text-2xl sm:text-3xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
              >
                {p.flag_emoji}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">
        {/* ---------- LIVE TABLE ---------- */}
        <section>
          <SectionTitle kicker="Standings" title="Live League Table" />
          <WorldCupLiveTable />
        </section>

        {/* ---------- PARTICIPATING NATIONS ---------- */}
        <section>
          <SectionTitle kicker="Competitors" title="Participating Nations" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {participants.map((p) => {
              const sqCount = squadCounts[p.manager_id] ?? 0;
              return (
                <Link
                  key={p.manager_id}
                  to="/world-cup/$managerId"
                  params={{ managerId: String(p.manager_id) }}
                  className="group rounded-xl overflow-hidden border transition-all hover:-translate-y-1"
                  style={{
                    background: `linear-gradient(155deg, ${p.primary_color}3a 0%, ${WC_THEME.maroonDeep} 70%)`,
                    borderColor: `${WC_THEME.gold}44`,
                    boxShadow: `0 12px 40px -18px ${WC_THEME.maroonInk}, 0 0 0 1px ${WC_THEME.gold}22`,
                  }}
                >
                  <div
                    className="h-2"
                    style={{
                      background: `linear-gradient(90deg, ${p.primary_color}, ${p.secondary_color}, ${p.primary_color})`,
                    }}
                  />
                  <div className="p-5 flex items-center gap-4">
                    <div className="text-5xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">{p.flag_emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] uppercase tracking-[0.3em]" style={{ color: WC_THEME.gold }}>
                        Group {p.group_name}
                      </div>
                      <div className="font-display text-xl text-white truncate">{p.nation_name}</div>
                      <div className="text-[10px] uppercase tracking-wider text-white/55 mt-1">
                        {sqCount > 0 ? `${sqCount} player${sqCount === 1 ? "" : "s"} - tap for squad` : "Tap for squad"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ---------- RECORDS ---------- */}
        <section>
          <SectionTitle kicker="Tournament Records" title="Golden Boots, Playmakers & Walls" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <RecordCard
              icon={<Goal className="w-4 h-4" />}
              title="Golden Boot"
              rows={topGoals.map((s) => ({
                name: s.player_name,
                meta: s.club ?? "",
                value: s.goals,
                nation: byManager(s.manager_id)?.nation_name ?? "",
                flag: byManager(s.manager_id)?.flag_emoji ?? "",
              }))}
              unit="goals"
            />
            <RecordCard
              icon={<HandMetal className="w-4 h-4" />}
              title="Playmaker"
              rows={topAssists.map((s) => ({
                name: s.player_name,
                meta: s.club ?? "",
                value: s.assists,
                nation: byManager(s.manager_id)?.nation_name ?? "",
                flag: byManager(s.manager_id)?.flag_emoji ?? "",
              }))}
              unit="assists"
            />
            <RecordCard
              icon={<Shield className="w-4 h-4" />}
              title="Brick Wall"
              rows={topCleans.map((s) => ({
                name: s.player_name,
                meta: s.club ?? "",
                value: s.clean_sheets,
                nation: byManager(s.manager_id)?.nation_name ?? "",
                flag: byManager(s.manager_id)?.flag_emoji ?? "",
              }))}
              unit="clean sheets"
            />
          </div>
        </section>

        {/* ---------- TEAM OF THE TOURNAMENT ---------- */}
        <section>
          <SectionTitle kicker="Best XI" title="Team of the Tournament" />
          {totFlat.length === 0 ? (
            <EmptyPanel message="Team of the tournament unlocks once player stats are recorded." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
              <FormationPitch players={totFlat} getManagerName={getManagerName} />
              <div
                className="rounded-xl p-5"
                style={{
                  background: `linear-gradient(160deg, ${WC_THEME.maroonDeep}, ${WC_THEME.maroonInk})`,
                  border: `1px solid ${WC_THEME.gold}44`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4" style={{ color: WC_THEME.goldBright }} />
                  <h3 className="font-display text-lg" style={{ color: WC_THEME.goldBright }}>Substitutes</h3>
                </div>
                {subs.length === 0 ? (
                  <p className="text-sm text-white/55">Subs will appear once more players have minutes.</p>
                ) : (
                  <ul className="space-y-2">
                    {subs.map((s, i) => (
                      <li key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[10px] uppercase tracking-widest text-white/40 w-7">{s.position}</span>
                          <span className="text-lg">{byManager(s.manager_id)?.flag_emoji}</span>
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">{s.player_name}</div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 truncate">{s.club}</div>
                          </div>
                        </div>
                        <div className="font-display text-base tabular-nums" style={{ color: WC_THEME.goldBright }}>
                          {s.fantasy_points}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] uppercase tracking-[0.35em] mb-2" style={{ color: WC_THEME.gold }}>
        {kicker}
      </div>
      <h2 className="font-display text-3xl md:text-5xl text-white">{title}</h2>
      <div className="h-px w-20 mt-3" style={{ background: `linear-gradient(90deg, ${WC_THEME.gold}, transparent)` }} />
    </div>
  );
}

function RecordCard({
  icon, title, rows, unit,
}: {
  icon: React.ReactNode;
  title: string;
  rows: Array<{ name: string; meta: string; value: number; nation: string; flag: string }>;
  unit: string;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${WC_THEME.maroonDeep}, ${WC_THEME.maroonInk})`,
        border: `1px solid ${WC_THEME.gold}44`,
        boxShadow: `0 18px 50px -22px ${WC_THEME.maroonInk}`,
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ background: `${WC_THEME.maroon}33`, borderBottom: `1px solid ${WC_THEME.gold}33`, color: WC_THEME.goldBright }}
      >
        {icon}
        <h3 className="font-display text-base tracking-wide">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <div className="p-6 text-sm text-white/55 text-center">Awaiting tournament data.</div>
      ) : (
        <ul className="divide-y divide-white/5">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="font-display text-sm w-5 text-center"
                  style={{ color: i === 0 ? WC_THEME.goldBright : "rgba(255,255,255,0.5)" }}
                >
                  {i + 1}
                </span>
                <span className="text-lg leading-none">{r.flag}</span>
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{r.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/45 truncate">
                    {r.meta}{r.meta && r.nation ? " - " : ""}{r.nation}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg tabular-nums" style={{ color: WC_THEME.goldBright }}>
                  {r.value}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-white/45">{unit}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl p-10 text-center"
      style={{
        background: `linear-gradient(160deg, ${WC_THEME.maroonDeep}, ${WC_THEME.maroonInk})`,
        border: `1px dashed ${WC_THEME.gold}55`,
        color: "rgba(255,255,255,0.6)",
      }}
    >
      {message}
    </div>
  );
}

function WCStyles() {
  return (
    <style>{`
      .wc-stars {
        background-image:
          radial-gradient(circle at 20% 30%, rgba(212,175,55,0.18) 0, transparent 1.2px),
          radial-gradient(circle at 70% 50%, rgba(212,175,55,0.14) 0, transparent 1.4px),
          radial-gradient(circle at 40% 80%, rgba(212,175,55,0.12) 0, transparent 1px),
          radial-gradient(circle at 85% 20%, rgba(212,175,55,0.2) 0, transparent 1.6px),
          radial-gradient(circle at 10% 70%, rgba(212,175,55,0.12) 0, transparent 1px);
        background-size: 220px 220px, 280px 280px, 200px 200px, 320px 320px, 240px 240px;
      }
    `}</style>
  );
}
