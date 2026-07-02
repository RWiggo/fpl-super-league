// Per-season badge + team-name overrides. Prefers the Supabase-hosted asset
// from `team_badges_resolved` (loaded by `seasonAssets.ts`); falls back to
// any bundled per-season override, then the manager's current branding.
import { getBranding } from "@/lib/managerBranding";
import { currentTeamName } from "@/lib/currentTeamNames";
import { getDbSeasonBadge } from "@/lib/seasonAssets";

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

// ALS Ajax used the older Irish-green crest for seasons 3 and 4;
// the new dark-green crest (in managerBranding) is used from season 5 onward.
import ajaxOld from "@/assets/badges/4.svg";

type Override = { badge?: string; teamName?: string };

// Local bundled fallbacks (used only if the Supabase asset cache misses).
const OVERRIDES: Record<string, Override> = {
  "1|1": { badge: s1_1, teamName: "El Changusto" },
  "2|1": { badge: s1_2, teamName: "Charleston Athletic" },
  "3|1": { badge: s1_3, teamName: "Wiggo Wanderers" },
  "4|1": { badge: s1_4, teamName: "ALS Ajax" },
  "5|1": { badge: s1_5, teamName: "Padleys Piranhas" },
  "6|1": { badge: s1_6, teamName: "Jeffrey Schlupp the Bum FC" },
  "7|1": { badge: s1_7, teamName: "Ryan's Lions" },
  "8|1": { badge: s1_8, teamName: "Adam All Stars" },
  "4|2": { badge: s2_4 },
  "4|3": { badge: ajaxOld },
  "4|4": { badge: ajaxOld },
  "8|2": { badge: s2_8 },
  "6|2": { teamName: "Jeffrey Schlupp the Bum FC" },
  "9|3": { teamName: "Lallana Rhoades FC" },
  "9|2": { teamName: "Lallana Rhoades FC" },
};

/** Badge for a manager in a given season. Falls back to the latest badge. */
export function getSeasonBadge(
  managerId: string | number | null | undefined,
  seasonId: string | number | null | undefined,
): string | null {
  if (managerId == null) return null;
  const db = getDbSeasonBadge(managerId, seasonId);
  if (db) return db;
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
