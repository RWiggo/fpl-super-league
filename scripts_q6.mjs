import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const tables = ["managers_seasons","manager_season_names","manager_seasonal","season_manager_teams","season_team_names","team_names","manager_aliases","standings","historical_teams"];
for (const t of tables) {
  const r = await s.from(t).select("*").limit(1);
  console.log(t, r.error?.message || Object.keys(r.data[0]||{}));
}
