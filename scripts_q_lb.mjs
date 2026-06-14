import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data, error } = await s.from("wc_player_leaderboard").select("*").limit(3);
console.log("err",error);
console.log(JSON.stringify(data,null,2));
