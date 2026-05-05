import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageHero } from "@/components/PageHero";
import { Skeleton } from "@/components/StatCard";

export const Route = createFileRoute("/fixtures")({
  component: FixturesPage,
  head: () => ({
    meta: [
      { title: "Fixtures — The League" },
      { name: "description", content: "Every fixture ever played in the league." },
    ],
  }),
});

function FixturesPage() {
  const [d, setD] = useState<any>(null);
  const [seasonId, setSeasonId] = useState("");
  const [managerId, setManagerId] = useState("");
  const [gw, setGw] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("seasons").select("*").order("year_start"),
      supabase.from("managers").select("*").order("name"),
      supabase.from("fixture_records").select("*"),
    ]).then(([s, m, f]) => setD({ seasons: s.data ?? [], managers: m.data ?? [], fixtures: f.data ?? [] }));
  }, []);

  const filtered = useMemo(() => {
    if (!d) return [];
    return d.fixtures
      .filter((f: any) => !seasonId || f.season_id === seasonId)
      .filter((f: any) => !managerId || f.home_manager_id === managerId || f.away_manager_id === managerId)
      .filter((f: any) => !gw || String(f.gameweek) === gw)
      .sort((a: any, b: any) => {
        const sa = d.seasons.find((s: any) => s.id === a.season_id)?.year_start ?? 0;
        const sb = d.seasons.find((s: any) => s.id === b.season_id)?.year_start ?? 0;
        if (sb !== sa) return sb - sa;
        return (b.gameweek ?? 0) - (a.gameweek ?? 0);
      });
  }, [d, seasonId, managerId, gw]);

  if (!d) return <div className="max-w-7xl mx-auto px-4 py-20"><Skeleton className="h-96" /></div>;

  const mById = (id: string) => d.managers.find((m: any) => m.id === id);
  const sById = (id: string) => d.seasons.find((s: any) => s.id === id);

  return (
    <div>
      <PageHero
        kicker="Match Centre"
        title={<><span className="gold-gradient">FIXTURES</span></>}
        subtitle={`${d.fixtures.length} matches across the entire league archive.`}
      />
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)} className="bg-input border border-border rounded px-4 py-3">
            <option value="">All Seasons</option>
            {d.seasons.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="bg-input border border-border rounded px-4 py-3 capitalize">
            <option value="">All Managers</option>
            {d.managers.map((m: any) => <option key={m.id} value={m.id} className="capitalize">{m.name}</option>)}
          </select>
          <input value={gw} onChange={(e) => setGw(e.target.value)} placeholder="Gameweek (e.g. 12)" className="bg-input border border-border rounded px-4 py-3" />
        </div>

        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{filtered.length} fixtures</div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((f: any) => {
            const home = mById(f.home_manager_id);
            const away = mById(f.away_manager_id);
            const homeWin = f.home_score > f.away_score;
            const awayWin = f.away_score > f.home_score;
            return (
              <div key={f.id} className="premium-card rounded-lg p-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  <Link to="/season/$seasonId" params={{ seasonId: f.season_id }} className="hover:text-gold">{sById(f.season_id)?.name}</Link>
                  <span>GW{f.gameweek}</span>
                </div>
                <div className="space-y-2">
                  <div className={`flex items-center justify-between ${homeWin ? "text-gold" : ""}`}>
                    <Link to="/team/$managerId" params={{ managerId: f.home_manager_id }} className="capitalize text-sm hover:underline truncate">{home?.name}</Link>
                    <span className="font-display text-xl tabular-nums">{f.home_score}</span>
                  </div>
                  <div className={`flex items-center justify-between ${awayWin ? "text-gold" : ""}`}>
                    <Link to="/team/$managerId" params={{ managerId: f.away_manager_id }} className="capitalize text-sm hover:underline truncate">{away?.name}</Link>
                    <span className="font-display text-xl tabular-nums">{f.away_score}</span>
                  </div>
                </div>
                {f.margin > 0 && <div className="mt-3 pt-2 border-t border-border/30 text-[10px] uppercase tracking-widest text-muted-foreground">Margin: {f.margin}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
