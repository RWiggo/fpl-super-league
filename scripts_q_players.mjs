import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ckqfiwcixkzkmdxqyxqq.supabase.co','sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV');
for (const t of ['players','player','player_info','player_names','player_master']) {
  const { data, error } = await sb.from(t).select('*').limit(2);
  console.log(t, error?.message ?? Object.keys(data?.[0]||{}), data?.[0]);
}
