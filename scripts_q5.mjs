import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const m = await s.from("managers").select("id,name,team_name").order("id");
console.log(m.data);
const tables = ["manager_seasons","manager_team_names","season_teams","season_managers"];
for (const t of tables) {
  const r = await s.from(t).select("*").limit(1);
  console.log(t, r.error?.message || Object.keys(r.data[0]||{}));
}
