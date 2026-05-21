import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for(const t of ["player_team_history","player_team_alltime","team_of_the_season","team_legends"]) {
  const r = await s.from(t).select("*").limit(1);
  if(!r.error) console.log(t, Object.keys(r.data?.[0]||{}));
}
