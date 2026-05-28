import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
async function all(t, sel) {
  const out=[]; let f=0;
  while(true){ const {data}=await sb.from(t).select(sel).range(f,f+999); if(!data||!data.length)break; out.push(...data); if(data.length<1000)break; f+=1000; }
  return out;
}
const [pss, pth, mgrs, seasons] = await Promise.all([
  all('player_season_stats','manager_id,season_id,player_id,position,club,fantasy_points'),
  all('player_team_history','manager_name,season_name,player_name,position,club,fantasy_points'),
  all('managers','id,name'),
  all('seasons','id,name'),
]);
const mn = new Map(mgrs.map(m=>[String(m.id),m.name]));
const sn = new Map(seasons.map(s=>[String(s.id),s.name]));
const idx = new Map();
for (const p of pth) {
  const k = `${p.manager_name}|${p.season_name}|${p.club}|${p.position}|${p.fantasy_points}`;
  if(!idx.has(k)) idx.set(k,[]);
  idx.get(k).push(p.player_name);
}
let total=0, matched=0, ambiguous=0;
const unmatchedSamples=[];
for (const r of pss) {
  total++;
  const k = `${mn.get(String(r.manager_id))}|${sn.get(String(r.season_id))}|${r.club}|${r.position}|${r.fantasy_points}`;
  const v = idx.get(k);
  if (v && v.length===1) matched++;
  else if (v && v.length>1) ambiguous++;
  else if (unmatchedSamples.length<10) unmatchedSamples.push({k, r});
}
console.log({total, matched, ambiguous, unmatched: total-matched-ambiguous});
console.log('samples', unmatchedSamples);

// Check distinct pth player_names per same composite without fantasy_points (in case it's slightly off)
let recoverable=0;
const idx2 = new Map();
for (const p of pth) {
  const k = `${p.manager_name}|${p.season_name}|${p.club}|${p.position}`;
  if(!idx2.has(k)) idx2.set(k,new Set());
  idx2.get(k).add(p.player_name);
}
for (const s of unmatchedSamples) {
  const k = `${mn.get(String(s.r.manager_id))}|${sn.get(String(s.r.season_id))}|${s.r.club}|${s.r.position}`;
  console.log('alt for', s.r.player_id, k, '->', [...(idx2.get(k)||[])]);
}
