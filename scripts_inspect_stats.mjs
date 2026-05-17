import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// list all tables/views by checking common names
for (const t of ["player_team_alltime","player_stats","player_season_stats","goals","clean_sheets","cards","player_career"]) {
  const { data, error } = await s.from(t).select("*").limit(1);
  console.log(t, error?.message || Object.keys(data?.[0]||{}));
}
