import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const tables = ["manager_team_names","season_team_name","manager_season_team","team","teams","brand","brands","manager_branding","manager_info","manager_meta","metadata"];
for (const t of tables) {
  const r = await s.from(t).select("*").limit(2);
  console.log(t, r.error?.message || r.data);
}
