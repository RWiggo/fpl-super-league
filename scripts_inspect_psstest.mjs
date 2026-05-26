import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// total rows
const { count } = await s.from("player_season_stats").select("*",{count:"exact",head:true});
console.log("total rows:", count);
// fetch all with pagination
let all=[]; let from=0; const sz=1000;
while(true){ const {data}=await s.from("player_season_stats").select("manager_id,manager_name,player_id,club,fantasy_points,season_id").range(from,from+sz-1); if(!data||!data.length)break; all=all.concat(data); if(data.length<sz)break; from+=sz; }
console.log("fetched:", all.length);
const clubs=[...new Set(all.map(r=>r.club))].sort();
console.log("clubs:", clubs);
// per manager distinct players
const byM={};
for(const r of all){ const k=r.manager_name||r.manager_id; byM[k]=byM[k]||new Set(); byM[k].add(r.player_id); }
console.log("distinct per manager:", Object.fromEntries(Object.entries(byM).map(([k,v])=>[k,v.size])));
// Padleys Piranhas - find manager and season 4
const padley = all.filter(r=>String(r.manager_name||'').toLowerCase().includes('padley') || String(r.manager_name||'').toLowerCase().includes('piranha'));
console.log("padley rows sample:", padley.slice(0,3), "count:", padley.length);
