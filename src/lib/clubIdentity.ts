// Club identity details from each team's branding sheet: slogan, home
// ground (+ capacity), and matchday anthem. Keyed by manager id. Any team
// without an entry here simply omits that part of the team page - fill
// these in as branding sheets are produced for the rest of the league.
export type ClubIdentity = {
  slogan?: string;
  stadium?: { name: string; capacity?: string };
  anthem?: { title: string; artist?: string };
};

export const CLUB_IDENTITY: Record<string, ClubIdentity> = {
  "5": {
    // Padleys Piranhas
    slogan: "Bite First. Break Lines.",
    stadium: { name: "The Feeding Grounds", capacity: "18,000" },
    anthem: { title: "Shark in the Water", artist: "V V Brown" },
  },
  "13": {
    // SW8 Gunners
    slogan: "Victory Through Unity.",
    stadium: { name: "The Battersea Fortress, Battersea, London", capacity: "24,000" },
    anthem: { title: "The World Is Yours", artist: "Nas" },
  },
};

export function getClubIdentity(managerId: string | number): ClubIdentity | null {
  return CLUB_IDENTITY[String(managerId)] ?? null;
}
