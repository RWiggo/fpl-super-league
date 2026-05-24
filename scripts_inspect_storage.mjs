import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");

const tables = ["managers","seasons","manager_seasons","team_season_stats_full","season_kits","manager_season_kits","season_badges","manager_season_badges","assets","team_history","manager_team_seasons"];
for (const t of tables) {
  const { data, error } = await s.from(t).select("*").limit(2);
  console.log("===",t,"===");
  if (error) console.log("ERR", error.message);
  else { console.log("cols:", data[0] ? Object.keys(data[0]).join(",") : "empty"); if(data[0]) console.log(data); }
}
