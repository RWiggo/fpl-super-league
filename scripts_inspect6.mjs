import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["fixture_records","win_streaks","unbeaten_streaks","winless_streaks","losing_streaks","player_team_history"]) {
  const r = await s.from(t).select("*").limit(1);
  console.log(t, r.data?.[0] && Object.keys(r.data[0]));
}
// Test current team page query
const f = await s.from("fixture_records").select("*").or(`home_manager_id.eq.8,away_manager_id.eq.8`);
console.log("fixtures by manager_id 8:", f.error?.message, f.data?.length);
