import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("player_team_history").select("*").limit(1);
console.log("history keys:", Object.keys(r.data[0]));
// Get distinct clubs across all
const c = await s.from("player_team_history").select("club");
console.log("distinct clubs:", [...new Set(c.data.map(d=>d.club))].sort());
// check if there's manager_id
const m = await s.from("player_team_history").select("manager_id,manager_name").limit(3);
console.log(m.error?.message, m.data);
