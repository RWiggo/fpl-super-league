## Goal

Reskin the whole site in a UEFA Champions League aesthetic — deep navy base, silver accents, sharp typography, premium hero treatments — while team pages continue to be individually coloured by each manager's badge. Ship a new "FPL Super League" crest as the league mark.

## 1. New league logo

Generate a modernised crest based on the old wolf shield, in the new navy + silver palette.

- Wolf head + shield silhouette, refined linework, subtle glow
- "FPL" inside the shield, "SUPER LEAGUE" wordmark beneath
- Saved to `src/assets/fpl-super-league-logo.png` (transparent PNG, premium quality for legible type)
- Used in the top nav, footer, hero, and homepage hero block
- Also generate a compact mark-only version for tight spaces / favicon

## 2. Global theme (Champions League — blue & silver)

Rewrite `src/styles.css` tokens:

- `--background`: deep navy (≈ `oklch(0.14 0.04 265)`)
- `--card` / `--popover`: slightly lifted navy with subtle blue tint
- `--foreground`: near-white
- `--primary`: UCL electric blue (`oklch(0.65 0.2 250)`)
- `--accent` / new `--silver`: cool silver (`oklch(0.85 0.02 250)`) replacing the current gold accent
- `--gradient-primary`: navy → blue radial, used on hero backgrounds
- `--gradient-silver`: silver sheen used on headlines and CTAs
- `--shadow-elegant`: blue-tinted soft shadow

Replace gold-specific utilities:

- `.gold-gradient` → keep class name as an alias but point it at the new silver gradient (so existing markup keeps working)
- Add a new `.silver-gradient` and `.ucl-hero` background utility (radial navy + faint star/dot pattern) for hero sections

## 3. Typography

- Keep `Bebas Neue` for display headlines (already loaded, fits sport editorial feel)
- Add `Manrope` for body via Google Fonts in `__root.tsx` (UCL.com uses a similar geometric sans). Replace `Inter` references in Tailwind/`styles.css`.
- Tighten letter-spacing on display text to match UCL's editorial rhythm.

## 4. Layout / navigation

`src/components/Layout.tsx`:

- Top bar: thin dark navy with the new crest on the left, primary nav (Home · History · Fixtures · Teams · Seasons) center/right, all uppercase, tight tracking, blue underline on hover/active
- Add a subtle silver hairline beneath the header
- Footer: navy, crest + small wordmark, sparse links

`src/components/PageHero.tsx`:

- Large dark hero with radial blue glow + faint geometric pattern overlay
- Eyebrow (silver, uppercase, tracked) + huge display title + thin silver hairline divider, matching the UCL "club" page treatment

## 5. Homepage (`src/routes/index.tsx`)

- New full-bleed hero featuring the crest + "The FPL Super League" + tagline
- Reigning champion strip and quick links (History, Fixtures, Teams) styled as UCL-style cards (dark navy panels, silver borders, hover lift)

## 6. Team pages — keep per-badge colouring

Team pages stay individually branded:

- Continue reading `getBranding(managerId).primary` and feed it into a CSS variable `--team-primary` on the page root
- Hero background = radial gradient from `--team-primary` into the new global navy, so each team feels distinct but the chrome (nav, footer, cards) stays UCL navy/silver
- H1, eyebrow accents, stat-card numbers and section dividers keep using `--team-primary`
- The existing badge SVG sits in the hero, larger, with a soft glow in the team's primary colour (UCL club page style)
- Card surfaces, tables, and section borders use the new global navy/silver tokens — not the team colour — so the page reads as part of one consistent product

## 7. Other pages

- `history`, `fixtures`, `season.$seasonId`: swap gold accents for silver, hero treatment for `PageHero`'s new look. No layout changes beyond theming.

## 8. SEO / metadata

- Update root `head()` title to "The FPL Super League"
- Update favicon + apple-touch-icon to the new mark-only logo
- Update OG description to reference the league name

## Technical notes

- All colour changes go through CSS tokens in `src/styles.css`. No hardcoded hex in components.
- `--team-primary` is set inline on the team-page root via `style={{ "--team-primary": branding.primary }}`, so Tailwind arbitrary values like `text-[color:var(--team-primary)]` work.
- `gold` Tailwind colour stays mapped (now to silver) to avoid touching every existing component; new code should prefer `silver` / `primary` semantic tokens.
- Logo generated with `imagegen--generate_image` at premium quality (text legibility), transparent background.
- No data-model changes; this is presentation only.

## Out of scope for this pass

- Real UCL "starball" pattern (we'll use a generic dot/star field to evoke it without copying)
- Dark/light mode toggle (site stays dark, matching UCL.com)
- Per-team typography changes
