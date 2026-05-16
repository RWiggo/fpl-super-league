import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// Try to list interesting tables related to player stats per manager
const tables = ["player_team_alltime","player_team_history","manager_player_seasons","player_appearances","manager_stats","manager_alltime_stats","weekly_high_scores","fixture_records","season_standings","alltime_table"];
for (const t of tables) {
  const { data, error } = await s.from(t).select("*").limit(1);
  console.log("===",t,"===");
  if (error) console.log("ERR", error.message);
  else console.log("cols:", data[0] ? Object.keys(data[0]).join(",") : "empty");
}
