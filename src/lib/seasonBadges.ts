// Per-season badge + team-name overrides. Falls back to the manager's current
// (season 4) badge/name from managerBranding / currentTeamNames when no override
// is defined for that season.
import { getBranding } from "@/lib/managerBranding";
import { currentTeamName } from "@/lib/currentTeamNames";

import s1_1 from "@/assets/badges/season1/1.png";
import s1_2 from "@/assets/badges/season1/2.png";
import s1_3 from "@/assets/badges/season1/3.png";
import s1_4 from "@/assets/badges/season1/4.png";
import s1_5 from "@/assets/badges/season1/5.png";
import s1_6 from "@/assets/badges/season1/6.png";
import s1_7 from "@/assets/badges/season1/7.png";
import s1_8 from "@/assets/badges/season1/8.png";

import s2_4 from "@/assets/badges/season2/4.png";
import s2_8 from "@/assets/badges/season2/8.png";

type Override = { badge?: string; teamName?: string };

// Keyed by `${managerId}|${seasonId}`.
// Note: the original imported `@/assets/badges/<id>.svg` set represents the
// Season 3 & 4 badges (badges did not change between those seasons), so we
// only override here where a season-specific asset differs.
const OVERRIDES: Record<string, Override> = {
  // Season 1
  "1|1": { badge: s1_1, teamName: "El Changusto" },
  "2|1": { badge: s1_2, teamName: "Charleston Athletic" },
  "3|1": { badge: s1_3, teamName: "Wiggo Wanderers" },
  "4|1": { badge: s1_4, teamName: "ALS Ajax" },
  "5|1": { badge: s1_5, teamName: "Padleys Piranhas" },
  "6|1": { badge: s1_6, teamName: "Jeffery Schlupp The Bum FC" },
  "7|1": { badge: s1_7, teamName: "Ryan's Lions" },
  "8|1": { badge: s1_8, teamName: "Adam All Stars" },
  // Season 2 (only badges supplied so far; others fall back to S3/4)
  "4|2": { badge: s2_4 },
  "8|2": { badge: s2_8 },
};

/** Badge for a manager in a given season. Falls back to the latest badge. */
export function getSeasonBadge(
  managerId: string | number | null | undefined,
  seasonId: string | number | null | undefined,
): string | null {
  if (managerId == null) return null;
  const key = `${managerId}|${seasonId}`;
  const override = OVERRIDES[key]?.badge;
  if (override) return override;
  return getBranding(managerId)?.badge ?? null;
}

/** Team name for a manager in a given season. Falls back to current. */
export function getSeasonTeamName(
  managerId: string | number | null | undefined,
  seasonId: string | number | null | undefined,
  fallback?: string | null,
): string {
  if (managerId == null) return fallback ?? "-";
  const key = `${managerId}|${seasonId}`;
  const override = OVERRIDES[key]?.teamName;
  if (override) return override;
  return currentTeamName(managerId, fallback);
}

/** Given a list of seasons (with id, year_start) a player was at the team,
 * return the most recent season id. Used for picking the right kit/badge
 * for all-time XI / TOTS displays. */
export function mostRecentSeasonId(
  rows: { season_id?: string | number; season_name?: string; year_start?: number }[],
): string | number | null {
  if (!rows.length) return null;
  const sorted = [...rows].sort((a, b) => (b.year_start ?? 0) - (a.year_start ?? 0));
  return sorted[0]?.season_id ?? null;
}
