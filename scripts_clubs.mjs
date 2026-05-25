import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data, count } = await s.from("player_season_stats").select("club", {count:"exact"});
const clubs = [...new Set(data.map(r=>r.club))].sort();
console.log("rows:", count, "distinct clubs:", clubs);
