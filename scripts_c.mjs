import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("player_season_stats").select("*").limit(1);
console.log(Object.keys(r.data[0]).filter(k=>/name|player/i.test(k)));
const r2 = await s.from("overall_team_of_the_season").select("*").limit(3);
console.log("tots cols:", Object.keys(r2.data[0]));
