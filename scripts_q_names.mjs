import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
const { data: pss } = await sb.from('player_season_stats').select('*').limit(2);
console.log('pss cols:', Object.keys(pss[0]));
console.log('row:', pss[0]);
const { data: pth } = await sb.from('player_team_history').select('*').limit(2);
console.log('pth cols:', Object.keys(pth[0]));
console.log('pth row:', pth[0]);
