import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const candidates = ["manager_team_seasons","team_seasons","season_teams","manager_branding","team_branding","branding","manager_assets","team_assets","kits","badges","logos","season_assets","team_kit_history"];
for (const t of candidates) {
  const { data, error } = await s.from(t).select("*").limit(3);
  console.log("=",t,"=", error?error.message:JSON.stringify(data));
}
