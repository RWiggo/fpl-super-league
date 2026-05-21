import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("overall_team_of_the_season").select("season_name,position").limit(500);
const counts={};
for(const x of r.data) counts[x.season_name]=(counts[x.season_name]||0)+1;
console.log(counts);
// any all-time view with player names + season?
for (const t of ["season_player_top_scorers","season_top_players","player_season_meta","season_squad","season_player_summary"]){
  const r2 = await s.from(t).select("*").limit(1);
  if(!r2.error) console.log(t, Object.keys(r2.data?.[0]||{}));
}
