// Manager-specific branding: imported badge SVGs + primary brand color.
// Primary color is applied to the team page hero accent (overrides --gold locally).
import b1 from "@/assets/badges/1.svg";
import b2 from "@/assets/badges/2.svg";
import b4 from "@/assets/badges/4.svg";
import b5 from "@/assets/badges/5.svg";
import b6 from "@/assets/badges/6.svg";
import b8 from "@/assets/badges/8.svg";
import b9 from "@/assets/badges/9.svg";
import b10 from "@/assets/badges/10.svg";
import b11 from "@/assets/badges/11.svg";
import b12 from "@/assets/badges/12.svg";

export type Branding = { badge: string; primary: string; primaryFg?: string };

// Keys are manager IDs (as strings, since route params are strings).
export const MANAGER_BRANDING: Record<string, Branding> = {
  "1":  { badge: b1,  primary: "#d00e29" },                       // El Changusto
  "2":  { badge: b2,  primary: "#b5b6d4", primaryFg: "#0a0a0a" }, // Charleston Athletic
  "4":  { badge: b4,  primary: "#d06000" },                       // ALS Ajax
  "5":  { badge: b5,  primary: "#f15a37" },                       // Padleys Piranhas
  "6":  { badge: b6,  primary: "#964e27" },                       // Fill Her Wycombe
  "8":  { badge: b8,  primary: "#f8cf2c", primaryFg: "#0a0a0a" }, // Adam All Stars
  "9":  { badge: b9,  primary: "#f78f1e" },                       // Lallana Rhoades (orange on navy)
  "10": { badge: b10, primary: "#e4181c" },                       // Send Me Location
  "11": { badge: b11, primary: "#5f821d" },                       // Not Too Xabi FC
  "12": { badge: b12, primary: "#ff3131" },                       // Average Team
};

export function getBranding(managerId: string | number): Branding | null {
  return MANAGER_BRANDING[String(managerId)] ?? null;
}
