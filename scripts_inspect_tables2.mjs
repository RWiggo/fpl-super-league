import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data } = await s.from("player_team_alltime").select("manager_id,player_name,total_fantasy_points,total_games_played,total_minutes,seasons_played").limit(5);
console.log(JSON.stringify(data,null,2));
// Counts
const { data: all } = await s.from("player_team_alltime").select("manager_id,player_id,total_fantasy_points,total_minutes,total_games_played,seasons_played");
const byMgr = {};
for (const r of all) {
  const m = r.manager_id;
  byMgr[m] = byMgr[m] || { players: 0, totalPts: 0, totalMin: 0, top: null, mostMin: null, mostLoyalSeasons: 0 };
  byMgr[m].players++;
  byMgr[m].totalPts += Number(r.total_fantasy_points||0);
  byMgr[m].totalMin += Number(r.total_minutes||0);
  if (!byMgr[m].top || r.total_fantasy_points > byMgr[m].top.total_fantasy_points) byMgr[m].top = r;
  if (!byMgr[m].mostMin || r.total_minutes > byMgr[m].mostMin.total_minutes) byMgr[m].mostMin = r;
  if (r.seasons_played > byMgr[m].mostLoyalSeasons) byMgr[m].mostLoyalSeasons = r.seasons_played;
}
console.log("manager player counts:");
Object.entries(byMgr).forEach(([m,v])=>console.log(m, "players:", v.players, "topPts:", v.top?.total_fantasy_points, "mostMin:", v.mostMin?.total_minutes));
