import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const r = await s.from("manager_adjusted_fpl_points").select("*");
console.log(JSON.stringify(r.data,null,2)); console.error(r.error);
