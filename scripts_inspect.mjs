import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// Inspect a row of various tables
for (const t of ["player_team_alltime","player_team_history","win_streaks","team_legends","team_of_the_season"]) {
  const { data, error } = await s.from(t).select("*").limit(2);
  console.log("===",t,"===");
  if (error) console.log("ERR", error.message);
  else console.log(JSON.stringify(data,null,2));
}
