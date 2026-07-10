// Current (Season 4) team names, overriding stale managers.team_name values.
export const CURRENT_TEAM_NAMES: Record<string, string> = {
  "1": "El Changusto",
  "2": "Charleston Athletic",
  "3": "Wiggo Wanderers",
  "4": "ALS Ajax",
  "5": "Padleys Piranhas",
  "6": "Fordys XI",
  "7": "The 2aybould Eagles",
  "8": "Adam All Stars",
  "9": "Power Reijnders FC",
  "10": "Send Me Location",
  "11": "Not Too Xabi FC",
  "12": "Average Team",
  "13": "SW8 Gunners",
};

export function currentTeamName(
  managerId: string | number | null | undefined,
  fallback?: string | null,
): string {
  if (managerId == null) return fallback ?? "-";
  return CURRENT_TEAM_NAMES[String(managerId)] ?? fallback ?? "-";
}
