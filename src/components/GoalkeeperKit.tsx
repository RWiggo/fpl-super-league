import type { GkPalette } from "@/lib/managerKits";

// Stylised goalkeeper jersey silhouette — long-sleeve, V-neck with chest stripe.
// Colours are driven entirely by the supplied palette so each team gets a
// unique, complementary GK kit.
export function GoalkeeperKit({ palette, className }: { palette: GkPalette; className?: string }) {
  const { primary, sleeve, trim } = palette;
  return (
    <svg viewBox="0 0 100 110" className={className} aria-hidden>
      {/* shadow */}
      <ellipse cx="50" cy="106" rx="28" ry="2" fill="#000" opacity="0.35" />

      {/* left long sleeve */}
      <path d="M 6 22 L 26 12 L 32 30 L 30 70 L 12 72 Z" fill={sleeve} />
      <path d="M 12 70 L 30 68 L 30 76 L 12 78 Z" fill={primary} opacity="0.85" />

      {/* right long sleeve */}
      <path d="M 94 22 L 74 12 L 68 30 L 70 70 L 88 72 Z" fill={sleeve} />
      <path d="M 88 70 L 70 68 L 70 76 L 88 78 Z" fill={primary} opacity="0.85" />

      {/* body */}
      <path
        d="M 26 12 L 40 8 L 50 18 L 60 8 L 74 12 L 72 100 L 28 100 Z"
        fill={primary}
      />

      {/* chest stripe (signature GK band) */}
      <path d="M 28 44 L 72 44 L 71 52 L 29 52 Z" fill={trim} opacity="0.9" />

      {/* V-neck */}
      <path d="M 40 8 L 50 18 L 60 8 L 56 7 L 50 13 L 44 7 Z" fill={trim} />

      {/* hem trim */}
      <rect x="28" y="97" width="44" height="3" fill={trim} opacity="0.85" />

      {/* GK badge */}
      <circle cx="62" cy="30" r="4" fill={trim} />
      <text x="62" y="32.5" textAnchor="middle" fontSize="5" fontWeight="700" fill={primary} fontFamily="ui-sans-serif, system-ui">GK</text>
    </svg>
  );
}
