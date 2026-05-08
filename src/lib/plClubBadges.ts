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
  liverpool: 10,
  luton: 163,
  "luton town": 163,
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
  liv: 10,
  lut: 163,
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
