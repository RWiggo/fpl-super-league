import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// h2h check actual columns
const h = await s.from("h2h_records").select("*").or("manager_a_id.eq.8,manager_b_id.eq.8");
console.log("h2h ab:", h.error?.message, h.data?.length);
const h2 = await s.from("h2h_records").select("*").or("manager1_id.eq.8,manager2_id.eq.8");
console.log("h2h 12:", h2.error?.message, h2.data?.length);
