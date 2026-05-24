import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");

// Try common bucket names directly
for (const name of ["badges","kits","assets","public","season-assets","manager-assets","team-badges","team-kits"]) {
  const { data, error } = await s.storage.from(name).list("", { limit: 200 });
  if (error) { console.log(name, "ERR", error.message); continue; }
  console.log(`=== ${name} (root) ===`, data.map(f=>f.name));
  for (const f of data) {
    if (f.id === null || !f.metadata) { // folder
      const { data: sf } = await s.storage.from(name).list(f.name, { limit: 200 });
      console.log(`  ${name}/${f.name}:`, sf?.map(x=>x.name));
      for (const sub of sf ?? []) {
        if (!sub.metadata) {
          const { data: ssf } = await s.storage.from(name).list(`${f.name}/${sub.name}`, { limit: 200 });
          console.log(`    ${name}/${f.name}/${sub.name}:`, ssf?.map(x=>x.name));
        }
      }
    }
  }
}
