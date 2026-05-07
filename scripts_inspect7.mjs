import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["h2h_records","manager_overall_record","season_standings","manager_season_teams","team_legends","team_of_the_season","team_season_stats_full"]) {
  const r = await s.from(t).select("*").limit(1);
  console.log(t, r.data?.[0] && Object.keys(r.data[0]));
}
