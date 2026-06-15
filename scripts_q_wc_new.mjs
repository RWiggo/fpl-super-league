import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const ps = await s.from("wc_player_scores").select("*");
console.log("scores count", ps.data?.length, ps.error);
console.log("sample", ps.data?.slice(0,3));
const lb = await s.from("wc_player_leaderboard").select("*").limit(3);
console.log("lb sample", lb.data, lb.error);
const std = await s.from("wc_standings").select("*");
console.log("standings", std.data, std.error);
