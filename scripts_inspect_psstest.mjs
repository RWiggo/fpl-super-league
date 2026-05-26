import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("player_season_stats").select("manager_id,player_id,club,fantasy_points").range(0,9999);
const rows = r.data||[];
console.log("rows:", rows.length);
// per manager distinct
const by={}; for(const x of rows){ by[x.manager_id]=by[x.manager_id]||new Set(); by[x.manager_id].add(x.player_id); }
console.log("distinct:", Object.fromEntries(Object.entries(by).map(([k,v])=>[k,v.size])));
// SUN by manager
const sun={}; for(const x of rows){ if(x.club==="SUN"){ sun[x.manager_id]=(sun[x.manager_id]||0)+Number(x.fantasy_points||0); } }
console.log("SUN points by mgr:", sun);
