import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co", "sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
const { data, error } = await s.from("managers").select("id, name, team_name").order("id");
console.log(error || data);
