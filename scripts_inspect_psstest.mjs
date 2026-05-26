import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const t = await s.from("team_season_stats_full").select("*").eq("season_id",4);
console.log("team_season_stats_full s4 cols:", Object.keys(t.data?.[0]||{}));
console.log(JSON.stringify(t.data,null,2));
