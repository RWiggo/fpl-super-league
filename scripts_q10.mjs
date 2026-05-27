import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');

// Get all pss with pagination
let all=[]; let from=0;
while (true) {
  const { data } = await sb.from('player_season_stats').select('manager_id,player_id,player_name,club,fantasy_points,season_id').range(from, from+999);
  if (!data || !data.length) break;
  all.push(...data);
  if (data.length<1000) break;
  from += 1000;
}
console.log('total', all.length);

// Distinct players per manager
const byMgr = new Map();
for (const r of all) {
  const mid=String(r.manager_id);
  if (!byMgr.has(mid)) byMgr.set(mid, new Set());
  byMgr.get(mid).add(String(r.player_id));
}
const { data: mgrs } = await sb.from('managers').select('id,name');
const nameById = Object.fromEntries(mgrs.map(m=>[String(m.id),m.name]));
const ranked=[...byMgr.entries()].map(([mid,set])=>({mid,name:nameById[mid], count:set.size})).sort((a,b)=>b.count-a.count);
console.log('Distinct players by manager:');
console.table(ranked);

// Check Mark Knight (id 11) specifically — count season participation
const knight = all.filter(r=>String(r.manager_id)==='11');
const seasonsByKnight = new Set(knight.map(r=>r.season_id));
console.log('Knight rows:', knight.length, 'seasons:', [...seasonsByKnight]);
