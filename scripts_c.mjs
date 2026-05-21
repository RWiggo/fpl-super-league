import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("alltime_player_career_totals").select("*").limit(2);
if(!r.error) console.log(Object.keys(r.data[0]));
else console.log(r.error.message);
