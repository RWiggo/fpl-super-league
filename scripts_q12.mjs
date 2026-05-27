import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
const { data, error } = await sb.from('player_season_stats').select('manager_id,player_id,player_name,club,fantasy_points,season_id').range(0, 5);
console.log('err', error, 'rows', data?.length);
console.log(data);
