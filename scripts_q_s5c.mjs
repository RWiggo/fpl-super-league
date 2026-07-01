import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const f = await s.from("fixture_records").select("*").eq("season_id",5).not("winner_name","is",null).limit(5);
console.log("with winner:", f.data);
const n = await s.from("fixture_records").select("*",{count:"exact",head:true}).eq("season_id",5).is("home_score",null);
console.log("null scores s5:", n.count);
