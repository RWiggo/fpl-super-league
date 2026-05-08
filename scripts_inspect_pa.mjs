import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV",{auth:{persistSession:false}});
const { data } = await s.from("player_team_history").select("*").eq("manager_name","Adam Wiggins").limit(3);
console.log(JSON.stringify(data, null, 2));
