// Shared client-side metadata for the World Cup edition.
// Participant rows live in `wc_participants` in Supabase, but we keep a
// fallback list here so the page still renders meaningfully before any
// data exists.

export const WC_PARTICIPANT_FALLBACK: Array<{
  manager_id: number;
  nation_name: string;
  flag_emoji: string;
  primary_color: string;
  secondary_color: string;
  group_name: string;
}> = [
  { manager_id: 1,  nation_name: "El Changusto",        flag_emoji: "🇲🇽", primary_color: "#006847", secondary_color: "#CE1126", group_name: "A" },
  { manager_id: 2,  nation_name: "Charleston Athletic", flag_emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primary_color: "#1B458F", secondary_color: "#FFFFFF", group_name: "A" },
  { manager_id: 3,  nation_name: "Wiggo Wanderers",     flag_emoji: "🇦🇷", primary_color: "#75AADB", secondary_color: "#FFFFFF", group_name: "A" },
  { manager_id: 4,  nation_name: "ALS Ajax",            flag_emoji: "🇨🇮", primary_color: "#FF8200", secondary_color: "#009E60", group_name: "B" },
  { manager_id: 5,  nation_name: "Padleys Piranhas",    flag_emoji: "🇩🇪", primary_color: "#FFCE00", secondary_color: "#DD0000", group_name: "B" },
  { manager_id: 6,  nation_name: "Fill Her Wycombe FC", flag_emoji: "🇧🇪", primary_color: "#FDDA24", secondary_color: "#ED2939", group_name: "B" },
  { manager_id: 7,  nation_name: "Raybould Eagles",     flag_emoji: "🇺🇸", primary_color: "#B22234", secondary_color: "#3C3B6E", group_name: "C" },
  { manager_id: 8,  nation_name: "Adam All Stars",      flag_emoji: "🇧🇷", primary_color: "#009C3B", secondary_color: "#FFDF00", group_name: "C" },
  { manager_id: 10, nation_name: "Send Me Location",    flag_emoji: "🇫🇷", primary_color: "#0055A4", secondary_color: "#EF4135", group_name: "C" },
  { manager_id: 11, nation_name: "Not Too Xabi FC",     flag_emoji: "🇪🇸", primary_color: "#AA151B", secondary_color: "#F1BF00", group_name: "C" },
];

export type WcParticipant = (typeof WC_PARTICIPANT_FALLBACK)[number];

// Maroon & gold theme tokens used across the World Cup pages.
export const WC_THEME = {
  maroon: "#8A1538",
  maroonDeep: "#5A0E25",
  maroonInk: "#2A0612",
  gold: "#D4AF37",
  goldBright: "#F2D472",
  cream: "#F8F1E1",
};
