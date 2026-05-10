import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["fixture_records","win_streaks","season_standings","player_team_alltime","team_of_the_season","player_of_season","player_team_history","team_legends","seasons","alltime_table","fixtures","gameweek_scores","gameweek_results","manager_gameweek_scores"]) {
  const { data, error, count } = await s.from(t).select("*", { count: "exact" }).limit(1);
  console.log("===",t,"===");
  if (error) console.log("ERR", error.message);
  else console.log("count="+count, "keys=", data?.[0] ? Object.keys(data[0]).join(", ") : "(empty)");
}
