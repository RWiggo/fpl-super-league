import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const seasons = await s.from("seasons").select("*").order("id");
console.log("seasons:", JSON.stringify(seasons.data,null,2));
const st = await s.from("season_standings").select("season_id,manager_id,position,team_name").eq("season_id",4).order("position");
console.log("season 4 standings:", st.data);
