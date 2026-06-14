import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r1 = await s.from("wc_player_leaderboard").select("player_id, manager_id").limit(2);
console.log("with ids", r1);
const r2 = await s.from("managers").select("id, name").limit(20);
console.log("managers", r2.data);
