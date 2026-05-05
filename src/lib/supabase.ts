import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ckqfiwcixkzkmdxqyxqq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

export type Manager = {
  id: string;
  name: string;
  team_name: string | null;
  logo_url: string | null;
};

export type Season = {
  id: string;
  name: string;
  year_start: number;
  year_end: number;
  champion_manager_id: string | null;
};
