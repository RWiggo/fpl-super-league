import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("player_season_stats").select("*").limit(1);
console.log(Object.keys(r.data[0]));
const r2 = await s.from("alltime_table").select("*").limit(1);
console.log("alltime:", Object.keys(r2.data[0]));
