// Shared country -> ISO 3166-1 alpha-2 (or UK subdivision) code map, used to render
// flags as images via flagcdn.com instead of unicode flag emoji.
//
// Why: flag emoji (especially the England/Scotland/Wales tag-sequence flags, and
// several regional indicator pairs) render inconsistently across platforms - most
// notably Windows desktop browsers, which commonly show the raw two-letter code
// instead of a flag image. Rendering an actual <img> sidesteps this entirely.
export const COUNTRY_ISO: Record<string, string> = {
  Argentina: "ar",
  Austria: "at",
  Belgium: "be",
  Brazil: "br",
  Canada: "ca",
  Colombia: "co",
  Croatia: "hr",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Iran: "ir",
  "Ivory Coast": "ci",
  Japan: "jp",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  "Northern Ireland": "gb-nir",
  Norway: "no",
  Paraguay: "py",
  Portugal: "pt",
  Scotland: "gb-sct",
  Senegal: "sn",
  "South Korea": "kr",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Turkey: "tr",
  Uruguay: "uy",
  USA: "us",
  Wales: "gb-wls",
};

/** Renders a country flag as an image. Falls back to a plain white flag glyph for unknown countries. */
export function FlagImg({
  country,
  className = "w-6 h-auto inline-block align-middle rounded-[2px]",
  title,
}: {
  country: string;
  className?: string;
  title?: string;
}) {
  const code = COUNTRY_ISO[country];
  if (!code) {
    return (
      <span className={className} role="img" aria-label={country}>
        🏳️
      </span>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
      alt={title ?? country}
      title={title ?? country}
      loading="lazy"
      className={className}
    />
  );
}
