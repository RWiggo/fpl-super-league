import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
for (const t of ["player_team_history","team_of_the_season","h2h_records","fixture_records","managers"]) {
  const { data, error, count } = await s.from(t).select("*",{count:"exact"}).limit(2);
  console.log("===",t, "count=", count, "===");
  if (error) console.log("ERR", error.message);
  else console.log(JSON.stringify(data,null,2));
}
// TOTS counts per manager
const { data: tots } = await s.from("team_of_the_season").select("manager_name, season_name");
const byMgr = {};
tots?.forEach(t=>{ byMgr[t.manager_name]=(byMgr[t.manager_name]??0)+1; });
console.log("TOTS counts:", byMgr);
console.log("TOTS season_name distinct:", [...new Set(tots?.map(t=>t.season_name))]);
console.log("TOTS rows:", tots?.length);
