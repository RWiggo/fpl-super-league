import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// Check if these have manager_id
for (const t of ["player_team_history","player_team_alltime","unbeaten_streaks","winless_streaks","losing_streaks","win_streaks","fixture_records"]) {
  const r = await s.from(t).select("*").eq("manager_id",8).limit(1);
  console.log(t, r.error?.message ?? `OK count=${r.data.length}`, r.data?.[0] && Object.keys(r.data[0]));
}
