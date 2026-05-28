// Premier League club badge URLs from the official PL CDN.
// Badges are served at /badges/{size}/t{optaId}.png at multiple sizes.
// We use 50px which is crisp at the small inline sizes we render.

const PL_CLUB_OPTA_ID: Record<string, number> = {
  // Full names
  arsenal: 3,
  "aston villa": 7,
  bournemouth: 91,
  "afc bournemouth": 91,
  brentford: 94,
  brighton: 36,
  "brighton & hove albion": 36,
  "brighton and hove albion": 36,
  burnley: 90,
  cardiff: 97,
  "cardiff city": 97,
  chelsea: 8,
  "crystal palace": 31,
  everton: 11,
  fulham: 54,
  huddersfield: 38,
  hull: 88,
  ipswich: 40,
  "ipswich town": 40,
  leeds: 2,
  "leeds united": 2,
  leicester: 13,
  "leicester city": 13,
  liverpool: 14,
  luton: 102,
  "luton town": 102,
  "man city": 43,
  "manchester city": 43,
  "man utd": 1,
  "man united": 1,
  "manchester united": 1,
  middlesbrough: 25,
  newcastle: 4,
  "newcastle united": 4,
  norwich: 45,
  "norwich city": 45,
  "nott'm forest": 17,
  "nottingham forest": 17,
  "nottm forest": 17,
  forest: 17,
  "sheff utd": 49,
  "sheffield united": 49,
  southampton: 20,
  stoke: 110,
  sunderland: 56,
  swansea: 80,
  spurs: 6,
  tottenham: 6,
  "tottenham hotspur": 6,
  watford: 57,
  wba: 35,
  "west brom": 35,
  "west bromwich albion": 35,
  "west ham": 21,
  "west ham united": 21,
  wolves: 39,
  wolverhampton: 39,
  "wolverhampton wanderers": 39,
  // 3-letter codes (as stored in player_team_history.club)
  ars: 3,
  avl: 7,
  bou: 91,
  brf: 94,
  bre: 94,
  bha: 36,
  bri: 36,
  bur: 90,
  che: 8,
  cry: 31,
  eve: 11,
  ful: 54,
  ips: 40,
  lee: 2,
  lei: 13,
  liv: 14,
  lut: 102,
  mci: 43,
  mun: 1,
  new: 4,
  not: 17,
  nfo: 17,
  shu: 49,
  sou: 20,
  tot: 6,
  whu: 21,
  wol: 39,
  sun: 56,
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPlClubBadge(clubName?: string | null, size: 25 | 50 | 70 | 100 = 50): string | null {
  if (!clubName) return null;
  const id = PL_CLUB_OPTA_ID[normalize(clubName)];
  if (!id) return null;
  return `https://resources.premierleague.com/premierleague/badges/${size}/t${id}.png`;
}

// Primary brand colours for Premier League clubs, keyed by Opta ID so we
// can reuse the same normalisation as the badge lookup. Values picked to
// match the dominant kit colour each club is most associated with.
const PL_CLUB_COLOR_BY_ID: Record<number, string> = {
  3: "#EF0107",   // Arsenal
  7: "#7A003C",   // Aston Villa
  91: "#DA291C",  // Bournemouth
  94: "#E30613",  // Brentford
  36: "#0057B8",  // Brighton
  90: "#6C1D45",  // Burnley
  97: "#0070B5",  // Cardiff
  8: "#034694",   // Chelsea
  31: "#1B458F",  // Crystal Palace
  11: "#003399",  // Everton
  54: "#000000",  // Fulham
  38: "#0E63AD",  // Huddersfield
  88: "#F18A01",  // Hull
  40: "#3764A3",  // Ipswich
  2: "#FFCD00",   // Leeds
  13: "#003090",  // Leicester
  14: "#C8102E",  // Liverpool
  102: "#F78F1E", // Luton
  43: "#6CABDD",  // Man City
  1: "#DA291C",   // Man Utd
  25: "#E11B22",  // Middlesbrough
  4: "#241F20",   // Newcastle
  45: "#FFF200",  // Norwich
  17: "#DD0000",  // Nottingham Forest
  49: "#EE2737",  // Sheffield United
  20: "#D71920",  // Southampton
  110: "#E03A3E", // Stoke
  56: "#EB172B",  // Sunderland
  80: "#000000",  // Swansea
  6: "#132257",   // Tottenham
  57: "#FBEE23",  // Watford
  35: "#122F67",  // West Brom
  21: "#7A263A",  // West Ham
  39: "#FDB913",  // Wolves
};

export function getPlClubColor(clubName?: string | null): string | null {
  if (!clubName) return null;
  const id = PL_CLUB_OPTA_ID[normalize(clubName)];
  if (!id) return null;
  return PL_CLUB_COLOR_BY_ID[id] ?? null;
}
