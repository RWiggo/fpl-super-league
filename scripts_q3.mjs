import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const seasons = await s.from("seasons").select("id,name,season_complete").order("id");
console.log(seasons.data);
const ss = await s.from("season_standings").select("manager_id,team_name,season_id").order("manager_id");
console.log("standings sample cols", ss.error || Object.keys(ss.data[0]||{}));
const latestId = seasons.data.at(-1).id;
const r = await s.from("season_standings").select("manager_id,team_name").eq("season_id", latestId).order("manager_id");
console.log("LATEST season",latestId, r.data);
