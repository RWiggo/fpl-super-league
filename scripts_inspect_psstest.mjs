import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
let all=[]; let from=0; const sz=1000;
while(true){ const r = await s.from("player_season_stats").select("manager_id,player_id,club,fantasy_points,season_id,out_goals,gk_goals").range(from,from+sz-1); const d=r.data||[]; all=all.concat(d); if(d.length<sz)break; from+=sz; }
console.log("total:", all.length);
const clubs=[...new Set(all.map(r=>r.club))].sort();
console.log("clubs:", clubs);
// per manager distinct players (all seasons)
const byM={}; for(const r of all){ byM[r.manager_id]=byM[r.manager_id]||new Set(); byM[r.manager_id].add(r.player_id); }
console.log("distinct per manager:", Object.fromEntries(Object.entries(byM).map(([k,v])=>[k,v.size])));

// Managers list
const mr = await s.from("managers").select("id,name,team_name");
console.log("managers:", mr.data);

// Padley = manager? Find which
// Season 4 goals: sum out_goals + gk_goals per manager
const s4 = all.filter(r=>r.season_id===4);
const goals={}; for(const r of s4){ goals[r.manager_id]=(goals[r.manager_id]||0)+(r.out_goals||0)+(r.gk_goals||0); }
console.log("season 4 goals by manager:", goals);
