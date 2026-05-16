import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { count } = await s.from("player_team_alltime").select("*",{count:"exact",head:true});
console.log("total rows:", count);
