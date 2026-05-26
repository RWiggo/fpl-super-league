import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const t = await s.from("team_season_stats_full").select("season_name,manager_name,team_name,out_goals,gk_goals_against").order("season_name");
console.log(t.data.map(r=>({s:r.season_name, m:r.manager_name, g:r.out_goals})));
// season 4 specifically (2025/26?)
