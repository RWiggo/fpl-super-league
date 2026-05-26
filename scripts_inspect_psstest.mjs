import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("player_season_stats").select("manager_id,manager_name,player_id,club,fantasy_points,season_id").range(0,2999);
console.log("len", r.data?.length, "err", r.error?.message);
const r2 = await s.from("player_season_stats").select("manager_id,manager_name,player_id,club,fantasy_points,season_id").range(0,4999);
console.log("len2", r2.data?.length, "err", r2.error?.message);
