import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { getBranding } from "@/lib/managerBranding";

// Thursday 13th August 2026, 20:00 BST = 19:00 UTC (BST is UTC+1 and is in effect in August)
const DRAFT_TIME_UTC = "2026-08-13T19:00:00Z";
const SEASON_5_ID = 5;

// Matches the SEASON_HUES palette on the season page: Season 5 (id 5) -> hue 285 (purple).
const SEASON_5_ACCENT = "hsl(285 80% 55%)";
const SEASON_5_ACCENT_DEEP = "hsl(285 70% 35%)";

type Team = { manager_id: number; team_name: string; name: string };

function useCountdown(targetIso: string) {
  const [remaining, setRemaining] = useState<number>(() => new Date(targetIso).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(new Date(targetIso).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  const clamped = Math.max(0, remaining);
  const days = Math.floor(clamped / 86_400_000);
  const hours = Math.floor((clamped % 86_400_000) / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);

  return { days, hours, minutes, seconds, done: remaining <= 0 };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="font-display text-3xl sm:text-5xl tabular-nums text-white rounded-lg px-3 sm:px-4 py-2 min-w-[64px] sm:min-w-[92px] text-center"
        style={{ background: `${SEASON_5_ACCENT}1a`, border: `1px solid ${SEASON_5_ACCENT}59` }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] mt-2" style={{ color: SEASON_5_ACCENT }}>{label}</div>
    </div>
  );
}

export function SeasonFiveDraftSection() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const countdown = useCountdown(DRAFT_TIME_UTC);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("manager_season_teams")
        .select("manager_id, team_name, managers(name)")
        .eq("season_id", SEASON_5_ID);
      if (data) {
        const rows = (data as any[])
          .map((r) => ({ manager_id: r.manager_id, team_name: r.team_name, name: r.managers?.name ?? "" }))
          .sort((a, b) => a.team_name.localeCompare(b.team_name));
        setTeams(rows);
      }
    })();
  }, []);

  const items = teams ? [...teams, ...teams] : [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${SEASON_5_ACCENT}26 0%, ${SEASON_5_ACCENT_DEEP}22 35%, rgba(10,17,48,0.75) 70%)`, border: `1px solid ${SEASON_5_ACCENT}55` }}
      >
        <div className="p-5 sm:p-7 pb-6 sm:pb-8 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-2" style={{ color: SEASON_5_ACCENT }}>
            <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: SEASON_5_ACCENT }} /> Season 5
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl mb-1">Draft Night Countdown</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            Thursday 13th August, 8:00pm BST
          </p>

          {countdown.done ? (
            <div className="font-display text-2xl mb-2" style={{ color: SEASON_5_ACCENT }}>The draft is underway!</div>
          ) : (
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <CountdownUnit value={countdown.days} label="Days" />
              <span className="font-display text-2xl sm:text-4xl -mt-4" style={{ color: `${SEASON_5_ACCENT}80` }}>:</span>
              <CountdownUnit value={countdown.hours} label="Hours" />
              <span className="font-display text-2xl sm:text-4xl -mt-4" style={{ color: `${SEASON_5_ACCENT}80` }}>:</span>
              <CountdownUnit value={countdown.minutes} label="Mins" />
              <span className="font-display text-2xl sm:text-4xl -mt-4" style={{ color: `${SEASON_5_ACCENT}80` }}>:</span>
              <CountdownUnit value={countdown.seconds} label="Secs" />
            </div>
          )}
        </div>

        {teams && teams.length > 0 && (
          <div className="py-6 overflow-hidden" style={{ borderTop: `1px solid ${SEASON_5_ACCENT}26` }}>
            <div className="text-center text-[10px] uppercase tracking-[0.3em] mb-4" style={{ color: `${SEASON_5_ACCENT}cc` }}>
              12 Managers. 1 League. Season 5.
            </div>
            <div className="relative">
              <div className="flex gap-10 marquee w-max items-center">
                {items.map((t, i) => {
                  const badge = getBranding(t.manager_id)?.badge;
                  return (
                    <Link
                      key={i}
                      to="/team/$managerId"
                      params={{ managerId: String(t.manager_id) }}
                      className="flex flex-col items-center gap-2 min-w-[100px] group"
                    >
                      {badge ? (
                        <img
                          src={badge}
                          alt={t.team_name}
                          className="w-16 h-16 object-contain drop-shadow-lg group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-xl">
                          {t.name?.[0]}
                        </div>
                      )}
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground text-center max-w-[100px] truncate transition-colors group-hover:text-[--s5-accent]" style={{ ["--s5-accent" as any]: SEASON_5_ACCENT }}>
                        {t.team_name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
