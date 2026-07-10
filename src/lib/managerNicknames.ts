// Team nicknames keyed by manager id.
export const MANAGER_NICKNAMES: Record<string, string> = {
  "1": "The Monkeys",          // El Changusto
  "2": "The Crows",            // Charleston Athletic
  "3": "The Penguins",         // Wiggo Wanderers
  "4": "The Leprechauns",      // ALS Ajax
  "5": "The Piranhas",         // Padleys Piranhas
  "6": "The Flamingos",       // Fordys XI
  "7": "The Eagles",           // Raybould Eagles
  "8": "The Polar Bears",      // Adam All Stars
  "9": "The Hatters",          // Lallana Rhoades
  "10": "The Brawlers",        // Send Me Location
  "11": "The Thrushes",        // Not Too Xabi FC
  "12": "The Averages",        // Average Team
  "13": "The Gunners",         // SW8 Gunners
};

export function getNickname(managerId: string | number): string | null {
  return MANAGER_NICKNAMES[String(managerId)] || null;
}
