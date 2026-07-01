import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const c = await s.from("gameweek_table").select("*",{count:"exact",head:true}).eq("season_id",5);
console.log("gw_table s5:", c.count);
const g = await s.from("gameweek_table").select("*").eq("season_id",5).limit(3);
console.log(g.data);
