// Normalize streak rows from views whose schema changed.
// Old shape: { season_name, team_name, streak_start_gw, streak_end_gw, streak_length, manager_name, outcome? }
// New shape: { start_season, end_season, start_gw, end_gw, streak_length, manager_name }
export function normalizeStreaks(rows: any[] | null | undefined): any[] {
  if (!rows) return [];
  return rows.map((r) => {
    if (r && r.season_name && r.streak_start_gw != null) return r;
    const sameSeason = r.start_season === r.end_season;
    return {
      ...r,
      season_name: sameSeason ? r.start_season : `${r.start_season}–${r.end_season}`,
      streak_start_gw: r.start_gw,
      streak_end_gw: r.end_gw,
      start_season: r.start_season,
      end_season: r.end_season,
    };
  });
}

// Returns rows whose streak touched the given season name.
export function filterStreaksForSeason(rows: any[] | null | undefined, sname: string): any[] {
  if (!rows) return [];
  return rows.filter((r) => {
    if (r.season_name && !r.start_season) return r.season_name === sname;
    return r.start_season === sname || r.end_season === sname;
  }).map((r) => {
    if (r.season_name && !r.start_season) return r;
    const start_gw = r.start_season === sname ? r.start_gw : 1;
    const end_gw = r.end_season === sname ? r.end_gw : 38;
    return {
      ...r,
      season_name: sname,
      streak_start_gw: start_gw,
      streak_end_gw: end_gw,
    };
  });
}
