import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["team_badges_resolved","team_kits"]) {
  const { data, error } = await s.from(t).select("*").limit(50);
  console.log("===",t,"===", error?error.message:"");
  if (data) { console.log("rows:", data.length); console.log(data.slice(0,4)); }
}
