import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["win_streaks","losing_streaks","unbeaten_streaks","winless_streaks"]) {
  const { data, error } = await s.from(t).select("*").limit(2);
  console.log(t, error?.message ?? "");
  console.log(JSON.stringify(data,null,2));
}
