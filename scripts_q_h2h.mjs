import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const h = await s.from("h2h_records").select("*").limit(3);
console.log(JSON.stringify(h.data,null,2));
const f = await s.from("fixture_records").select("*").is("home_score",null).limit(3);
console.log("null-score fixtures:", f.data?.length, f.data?.slice(0,2));
const fall = await s.from("fixture_records").select("season_id,gameweek,home_score",{count:"exact",head:true}).is("home_score",null);
console.log("null count:", fall.count);
