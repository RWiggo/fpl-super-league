import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("season_standings").select("*").eq("season_id",4).limit(2);
console.log(r.error||r.data);
const m = await s.from("managers").select("*").limit(2);
console.log("manager cols:", Object.keys(m.data[0]));
