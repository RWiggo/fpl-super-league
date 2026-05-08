import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase, type Manager, type Season } from "@/lib/supabase";
import { Menu, X } from "lucide-react";
import logo from "@/assets/fpl-super-league-logo.png";

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
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/85 border-b border-silver/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="FPL Super League"
              width={40}
              height={40}
              className="w-9 h-9 group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(80,140,255,0.4)]"
            />
            <span className="font-display text-lg sm:text-xl tracking-[0.18em] leading-none">
              <span className="text-foreground">FPL</span>{" "}
              <span className="silver-gradient">SUPER LEAGUE</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em]">
            <Link to="/" className="px-3 py-2 hover:text-primary transition" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>Home</Link>
            <div className="relative" onMouseEnter={() => setTeamsOpen(true)} onMouseLeave={() => setTeamsOpen(false)}>
              <button className="px-3 py-2 hover:text-primary transition">Teams</button>
              {teamsOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 premium-card rounded-md py-2 max-h-96 overflow-auto">
                  {teamsList.map((m) => (
                    <Link key={m.id} to="/team/$managerId" params={{ managerId: m.id }} className="block px-4 py-2 text-xs hover:bg-primary/10 hover:text-primary">
                      {m.displayName}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" onMouseEnter={() => setSeasonsOpen(true)} onMouseLeave={() => setSeasonsOpen(false)}>
              <button className="px-3 py-2 hover:text-primary transition">Seasons</button>
              {seasonsOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 premium-card rounded-md py-2">
                  {seasons.map((s, i) => (
                    <Link key={s.id} to="/season/$seasonId" params={{ seasonId: s.id }} className="flex items-center justify-between px-4 py-2 text-xs hover:bg-primary/10 hover:text-primary">
                      <span>{s.name}</span>
                      {i === seasons.length - 1 && <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">LIVE</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/history" className="px-3 py-2 hover:text-primary transition" activeProps={{ className: "text-primary" }}>History</Link>
            <Link to="/fixtures" className="px-3 py-2 hover:text-primary transition" activeProps={{ className: "text-primary" }}>Fixtures</Link>
          </nav>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {/* silver hairline accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-silver/30 to-transparent" />

        {open && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-xs uppercase tracking-[0.18em] hover:text-primary">
                  {l.label}
                </Link>
              ))}
              <details className="border-t border-border/30 pt-2">
                <summary className="py-2 text-xs uppercase tracking-[0.18em] cursor-pointer">Teams</summary>
                <div className="pl-4 max-h-60 overflow-auto">
                  {teamsList.map((m) => (
                    <Link key={m.id} to="/team/$managerId" params={{ managerId: m.id }} onClick={() => setOpen(false)} className="block py-1.5 text-sm">{m.displayName}</Link>
                  ))}
                </div>
              </details>
              <details className="border-t border-border/30 pt-2">
                <summary className="py-2 text-xs uppercase tracking-[0.18em] cursor-pointer">Seasons</summary>
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

      <footer className="border-t border-silver/20 mt-20 py-10 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">
          <img src={logo} alt="FPL Super League" width={40} height={40} className="w-10 h-10 opacity-80" loading="lazy" />
          <p className="font-display tracking-[0.3em] text-foreground/80">THE FPL SUPER LEAGUE</p>
          <p className="text-xs tracking-widest uppercase">A Fantasy Archive</p>
        </div>
      </footer>
    </div>
  );
}
