import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data: mgrs } = await s.from("managers").select("*");
console.log("managers:", JSON.stringify(mgrs,null,2));
const { data: pth } = await s.from("player_team_history").select("*").order("fantasy_points",{ascending:false}).limit(3);
console.log("player_team_history sample (top):", JSON.stringify(pth,null,2));
