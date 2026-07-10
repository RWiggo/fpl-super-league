// Manager-specific branding: imported badge SVGs + primary brand color.
// Primary color is applied to the team page hero accent (overrides --gold locally).
import b1 from "@/assets/badges/1.png";
import b2 from "@/assets/badges/2.png";
import b3 from "@/assets/badges/3.png";
import b4 from "@/assets/badges/4.png";
import b5 from "@/assets/badges/5.png";
import b6 from "@/assets/badges/6.svg";
import b7 from "@/assets/badges/7.png";
import b8 from "@/assets/badges/8.png";
import b9 from "@/assets/badges/9.svg";
import b10 from "@/assets/badges/10.png";
import b11 from "@/assets/badges/11.png";
import b12 from "@/assets/badges/12.svg";
import b13 from "@/assets/badges/13.png";

export type Branding = { badge: string; primary: string; primaryFg?: string };

// Keys are manager IDs (as strings, since route params are strings).
export const MANAGER_BRANDING: Record<string, Branding> = {
  "1":  { badge: b1,  primary: "#5EA36A" },                              // El Changusto - green
  "2":  { badge: b2,  primary: "#4A3A73" },                              // Charleston Athletic
  "3":  { badge: b3,  primary: "#01f9c9", primaryFg: "#0a0a0a" },        // Wiggo Wanderers
  "4":  { badge: b4,  primary: "#16331A" },                              // ALS Ajax - Deep forest green
  "5":  { badge: b5,  primary: "#A5121A" },                              // Padleys Piranhas - Deep Red
  "6":  { badge: b6,  primary: "#964e27" },                              // Fill Her Wycombe
  "7":  { badge: b7,  primary: "#6F1D3A" },                              // Raybould Eagles - Claret
  "8":  { badge: b8,  primary: "#E5B91F", primaryFg: "#0a0a0a" },        // Adam All Stars - Yellow
  "9":  { badge: b9,  primary: "#ff7a00" },                              // Jake Toyer - Orange
  "10": { badge: b10, primary: "#0E2A63" },                              // Send Me Location - Navy
  "11": { badge: b11, primary: "#0F2D63" },                              // Not Too Xabi FC - navy
  "12": { badge: b12, primary: "#f5f5f5", primaryFg: "#0a0a0a" },        // Average Team - White
  "13": { badge: b13, primary: "#6E2320" },                              // SW8 Gunners - Deep claret
};

export function getBranding(managerId: string | number): Branding | null {
  return MANAGER_BRANDING[String(managerId)] ?? null;
}
