// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
//
// This project deploys on Vercel, not Cloudflare - the shared Lovable config defaults to
// a Cloudflare Workers build target (`cloudflare-module` nitro preset), which produces
// wrangler.json/Cloudflare-formatted server output that Vercel's platform can't route to,
// resulting in a platform-level 404 NOT_FOUND on every request. Overriding the nitro
// preset to `vercel` makes the build target Vercel's Build Output API instead.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: { preset: "vercel" },
});
