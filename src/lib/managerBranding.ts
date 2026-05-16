// Manager-specific branding: imported badge SVGs + primary brand color.
// Primary color is applied to the team page hero accent (overrides --gold locally).
import b1 from "@/assets/badges/1.svg";
import b2 from "@/assets/badges/2.svg";
import b3 from "@/assets/badges/3.svg";
import b4 from "@/assets/badges/4.svg";
import b5 from "@/assets/badges/5.svg";
import b6 from "@/assets/badges/6.svg";
import b7 from "@/assets/badges/7.svg";
import b8 from "@/assets/badges/8.svg";
import b9 from "@/assets/badges/9.svg";
import b10 from "@/assets/badges/10.svg";
import b11 from "@/assets/badges/11.svg";
import b12 from "@/assets/badges/12.svg";

export type Branding = { badge: string; primary: string; primaryFg?: string };

// Keys are manager IDs (as strings, since route params are strings).
export const MANAGER_BRANDING: Record<string, Branding> = {
  "1":  { badge: b1,  primary: "#0a5c2e" },                              // El Changusto — darker green
  "2":  { badge: b2,  primary: "#b5b6d4", primaryFg: "#0a0a0a" },        // Charleston Athletic
  "3":  { badge: b3,  primary: "#01f9c9", primaryFg: "#0a0a0a" },        // Wiggo Wanderers
  "4":  { badge: b4,  primary: "#169b62" },                              // ALS Ajax — Irish green
  "5":  { badge: b5,  primary: "#8a0d10" },                              // Padleys Piranhas — Deep Red
  "6":  { badge: b6,  primary: "#964e27" },                              // Fill Her Wycombe
  "7":  { badge: b7,  primary: "#d4af37", primaryFg: "#0a0a0a" },        // Ryans Lions — Gold
  "8":  { badge: b8,  primary: "#f8cf2c", primaryFg: "#0a0a0a" },        // Adam All Stars — Yellow
  "9":  { badge: b9,  primary: "#ff7a00" },                              // Jake Toyer — Orange
  "10": { badge: b10, primary: "#e4181c" },                              // Send Me Location
  "11": { badge: b11, primary: "#0b1530" },                              // Not Too Xabi FC — almost black blue
  "12": { badge: b12, primary: "#f5f5f5", primaryFg: "#0a0a0a" },        // Average Team — White
};

export function getBranding(managerId: string | number): Branding | null {
  return MANAGER_BRANDING[String(managerId)] ?? null;
}
