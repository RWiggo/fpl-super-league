import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data } = await s.from("win_streaks").select("outcome");
console.log("outcomes:", [...new Set(data.map(d=>d.outcome))]);
// check what tables exist by trying common ones
for (const t of ["streaks","unbeaten_streaks","manager_streaks","team_overall_record","manager_overall_record"]) {
  const r = await s.from(t).select("*").limit(1);
  console.log(t, r.error ? r.error.message : Object.keys(r.data[0]||{}));
}
