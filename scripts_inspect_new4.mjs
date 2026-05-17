import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data } = await s.from("team_of_the_season").select("*").limit(3);
console.log("tots:", JSON.stringify(data,null,2));
