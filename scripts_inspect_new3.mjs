import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// search likely tables
for (const t of ["tots","team_of_the_season","season_tots","awards","player_seasons","manager_player_seasons"]) {
  const { error } = await s.from(t).select("*").limit(1);
  console.log(t, error?.message || "OK");
}
// check for pl club info in players
const { data } = await s.from("player_team_alltime").select("*").limit(1);
console.log("full row:", JSON.stringify(data?.[0],null,2));
