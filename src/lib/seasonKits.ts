// Per-season kit overrides. The default kits in `managerKits.ts` represent
// the Season 2 home kits (as supplied first by the user). When a manager has
// a different kit in another season, we look it up here. Otherwise we fall
// back to the default.
import { getKit, type Kit } from "@/lib/managerKits";

import s1_1 from "@/assets/kits/season1/1_home.png";
import s1_2 from "@/assets/kits/season1/2_home.png";
import s1_3 from "@/assets/kits/season1/3_home.png";
import s1_4 from "@/assets/kits/season1/4_home.png";
import s1_5 from "@/assets/kits/season1/5_home.png";
import s1_6 from "@/assets/kits/season1/6_home.png";
import s1_7 from "@/assets/kits/season1/7_home.png";
import s1_8 from "@/assets/kits/season1/8_home.png";

// Per-season home kit override. GK palette inherits from the default kit
// for now; we can extend later when GK kits diverge.
const KIT_OVERRIDES: Record<string, string> = {
  "1|1": s1_1,
  "2|1": s1_2,
  "3|1": s1_3,
  "4|1": s1_4,
  "5|1": s1_5,
  "6|1": s1_6,
  "7|1": s1_7,
  "8|1": s1_8,
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
  return base;
}
