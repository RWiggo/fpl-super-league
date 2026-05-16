import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data: m } = await s.from("managers").select("id,name");
console.log("managers:", m);
const { data: p10 } = await s.from("player_team_alltime").select("*").in("manager_id",[10,12]).limit(3);
console.log("10/12 entries:", p10);
