import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// list tables via information_schema rpc not available; try known ones
const tables = ["fixtures","gameweeks","manager_gameweek","manager_gameweek_team","manager_season","squads","lineups","team_history","manager_team_history","manager_seasonal_data","team_name_history"];
for (const t of tables) {
  const r = await s.from(t).select("*").limit(1);
  console.log(t, r.error?.message || Object.keys(r.data[0]||{}));
}
