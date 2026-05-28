import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
const { count } = await sb.from('player_team_history').select('*',{count:'exact',head:true});
console.log('pth count:', count);
