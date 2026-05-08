import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase, type Manager, type Season } from "@/lib/supabase";
import { Menu, X, ChevronDown } from "lucide-react";
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

  // UCL-style nav link: bold uppercase, animated underline on hover/active.
  const navItemBase =
    "relative px-4 h-full flex items-center text-[13px] font-bold uppercase tracking-[0.14em] text-white/85 hover:text-white transition-colors";
  const underline =
    "after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[3px] after:bg-gradient-to-r after:from-cyan-400 after:to-blue-500 after:scale-x-0 after:origin-left after:transition-transform";
  const underlineHover = "hover:after:scale-x-100";
  const activeUnderline = "text-white after:scale-x-100";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 text-white border-b border-cyan-500/25 shadow-[0_6px_28px_rgba(0,0,0,0.6)]">
        {/* Distinct UCL-inspired gradient: deep purple → indigo → midnight, set apart from the page's blue body */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,#1a0b3d_0%,#15164a_38%,#0a1850_62%,#040a26_100%)] pointer-events-none" />
        {/* Cyan halo behind logo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_500px_180px_at_8%_50%,rgba(56,189,248,0.22),transparent_70%)] pointer-events-none" />
        {/* Faint star/grid texture for UCL feel */}
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none bg-[radial-gradient(circle_at_25%_30%,#ffffff_0.5px,transparent_1px),radial-gradient(circle_at_70%_60%,#ffffff_0.5px,transparent_1px),radial-gradient(circle_at_45%_80%,#ffffff_0.4px,transparent_1px)] bg-[size:140px_140px,180px_180px,220px_220px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="FPL Super League"
              width={40}
              height={40}
              className="w-10 h-10 group-hover:scale-105 transition-transform drop-shadow-[0_0_18px_rgba(56,189,248,0.55)]"
            />
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/80 mb-0.5">FPL</div>
              <div className="font-display text-base sm:text-lg tracking-[0.22em] font-bold text-white">
                SUPER LEAGUE
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-stretch h-full">
            <Link
              to="/"
              className={`${navItemBase} ${underline} ${underlineHover}`}
              activeProps={{ className: `${navItemBase} ${underline} ${activeUnderline}` }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>

            <div
              className="relative h-full flex items-stretch"
              onMouseEnter={() => setTeamsOpen(true)}
              onMouseLeave={() => setTeamsOpen(false)}
            >
              <button className={`${navItemBase} ${underline} ${underlineHover} ${teamsOpen ? "after:scale-x-100" : ""} gap-1`}>
                Teams
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${teamsOpen ? "rotate-180" : ""}`} />
              </button>
              {teamsOpen && (
                <div className="absolute top-full left-0 w-64 bg-[#0a1130] border border-cyan-500/20 rounded-b-md py-2 max-h-[420px] overflow-auto shadow-2xl shadow-black/50">
                  {teamsList.map((m) => (
                    <Link
                      key={m.id}
                      to="/team/$managerId"
                      params={{ managerId: m.id }}
                      className="block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-white hover:bg-cyan-500/10 border-l-2 border-transparent hover:border-cyan-400 transition-all"
                    >
                      {m.displayName}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div
              className="relative h-full flex items-stretch"
              onMouseEnter={() => setSeasonsOpen(true)}
              onMouseLeave={() => setSeasonsOpen(false)}
            >
              <button className={`${navItemBase} ${underline} ${underlineHover} ${seasonsOpen ? "after:scale-x-100" : ""} gap-1`}>
                Seasons
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${seasonsOpen ? "rotate-180" : ""}`} />
              </button>
              {seasonsOpen && (
                <div className="absolute top-full left-0 w-52 bg-[#0a1130] border border-cyan-500/20 rounded-b-md py-2 shadow-2xl shadow-black/50">
                  {seasons.map((s, i) => (
                    <Link
                      key={s.id}
                      to="/season/$seasonId"
                      params={{ seasonId: s.id }}
                      className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-white hover:bg-cyan-500/10 border-l-2 border-transparent hover:border-cyan-400 transition-all"
                    >
                      <span>{s.name}</span>
                      {i === seasons.length - 1 && (
                        <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold tracking-wider">LIVE</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/history"
              className={`${navItemBase} ${underline} ${underlineHover}`}
              activeProps={{ className: `${navItemBase} ${underline} ${activeUnderline}` }}
            >
              History
            </Link>
            <Link
              to="/fixtures"
              className={`${navItemBase} ${underline} ${underlineHover}`}
              activeProps={{ className: `${navItemBase} ${underline} ${activeUnderline}` }}
            >
              Fixtures
            </Link>
          </nav>

          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded transition"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* Cyan accent strip — UCL signature */}
        <div className="relative h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

        {open && (
          <div className="relative md:hidden border-t border-cyan-500/20 bg-[#070b24]">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white/85 hover:text-cyan-300 border-l-2 border-transparent hover:border-cyan-400 pl-3 transition-all"
                >
                  {l.label}
                </Link>
              ))}
              <details className="border-t border-cyan-500/15 pt-2">
                <summary className="py-2 text-xs font-bold uppercase tracking-[0.18em] cursor-pointer text-white/85">Teams</summary>
                <div className="pl-4 max-h-60 overflow-auto">
                  {teamsList.map((m) => (
                    <Link key={m.id} to="/team/$managerId" params={{ managerId: m.id }} onClick={() => setOpen(false)} className="block py-1.5 text-sm text-white/75 hover:text-cyan-300">
                      {m.displayName}
                    </Link>
                  ))}
                </div>
              </details>
              <details className="border-t border-cyan-500/15 pt-2">
                <summary className="py-2 text-xs font-bold uppercase tracking-[0.18em] cursor-pointer text-white/85">Seasons</summary>
                <div className="pl-4">
                  {seasons.map((s) => (
                    <Link key={s.id} to="/season/$seasonId" params={{ seasonId: s.id }} onClick={() => setOpen(false)} className="block py-1.5 text-sm text-white/75 hover:text-cyan-300">
                      {s.name}
                    </Link>
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
