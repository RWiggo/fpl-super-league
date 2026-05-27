import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
// Check player_team_history columns
const { data: pth } = await sb.from('player_team_history').select('*').limit(2);
console.log('pth cols:', Object.keys(pth?.[0]??{}));
console.log(pth?.[0]);
// Find a name source
const { data: t } = await sb.from('team_of_the_season').select('*').limit(2);
console.log('tots cols:', Object.keys(t?.[0]??{}));
