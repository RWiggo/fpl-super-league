import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const st = await s.from("season_standings").select("*").eq("season_id",4);
console.log("count:", st.data?.length, st.error?.message);
console.log(st.data);
const all = await s.from("season_standings").select("season_id,manager_id,position").order("season_id");
const bySeason = {};
all.data?.forEach(r => { bySeason[r.season_id] = (bySeason[r.season_id]||0)+1; });
console.log("rows by season:", bySeason);
