import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["player_season_stats_view","player_season_full","season_player_stats","manager_season_squad","team_season_players","squad_season","player_season_summary"]) {
  const r = await s.from(t).select("*").limit(1);
  if (!r.error) console.log(t, "->", Object.keys(r.data?.[0]||{}));
}
