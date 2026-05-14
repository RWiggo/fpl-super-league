import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data: seasons } = await s.from("seasons").select("id,name,year_start").order("year_start");
const { data: st } = await s.from("season_standings").select("season_id,manager_id,position");
for (const sn of seasons) {
  const rows = st.filter(r => r.season_id === sn.id);
  const max = Math.max(...rows.map(r => r.position ?? 0));
  console.log(sn.name, "maxPos=", max, "rows=", rows.length, "last=", rows.filter(r => r.position === max).map(r=>r.manager_id));
}
