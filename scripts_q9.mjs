import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');

// 1) Check team_season_stats_full sample
const { data: tss } = await sb.from('team_season_stats_full').select('*').limit(2);
console.log('team_season_stats_full columns:', tss && tss[0] ? Object.keys(tss[0]).slice(0,80) : tss);
console.log('row0:', tss?.[0]);

// 2) Count player_season_stats
let total=0; let from=0;
const seasonsSet = new Set();
const mgrSet = new Set();
const clubSet = new Set();
while (true) {
  const { data, error } = await sb.from('player_season_stats').select('manager_id,season_id,club,player_id').range(from, from+999);
  if (error) { console.log('err',error); break; }
  if (!data || data.length===0) break;
  data.forEach(r=>{ seasonsSet.add(r.season_id); mgrSet.add(r.manager_id); if(r.club) clubSet.add(r.club);});
  total += data.length;
  if (data.length<1000) break;
  from += 1000;
}
console.log('pss rows:', total, 'seasons:', [...seasonsSet], 'managers:', mgrSet.size, 'clubs:', clubSet.size, [...clubSet].sort());

// 3) Specifically check Not Too Xabi (need to find manager)
const { data: mgrs } = await sb.from('managers').select('id,name,team_name');
console.log('mgrs:', mgrs);
