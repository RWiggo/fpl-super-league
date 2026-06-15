import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data, error } = await s.from("losing_streaks").select("*").limit(10);
console.log(JSON.stringify(data,null,2)); if(error) console.error(error);
console.log("count:", data?.length);
