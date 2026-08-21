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
  "7": {
    // The Raybould Eagles
    slogan: "Rise Together. Soar Forever.",
    stadium: { name: "The Octagon", capacity: "24,500" },
    anthem: { title: "I Believe I Can Fly", artist: "R. Kelly" },
  },
  "10": {
    // Send Me Location
    slogan: "Step In. Stand Tall.",
    stadium: { name: "The Octagon", capacity: "24,500" },
    anthem: { title: "Till I Collapse", artist: "Eminem" },
  },
  "11": {
    // Not Too Xabi FC
    slogan: "Let the Football Sing.",
    stadium: { name: "The Songbround", capacity: "18,240" },
    anthem: { title: "Songbird", artist: "Fleetwood Mac" },
  },
  "6": {
    // Fordy's XI
    slogan: "Stand Tall. Strike First.",
    stadium: { name: "The Nest", capacity: "18,500" },
    anthem: { title: "Pink Flamingos", artist: "Tracy Byrd" },
  },
  "8": {
    // Adam All Stars
    slogan: "Ice in Our Veins. Heart in Our Game. Stars in Our Name.",
    stadium: { name: "Polaris Arena", capacity: "21,500" },
    anthem: { title: "Cold as Ice", artist: "Foreigner" },
  },
};

export function getClubIdentity(managerId: string | number): ClubIdentity | null {
  return CLUB_IDENTITY[String(managerId)] ?? null;
}
