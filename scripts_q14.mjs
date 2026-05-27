import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
// Try a players table
for (const t of ['players','player','fpl_players']) {
  const { data, error } = await sb.from(t).select('*').limit(1);
  console.log(t, error?.message, data?.[0]);
}
