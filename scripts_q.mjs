import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data, error } = await s.from("managers").select("id,name,team_name").order("name");
console.log(JSON.stringify(data,null,2)); if(error) console.error(error);
const m = await s.from("manager_season_teams").select("manager_id,team_name,season_id").order("season_id");
console.log("---MST---"); console.log(JSON.stringify(m.data,null,2));
