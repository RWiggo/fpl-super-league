import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// brute-force possible names
for (const t of ["fpl_players","fpl_player","player_lookup","player_names","player_master","epl_players","pl_players"]){
  const r = await s.from(t).select("*").limit(1);
  if(!r.error) console.log(t, Object.keys(r.data?.[0]||{}));
}
