import { createClient } from "@supabase/supabase-js";
const sb = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co", "sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");
// try to find columns by intentional bad insert (won't actually insert because RLS likely)
const tries = ["goals","assists","clean_sheets","points","fpl_points","round","gameweek","minutes","bonus","yellow_cards","red_cards","saves","tournament_id","player_id","manager_id"];
for (const col of tries) {
  const { error } = await sb.from("wc_player_scores").select(col).limit(1);
  console.log(col, error?.message ?? "OK");
}
