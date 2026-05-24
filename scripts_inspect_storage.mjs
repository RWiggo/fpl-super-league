import { createClient } from "@supabase/supabase-js";
const s = createClient("https://ckqfiwcixkzkmdxqyxqq.supabase.co","sb_publishable_iPNkQlWTSlkyCeTC5NFqIg_AYJP_xBV");

// list storage buckets
const { data: buckets, error: be } = await s.storage.listBuckets();
console.log("buckets:", buckets, be);
if (buckets) {
  for (const b of buckets) {
    const { data: files } = await s.storage.from(b.name).list("", { limit: 100 });
    console.log(`--- ${b.name} root ---`, files?.map(f=>f.name));
    // also try common subfolders
    for (const sub of ["badges","kits","season1","season2","season3","season4"]) {
      const { data: sf } = await s.storage.from(b.name).list(sub, { limit: 100 });
      if (sf && sf.length) console.log(`  ${b.name}/${sub}:`, sf.map(f=>f.name));
    }
  }
}
