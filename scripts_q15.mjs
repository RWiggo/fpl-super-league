import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
const { data } = await sb.from('team_season_stats_full').select('season_name,manager_name,team_name,total_fpts,out_goals,combined_clean_sheets,out_yellow_cards');
console.log('rows:', data.length);
console.table(data);
