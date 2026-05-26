import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const t = await s.from("team_season_stats_full").select("season_name,manager_name,out_goals").eq("season_name","2025/26").order("manager_name");
console.log("2025/26:", t.data);
// Also check player_season_stats season 4 goals for Padley (mgr 5)
const p = await s.from("player_season_stats").select("manager_id,out_goals,gk_goals").eq("season_id",4).eq("manager_id",5);
let total=0; for(const r of (p.data||[])) total+=(r.out_goals||0)+(r.gk_goals||0);
console.log("Padley s4 goals (player_season_stats):", total, "rows:", p.data?.length);
