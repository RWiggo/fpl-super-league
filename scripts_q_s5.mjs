import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const f = await s.from("fixture_records").select("season_id,gameweek,home_score,away_score,home_team,away_team").eq("season_id",5).limit(5);
console.log(f.data, f.error);
const c = await s.from("fixture_records").select("*",{count:"exact",head:true}).eq("season_id",5);
console.log("s5 total:", c.count);
const c2 = await s.from("fixture_records").select("*",{count:"exact",head:true}).eq("season_id",5).eq("home_score",0).eq("away_score",0);
console.log("s5 0-0:", c2.count);
