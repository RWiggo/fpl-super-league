import { createClient } from "@supabase/supabase-js";
const sb = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co", "sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["wc_tournaments","wc_teams","wc_players","wc_squads","wc_player_scores","wc_standings","wc_round_standings","wc_player_leaderboard"]) {
  const { data, error } = await sb.from(t).select("*").limit(3);
  console.log("===", t, error?.message ?? "");
  console.log(JSON.stringify(data, null, 2));
}
