// Per-manager kit assets and goalkeeper kit color palettes.
// Home kits are real PNGs. GK kits are rendered as SVGs (see GoalkeeperKit.tsx)
// using a complementary colour palette so they pop against the home kit.
import k1 from "@/assets/kits/1_home.png";
import k2 from "@/assets/kits/2_home.png";
import k3 from "@/assets/kits/3_home.png";
import k4 from "@/assets/kits/4_home.png";
import k5 from "@/assets/kits/5_home.png";
import k6 from "@/assets/kits/6_home.png";
import k7 from "@/assets/kits/7_home.png";
import k8 from "@/assets/kits/8_home.png";
import k9 from "@/assets/kits/9_home.png";
import k10 from "@/assets/kits/10_home.png";

export type GkPalette = { primary: string; sleeve: string; trim: string };
export type Kit = { home: string; gk: GkPalette };

export const MANAGER_KITS: Record<string, Kit> = {
  // 1 El Changusto — green/red Mexico vibe → midnight black GK with neon accents
  "1":  { home: k1,  gk: { primary: "#0a0a0a", sleeve: "#f5d922", trim: "#d00e29" } },
  // 2 Charleston Athletic — soft lavender → deep teal GK
  "2":  { home: k2,  gk: { primary: "#0d3b3a", sleeve: "#e8d8f0", trim: "#b5b6d4" } },
  // 3 Wiggo Wanderers — turquoise → magenta GK
  "3":  { home: k3,  gk: { primary: "#c9156d", sleeve: "#1a1a1a", trim: "#01f9c9" } },
  // 4 ALS Ajax — green/black → bright orange GK
  "4":  { home: k4,  gk: { primary: "#d06000", sleeve: "#0a0a0a", trim: "#f5d922" } },
  // 5 Padleys Piranhas — blue/black with red trim → lime green GK
  "5":  { home: k5,  gk: { primary: "#a8e000", sleeve: "#1c1c2e", trim: "#f15a37" } },
  // 6 Jeffrey Schlupp / Fill Her Wycombe — orange Domestos → navy GK with sky panel
  "6":  { home: k6,  gk: { primary: "#0c1d40", sleeve: "#5db8ff", trim: "#964e27" } },
  // 7 Raybould Eagles — white/gold pinstripe → burgundy GK with gold trim
  "7":  { home: k7,  gk: { primary: "#5a0e1f", sleeve: "#c69629", trim: "#f5f0e0" } },
  // 8 Adam All Stars — yellow/purple Lakers → graphite GK with violet trim
  "8":  { home: k8,  gk: { primary: "#1f1233", sleeve: "#9b8cc4", trim: "#f8cf2c" } },
  // 9 Chuck Morris / Lallana Rhoades — orange/black halves → cyan GK
  "9":  { home: k9,  gk: { primary: "#0aa3c4", sleeve: "#0a0a0a", trim: "#f78f1e" } },
  // 10 Send Me Location — UFC red → neon yellow GK with black sleeves
  "10": { home: k10, gk: { primary: "#dfff3a", sleeve: "#0a0a0a", trim: "#e4181c" } },
};

export function getKit(managerId: string | number | undefined | null): Kit | null {
  if (managerId == null) return null;
  return MANAGER_KITS[String(managerId)] ?? null;
}
