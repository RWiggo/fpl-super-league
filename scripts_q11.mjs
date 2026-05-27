import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
const { data, error } = await sb.from('player_season_stats').select('*').limit(2);
console.log('err', error);
console.log('cols', data && data[0] ? Object.keys(data[0]) : data);
console.log('row', data?.[0]);
const { count } = await sb.from('player_season_stats').select('*',{count:'exact', head:true});
console.log('total count:', count);
