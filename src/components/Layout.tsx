import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase, type Manager, type Season } from "@/lib/supabase";
import { Trophy, Menu, X } from "lucide-react";

export function Layout() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [mst, setMst] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [seasonsOpen, setSeasonsOpen] = useState(false);

  useEffect(() => {
    supabase.from("managers").select("*").then(({ data }) => setManagers(data ?? []));
    supabase.from("seasons").select("*").order("year_start").then(({ data }) => setSeasons(data ?? []));
    supabase.from("manager_season_teams").select("manager_id,team_name,season_id").then(({ data }) => setMst(data ?? []));
  }, []);

  const teamsList = useMemo(() => {
    const latestSeason = new Map<any, number>();
    const latestName = new Map<any, string>();
    for (const r of mst) {
      const prev = latestSeason.get(r.manager_id) ?? -Infinity;
      if (r.season_id > prev) {
        latestSeason.set(r.manager_id, r.season_id);
        latestName.set(r.manager_id, r.team_name);
      }
    }
    return managers
      .map((m) => ({ ...m, displayName: latestName.get(m.id) ?? m.team_name ?? m.name }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [managers, mst]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/history", label: "History" },
    { to: "/fixtures", label: "Fixtures" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Trophy className="w-6 h-6 text-gold group-hover:rotate-12 transition-transform" />
            <span className="font-display text-xl tracking-widest">THE LEAGUE</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium uppercase tracking-wider">
            <Link to="/" className="px-3 py-2 hover:text-gold transition" activeProps={{ className: "text-gold" }} activeOptions={{ exact: true }}>Home</Link>
            <div className="relative" onMouseEnter={() => setTeamsOpen(true)} onMouseLeave={() => setTeamsOpen(false)}>
              <button className="px-3 py-2 hover:text-gold transition">Teams</button>
              {teamsOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 premium-card rounded-md py-2 max-h-96 overflow-auto">
                  {teamsList.map((m) => (
                    <Link key={m.id} to="/team/$managerId" params={{ managerId: m.id }} className="block px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold">
                      {m.displayName}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" onMouseEnter={() => setSeasonsOpen(true)} onMouseLeave={() => setSeasonsOpen(false)}>
              <button className="px-3 py-2 hover:text-gold transition">Seasons</button>
              {seasonsOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 premium-card rounded-md py-2">
                  {seasons.map((s, i) => (
                    <Link key={s.id} to="/season/$seasonId" params={{ seasonId: s.id }} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gold/10 hover:text-gold">
                      <span>{s.name}</span>
                      {i === seasons.length - 1 && <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">LIVE</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/history" className="px-3 py-2 hover:text-gold transition" activeProps={{ className: "text-gold" }}>History</Link>
            <Link to="/fixtures" className="px-3 py-2 hover:text-gold transition" activeProps={{ className: "text-gold" }}>Fixtures</Link>
          </nav>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-sm uppercase tracking-wider hover:text-gold">
                  {l.label}
                </Link>
              ))}
              <details className="border-t border-border/30 pt-2">
                <summary className="py-2 text-sm uppercase tracking-wider cursor-pointer">Teams</summary>
                <div className="pl-4 max-h-60 overflow-auto">
                  {teamsList.map((m) => (
                    <Link key={m.id} to="/team/$managerId" params={{ managerId: m.id }} onClick={() => setOpen(false)} className="block py-1.5 text-sm">{m.displayName}</Link>
                  ))}
                </div>
              </details>
              <details className="border-t border-border/30 pt-2">
                <summary className="py-2 text-sm uppercase tracking-wider cursor-pointer">Seasons</summary>
                <div className="pl-4">
                  {seasons.map((s) => (
                    <Link key={s.id} to="/season/$seasonId" params={{ seasonId: s.id }} onClick={() => setOpen(false)} className="block py-1.5 text-sm">{s.name}</Link>
                  ))}
                </div>
              </details>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/50 mt-20 py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <Trophy className="w-5 h-5 text-gold mx-auto mb-2" />
          <p className="font-display tracking-widest">THE LEAGUE — A FANTASY ARCHIVE</p>
        </div>
      </footer>
    </div>
  );
}
