// Per-season kit lookup. Bundled overrides (this file) take priority - they're
// how new kits get added directly to the repo, same as badges. The Supabase-hosted
// `team_kits` DB asset is only used as a fallback for older seasons that haven't
// been bundled in yet. Falls back to the bundled default kit in `managerKits.ts`.
//
// IMPORTANT: getDbSeasonKit carries forward the *latest known* season's kit when
// there's no exact match for the requested season - so a manager's most recent
// bundled/DB kit will silently "leak" into a newer season unless that newer
// season has its own explicit override here. Add one as soon as a new kit exists.
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

import s5_3 from "@/assets/kits/season5/3_home.png";
import s5_4 from "@/assets/kits/season5/4_home.png";
import s5_10 from "@/assets/kits/season5/10_home.png";

const KIT_OVERRIDES: Record<string, string> = {
  "1|1": s1_1,
  "2|1": s1_2,
  "3|1": s1_3,
  "4|1": s1_4,
  "5|1": s1_5,
  "6|1": s1_6,
  "7|1": s1_7,
  "8|1": s1_8,

  "3|5": s5_3,
  "4|5": s5_4,
  "10|5": s5_10,
};

export function getSeasonKit(
  managerId: string | number | null | undefined,
  seasonId: string | number | null | undefined,
): Kit | null {
  if (managerId == null) return null;
  const base = getKit(managerId);

  const override = KIT_OVERRIDES[`${managerId}|${seasonId}`];
  if (override && base) return { ...base, home: override };
  if (override) return { home: override, gk: { primary: "#0a0a0a", sleeve: "#fff", trim: "#ccc" } };

  const db = getDbSeasonKit(managerId, seasonId);
  if (db) {
    return base
      ? { ...base, home: db }
      : { home: db, gk: { primary: "#0a0a0a", sleeve: "#fff", trim: "#ccc" } };
  }
  return base;
}
