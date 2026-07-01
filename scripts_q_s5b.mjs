import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const f = await s.from("fixture_records").select("gameweek,home_team,away_team,home_score,away_score,winner_name,margin").eq("season_id",5).or("home_score.gt.0,away_score.gt.0").limit(20);
console.log(f.data, f.error);
const c = await s.from("fixture_records").select("*",{count:"exact",head:true}).eq("season_id",5).or("home_score.gt.0,away_score.gt.0");
console.log("nonzero:", c.count);
