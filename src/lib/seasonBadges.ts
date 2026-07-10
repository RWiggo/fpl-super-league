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
// Send Me Location used the red/navy crest through season 4;
// the new navy crest (in managerBranding) is used from season 5 onward.
import smlOld from "@/assets/badges/10.svg";
// Padleys Piranhas used the old crest through season 4;
// the new red piranha crest (in managerBranding) is used from season 5 onward.
import piranhasOld from "@/assets/badges/5.svg";
// Charleston Athletic used the old crest through season 4;
// the new purple raven crest (in managerBranding) is used from season 5 onward.
import charlestonOld from "@/assets/badges/2.svg";
// Raybould Eagles used the old crest through season 4;
// the new crest (in managerBranding) is used from season 5 onward.
import raybouldOld from "@/assets/badges/7.svg";
// El Changusto used the old crest through season 4;
// the new crest (in managerBranding) is used from season 5 onward.
import changustoOld from "@/assets/badges/1.svg";
// Adam All Stars used the old crest through season 4;
// the new polar bear crest (in managerBranding) is used from season 5 onward.
import adamOld from "@/assets/badges/8.svg";
// Not Too Xabi FC used the old crest through season 4;
// the new crest (in managerBranding) is used from season 5 onward.
import xabiOld from "@/assets/badges/11.svg";
// Wiggo Wanderers used the old crest through season 4;
// the new penguin crest (in managerBranding) is used from season 5 onward.
import wiggoOld from "@/assets/badges/3.svg";
// Fordys XI (formerly Fill Her Wycombe) used the old crest through season 4;
// the new Flamingos crest (in managerBranding) is used from season 5 onward.
import fordysOld from "@/assets/badges/6.svg";

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
  "6|2": { badge: fordysOld, teamName: "Jeffrey Schlupp the Bum FC" },
  "6|3": { badge: fordysOld, teamName: "Fill Her Wycombe FC" },
  "6|4": { badge: fordysOld, teamName: "Fill Her Wycombe FC" },
  "9|3": { teamName: "Lallana Rhoades FC" },
  "9|2": { teamName: "Lallana Rhoades FC" },
  "10|2": { badge: smlOld },
  "10|3": { badge: smlOld },
  "10|4": { badge: smlOld },
  "5|2": { badge: piranhasOld },
  "5|3": { badge: piranhasOld },
  "5|4": { badge: piranhasOld },
  "2|2": { badge: charlestonOld },
  "2|3": { badge: charlestonOld },
  "2|4": { badge: charlestonOld },
  "7|2": { badge: raybouldOld },
  "7|3": { badge: raybouldOld },
  "7|4": { badge: raybouldOld },
  "1|2": { badge: changustoOld },
  "1|3": { badge: changustoOld },
  "1|4": { badge: changustoOld },
  "8|3": { badge: adamOld },
  "8|4": { badge: adamOld },
  "11|1": { badge: xabiOld },
  "11|2": { badge: xabiOld },
  "11|3": { badge: xabiOld },
  "11|4": { badge: xabiOld },
  "3|2": { badge: wiggoOld },
  "3|3": { badge: wiggoOld },
  "3|4": { badge: wiggoOld },
};

/** Badge for a manager in a given season. Falls back to the latest badge. */
export function getSeasonBadge(
  managerId: string | number | null | undefined,
  seasonId: string | number | null | undefined,
): string | null {
  if (managerId == null) return null;
  // When a season is provided, only trust the DB for an exact match.
  // Otherwise a manager whose newest DB row is (say) season 4 would keep
  // returning the old crest for season 5+, masking refreshed branding.
  const db = getDbSeasonBadge(managerId, seasonId, { exact: seasonId != null });
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
