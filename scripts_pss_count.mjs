import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("player_season_stats").select("manager_id,player_id,club,fantasy_points");
console.log("rows fetched:", r.data?.length, r.error?.message);
// distinct per manager
const sets = {};
const clubPts = {};
for (const row of r.data) {
  const mid = String(row.manager_id);
  sets[mid] = sets[mid] || new Set();
  sets[mid].add(row.player_id);
  const k = mid+"|"+row.club;
  clubPts[k] = (clubPts[k]||0) + (row.fantasy_points||0);
}
console.log("distinct counts:", Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,v.size])));
