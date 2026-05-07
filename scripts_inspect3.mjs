import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["winless_streaks","losing_streaks","loss_streaks","player_club_alltime","player_history","fixture_records"]) {
  const r = await s.from(t).select("*").limit(1);
  console.log(t, r.error ? r.error.message : Object.keys(r.data[0]||{}));
}
// Sample unbeaten/winless top
const u = await s.from("unbeaten_streaks").select("*").eq("manager_name","Adam Wiggins").order("streak_length",{ascending:false}).limit(3);
console.log("unbeaten Adam:", u.data, u.error?.message);
const w = await s.from("win_streaks").select("*").eq("manager_name","Adam Wiggins");
console.log("win_streaks Adam:", w.data?.length, "samples", w.data?.slice(0,3));
