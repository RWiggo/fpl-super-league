// Per-season kit lookup. Bundled overrides (this file) take priority - they're
// how new kits get added directly to the repo, same as badges. The Supabase-hosted
// `team_kits` DB asset is only used as a fallback for older seasons that haven't
// been bundled in yet. Falls back to the bundled default kit in `managerKits.ts`.
//
// IMPORTANT: getDbSeasonKit carries forward the *latest known* season's kit when
// there's no exact match for the requested season - so a manager's most recent
// bundled/DB kit will silently "leak" into a newer season unless that newer
// season has its own explicit override here. Add one as soon as a new kit exists.
//
// Each override can include a full kit collection (home/away/third/gkImage), not
// just a home kit. `home` is what's used across the main interface everywhere
// else on the site; away/third/gkImage only surface in the Kit Archive.
import { getKit, type Kit } from "@/lib/managerKits";
import { getDbSeasonKit } from "@/lib/seasonAssets";

import s1_1 from "@/assets/kits/season1/1_home.png";
import s1_2 from "@/assets/kits/season1/2_home.png";
import s1_3 from "@/assets/kits/season1/3_home.png";
import s1_4 from "@/assets/kits/season1/4_home.png";
import s1_5 from "@/assets/kits/season1/5_home.png";
import s1_6 from "@/assets/kits/season1/6_home.png";
import s1_7 from "@/assets/kits/season1/7_home.png";
import s1_8 from "@/assets/kits/season1/8_home.png";

import s5_1_home from "@/assets/kits/season5/1_home.png";
import s5_1_away from "@/assets/kits/season5/1_away.png";
import s5_1_third from "@/assets/kits/season5/1_third.png";
import s5_1_gk from "@/assets/kits/season5/1_gk.png";

import s5_2_home from "@/assets/kits/season5/2_home.png";
import s5_2_away from "@/assets/kits/season5/2_away.png";
import s5_2_third from "@/assets/kits/season5/2_third.png";
import s5_2_gk from "@/assets/kits/season5/2_gk.png";

import s5_3_home from "@/assets/kits/season5/3_home.png";
import s5_3_away from "@/assets/kits/season5/3_away.png";
import s5_3_third from "@/assets/kits/season5/3_third.png";
import s5_3_gk from "@/assets/kits/season5/3_gk.png";

import s5_4_home from "@/assets/kits/season5/4_home.png";
import s5_4_away from "@/assets/kits/season5/4_away.png";
import s5_4_third from "@/assets/kits/season5/4_third.png";
import s5_4_gk from "@/assets/kits/season5/4_gk.png";

import s5_6_home from "@/assets/kits/season5/6_home.png";
import s5_6_away from "@/assets/kits/season5/6_away.png";
import s5_6_third from "@/assets/kits/season5/6_third.png";
import s5_6_gk from "@/assets/kits/season5/6_gk.png";

import s5_8_home from "@/assets/kits/season5/8_home.png";
import s5_8_away from "@/assets/kits/season5/8_away.png";
import s5_8_third from "@/assets/kits/season5/8_third.png";
import s5_8_gk from "@/assets/kits/season5/8_gk.png";

import s5_11_home from "@/assets/kits/season5/11_home.png";
import s5_11_away from "@/assets/kits/season5/11_away.png";
import s5_11_third from "@/assets/kits/season5/11_third.png";
import s5_11_gk from "@/assets/kits/season5/11_gk.png";

import s5_9_home from "@/assets/kits/season5/9_home.png";
import s5_9_away from "@/assets/kits/season5/9_away.png";
import s5_9_third from "@/assets/kits/season5/9_third.png";
import s5_9_gk from "@/assets/kits/season5/9_gk.png";

type KitOverride = Partial<Kit>;

const KIT_OVERRIDES: Record<string, KitOverride> = {
  "1|1": { home: s1_1 },
  "2|1": { home: s1_2 },
  "3|1": { home: s1_3 },
  "4|1": { home: s1_4 },
  "5|1": { home: s1_5 },
  "6|1": { home: s1_6 },
  "7|1": { home: s1_7 },
  "8|1": { home: s1_8 },

  "1|5": { home: s5_1_home, away: s5_1_away, third: s5_1_third, gkImage: s5_1_gk },
  "2|5": { home: s5_2_home, away: s5_2_away, third: s5_2_third, gkImage: s5_2_gk },
  "3|5": { home: s5_3_home, away: s5_3_away, third: s5_3_third, gkImage: s5_3_gk },
  "4|5": { home: s5_4_home, away: s5_4_away, third: s5_4_third, gkImage: s5_4_gk },
  "6|5": { home: s5_6_home, away: s5_6_away, third: s5_6_third, gkImage: s5_6_gk },
  "8|5": { home: s5_8_home, away: s5_8_away, third: s5_8_third, gkImage: s5_8_gk },
  "11|5": { home: s5_11_home, away: s5_11_away, third: s5_11_third, gkImage: s5_11_gk },
  "9|5": { home: s5_9_home, away: s5_9_away, third: s5_9_third, gkImage: s5_9_gk },
};

const FALLBACK_GK = { primary: "#0a0a0a", sleeve: "#fff", trim: "#ccc" };

export function getSeasonKit(
  managerId: string | number | null | undefined,
  seasonId: string | number | null | undefined,
): Kit | null {
  if (managerId == null) return null;
  const base = getKit(managerId);

  const override = KIT_OVERRIDES[`${managerId}|${seasonId}`];
  if (override?.home) {
    return base
      ? { ...base, ...override, home: override.home }
      : { home: override.home, gk: FALLBACK_GK, away: override.away, third: override.third, gkImage: override.gkImage };
  }

  const db = getDbSeasonKit(managerId, seasonId);
  if (db) {
    return base
      ? { ...base, home: db }
      : { home: db, gk: FALLBACK_GK };
  }
  return base;
}
