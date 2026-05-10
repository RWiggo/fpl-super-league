import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data } = await s.from("player_team_history").select("position");
console.log("positions:", [...new Set(data.map(x=>x.position))]);
const { data: t } = await s.from("team_of_the_season").select("position");
console.log("tots positions:", [...new Set(t.map(x=>x.position))]);
// Best-by-position single-season query
for (const pos of [...new Set(data.map(x=>x.position))]) {
  const { data: top } = await s.from("player_team_history").select("player_name,fantasy_points,season_name,manager_name,position").eq("position",pos).order("fantasy_points",{ascending:false}).limit(2);
  console.log(pos, top);
}
