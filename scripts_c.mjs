import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// try player table
for (const t of ["player","players","player_master","player_info","player_meta"]) {
  const r = await s.from(t).select("*").limit(1);
  if (!r.error) console.log(t, "->", Object.keys(r.data?.[0]||{}), "rows:", r.data?.length);
  else console.log(t, "err");
}
