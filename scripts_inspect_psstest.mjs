import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const t = await s.from("team_season_stats_full").select("*");
console.log("rows:", t.data?.length, "err:", t.error?.message);
console.log("cols:", Object.keys(t.data?.[0]||{}));
const seasons = [...new Set((t.data||[]).map(r=>r.season_id))];
console.log("seasons:", seasons);
// Look for goals-like column
const sample = t.data?.[0];
console.log(JSON.stringify(sample,null,2));
