import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data: fx } = await s.from("fixture_records").select("*").limit(2);
console.log(JSON.stringify(fx,null,2));
// Check what manager clubs exist - player_team_alltime club?
const { data: p } = await s.from("player_team_alltime").select("manager_id,player_name,position").eq("manager_id", 5).limit(5);
console.log("pl team field?", Object.keys(p?.[0]||{}));
// list views/tables
const tables = ["tots_teams","season_standings","managers"];
for (const t of tables) {
  const { data, error } = await s.from(t).select("*").limit(1);
  console.log(t, error?.message || Object.keys(data?.[0]||{}));
}
