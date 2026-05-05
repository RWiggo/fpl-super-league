type Player = {
  player_name?: string;
  name?: string;
  position: string;
  club?: string;
  fantasy_points?: number;
  total_fantasy_points?: number;
  avg_points_per_game?: number;
  ppg?: number;
  manager_id?: string;
};

export function FormationPitch({ players, getManagerName }: { players: Player[]; getManagerName?: (id: string) => string }) {
  const gks = players.filter((p) => p.position === "GK" || p.position === "GKP");
  const defs = players.filter((p) => p.position === "DEF");
  const mids = players.filter((p) => p.position === "MID");
  const fwds = players.filter((p) => p.position === "FWD");

  const rows = [gks, defs, mids, fwds];

  return (
    <div className="relative w-full aspect-[2/3] sm:aspect-[3/4] max-w-2xl mx-auto rounded-xl overflow-hidden premium-card">
      {/* Pitch */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 150" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pitch" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.32 0.1 145)" />
            <stop offset="50%" stopColor="oklch(0.28 0.1 145)" />
            <stop offset="100%" stopColor="oklch(0.32 0.1 145)" />
          </linearGradient>
          <pattern id="stripes" width="10" height="15" patternUnits="userSpaceOnUse">
            <rect width="10" height="15" fill="url(#pitch)" />
            <rect width="10" height="7.5" fill="oklch(0 0 0 / 8%)" />
          </pattern>
        </defs>
        <rect width="100" height="150" fill="url(#stripes)" />
        <rect x="2" y="2" width="96" height="146" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.4" />
        <line x1="2" y1="75" x2="98" y2="75" stroke="white" strokeOpacity="0.5" strokeWidth="0.4" />
        <circle cx="50" cy="75" r="9" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.4" />
        <rect x="25" y="2" width="50" height="18" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.4" />
        <rect x="25" y="130" width="50" height="18" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.4" />
        <rect x="38" y="2" width="24" height="7" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.4" />
        <rect x="38" y="141" width="24" height="7" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="0.4" />
      </svg>

      <div className="absolute inset-0 flex flex-col justify-around p-2">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-around">
            {row.map((p, j) => (
              <PlayerChip key={j} player={p} managerName={p.manager_id && getManagerName ? getManagerName(p.manager_id) : undefined} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerChip({ player, managerName }: { player: Player; managerName?: string }) {
  const points = player.total_fantasy_points ?? player.fantasy_points ?? 0;
  const ppg = player.ppg ?? player.avg_points_per_game;
  return (
    <div className="bg-background/85 backdrop-blur-sm border border-gold/40 rounded px-2 py-1.5 text-center min-w-[70px] max-w-[110px] shadow-lg">
      <div className="text-[10px] sm:text-xs font-medium truncate">{player.player_name ?? player.name}</div>
      {player.club && <div className="text-[8px] uppercase tracking-wider text-muted-foreground truncate">{player.club}</div>}
      <div className="text-xs sm:text-sm font-display text-gold">{Number(points).toFixed(0)}</div>
      {ppg != null && <div className="text-[8px] text-muted-foreground">{Number(ppg).toFixed(1)} ppg</div>}
      {managerName && <div className="text-[8px] uppercase tracking-wider text-gold/80 truncate mt-0.5">{managerName}</div>}
    </div>
  );
}
