import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/rules/scoring")({
  component: ScoringPage,
  head: () => ({
    meta: [
      { title: "Point Scoring System | FPL Super League" },
      { name: "description", content: "The full position-by-position point scoring breakdown used across the league." },
    ],
  }),
});

type Row = { label: string; value: string; was?: string; note?: string };

const CORE: Record<string, Row[]> = {
  GK: [
    { label: "Goal", value: "15", was: "Was 13 last season" },
    { label: "Assist (Official)", value: "8", note: "Assists last year were all worth the same" },
    { label: "Assist (Fantasy)", value: "5" },
    { label: "Penalty Save", value: "8" },
    { label: "Clean Sheet", value: "5" },
    { label: "Key Pass (leading directly to shot)", value: "4" },
    { label: "Game Won", value: "3" },
    { label: "Penalty Won", value: "3", was: "Was 2 last season" },
    { label: "Save", value: "2", was: "Was 1 last season" },
    { label: "Interception", value: "2" },
    { label: "Shot on Target", value: "2" },
    { label: "Successful Tackle", value: "2" },
    { label: "Named in Starting 11", value: "1" },
    { label: "Played 60+ Minutes", value: "1" },
    { label: "Game Tied", value: "1" },
    { label: "Subbed On", value: "1" },
    { label: "Accurate Crosses", value: "1" },
    { label: "Successful Dribble", value: "1" },
    { label: "Dispossessed", value: "-1" },
    { label: "Error Leading to Goal", value: "-3" },
    { label: "Yellow Card", value: "-3" },
    { label: "Goal Conceded", value: "-2" },
    { label: "Penalty Missed", value: "-8" },
    { label: "Red Card", value: "-7", note: "Awarded back if rescinded" },
    { label: "Own Goal", value: "-10", was: "Was -9 last season" },
  ],
  DEF: [
    { label: "Goal", value: "14", was: "Was 13 last season" },
    { label: "Assist (Official)", value: "8", note: "Assists last year were all worth the same" },
    { label: "Assist (Fantasy)", value: "5" },
    { label: "Clean Sheet", value: "5" },
    { label: "Big Chance Created", value: "4" },
    { label: "Game Won", value: "3" },
    { label: "Successful Last Man Tackle", value: "3", was: "Was 2 last season" },
    { label: "Penalty Won", value: "3", was: "Was 2 last season" },
    { label: "Shot on Target", value: "2" },
    { label: "Successful Tackle", value: "2" },
    { label: "Named in Starting 11", value: "1" },
    { label: "Played 60+ Minutes", value: "1" },
    { label: "Subbed On", value: "1" },
    { label: "Interception", value: "1" },
    { label: "Accurate Crosses", value: "1" },
    { label: "Successful Dribble", value: "1" },
    { label: "Game Tied", value: "1" },
    { label: "Offside", value: "-1" },
    { label: "Dispossessed", value: "-1" },
    { label: "Goal Conceded", value: "-2" },
    { label: "Error Leading to Goal", value: "-3" },
    { label: "Yellow Card", value: "-3" },
    { label: "Red Card", value: "-7", note: "Awarded back if rescinded" },
    { label: "Penalty Missed", value: "-8" },
    { label: "Own Goal", value: "-10", was: "Was -9 last season" },
  ],
  MID: [
    { label: "Goal", value: "13", was: "Was 12 last season" },
    { label: "Assist (Official)", value: "7", note: "Assists last year were all worth the same" },
    { label: "Assist (Fantasy)", value: "4" },
    { label: "Big Chance Created", value: "4" },
    { label: "Game Won", value: "3" },
    { label: "Successful Last Man Tackle", value: "3", was: "Was 2 last season" },
    { label: "Penalty Won", value: "3", was: "Was 2 last season" },
    { label: "Shot on Target", value: "2" },
    { label: "Successful Tackle", value: "2" },
    { label: "Clean Sheet", value: "1" },
    { label: "Named in Starting 11", value: "1" },
    { label: "Played 60+ Minutes", value: "1" },
    { label: "Subbed On", value: "1" },
    { label: "Interception", value: "1" },
    { label: "Accurate Crosses", value: "1" },
    { label: "Successful Dribble", value: "1" },
    { label: "Game Tied", value: "1" },
    { label: "Offside", value: "-1" },
    { label: "Dispossessed", value: "-1" },
    { label: "Goal Conceded", value: "-1" },
    { label: "Error Leading to Goal", value: "-3" },
    { label: "Yellow Card", value: "-3" },
    { label: "Red Card", value: "-7", note: "Awarded back if rescinded" },
    { label: "Penalty Missed", value: "-8" },
    { label: "Own Goal", value: "-10", was: "Was -9 last season" },
  ],
  FWD: [
    { label: "Goal", value: "12", was: "Was 11 last season" },
    { label: "Assist (Official)", value: "6", note: "Assists last year were all worth the same" },
    { label: "Assist (Fantasy)", value: "3" },
    { label: "Big Chance Created", value: "4" },
    { label: "Game Won", value: "3" },
    { label: "Successful Last Man Tackle", value: "3", was: "Was 2 last season" },
    { label: "Penalty Won", value: "3", was: "Was 2 last season" },
    { label: "Shot on Target", value: "2" },
    { label: "Successful Tackle", value: "2" },
    { label: "Named in Starting 11", value: "1" },
    { label: "Played 60+ Minutes", value: "1" },
    { label: "Subbed On", value: "1" },
    { label: "Interception", value: "1" },
    { label: "Accurate Crosses", value: "1" },
    { label: "Successful Dribble", value: "1" },
    { label: "Game Tied", value: "1" },
    { label: "Offside", value: "-1" },
    { label: "Dispossessed", value: "-1" },
    { label: "Goal Conceded", value: "-1" },
    { label: "Error Leading to Goal", value: "-3" },
    { label: "Yellow Card", value: "-3" },
    { label: "Red Card", value: "-7", note: "Awarded back if rescinded" },
    { label: "Penalty Missed", value: "-8" },
    { label: "Own Goal", value: "-10", was: "Was -9 last season" },
  ],
};

const NEW_POINTS: Record<string, Row[]> = {
  GK: [
    { label: "Successful One-on-One", value: "2" },
    { label: "Clearance Off the Line", value: "3" },
    { label: "Aerials Won", value: "1" },
    { label: "Foul Drawn", value: "1" },
    { label: "Penalties Caused", value: "-3" },
  ],
  DEF: [
    { label: "Clearance Off the Line", value: "3" },
    { label: "Hat Trick", value: "3" },
    { label: "Free Kick Goal", value: "+2", note: "Extra, on top of normal goal points" },
    { label: "Goal Outside the Box", value: "+2", note: "Extra, on top of normal goal points" },
    { label: "Aerials Won", value: "1" },
    { label: "Ball Recovery", value: "1" },
    { label: "Foul Drawn", value: "1" },
    { label: "Key Pass", value: "1" },
    { label: "Big Chance Missed", value: "-1" },
    { label: "Penalties Caused", value: "-3" },
  ],
  MID: [
    { label: "Clearance Off the Line", value: "3" },
    { label: "Hat Trick", value: "3" },
    { label: "Free Kick Goal", value: "+2", note: "Extra, on top of normal goal points" },
    { label: "Goal Outside the Box", value: "+2", note: "Extra, on top of normal goal points" },
    { label: "Aerials Won", value: "1" },
    { label: "Ball Recovery", value: "1" },
    { label: "Foul Drawn", value: "1" },
    { label: "Key Pass", value: "1" },
    { label: "Big Chance Missed", value: "-1" },
    { label: "Penalties Caused", value: "-3" },
  ],
  FWD: [
    { label: "Clearance Off the Line", value: "3" },
    { label: "Hat Trick", value: "3" },
    { label: "Free Kick Goal", value: "+2", note: "Extra, on top of normal goal points" },
    { label: "Goal Outside the Box", value: "+2", note: "Extra, on top of normal goal points" },
    { label: "Aerials Won", value: "1" },
    { label: "Ball Recovery", value: "1" },
    { label: "Foul Drawn", value: "1" },
    { label: "Key Pass", value: "1" },
    { label: "Big Chance Missed", value: "-1" },
    { label: "Penalties Caused", value: "-3" },
  ],
};

const POSITIONS: Array<{ key: string; label: string; tint: string }> = [
  { key: "GK", label: "Goalkeeper", tint: "hsl(45 90% 55%)" },
  { key: "DEF", label: "Defender", tint: "hsl(200 85% 55%)" },
  { key: "MID", label: "Midfielder", tint: "hsl(140 65% 50%)" },
  { key: "FWD", label: "Attacker", tint: "hsl(0 80% 60%)" },
];

function valColor(v: string) {
  const n = parseFloat(v.replace("+", ""));
  if (n > 0) return "#4ade80";
  if (n < 0) return "#f87171";
  return "#e5e7eb";
}

function RowList({ rows }: { rows: Row[] }) {
  return (
    <ul className="divide-y divide-white/5 rounded-xl border border-white/10 overflow-hidden">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm text-white">{r.label}</div>
            {(r.was || r.note) && (
              <div className="text-[11px] text-muted-foreground mt-0.5">{r.was ?? r.note}</div>
            )}
          </div>
          <div className="font-display text-lg tabular-nums shrink-0" style={{ color: valColor(r.value) }}>
            {r.value}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ScoringPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span>Rules &amp; Regulations</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Point Scoring System</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Rules &amp; Regulations</div>
        <h1 className="font-display text-4xl sm:text-5xl">Point Scoring System</h1>
        <p className="text-sm text-muted-foreground mt-4">
          Every action that scores or costs points, broken down by position.
        </p>
      </div>

      <Tabs defaultValue="GK" className="mb-12">
        <TabsList className="grid grid-cols-4 w-full h-auto">
          {POSITIONS.map((p) => (
            <TabsTrigger key={p.key} value={p.key} className="text-xs sm:text-sm py-2">
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {POSITIONS.map((p) => (
          <TabsContent key={p.key} value={p.key} className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" style={{ color: p.tint }} />
              <h2 className="font-display text-xl" style={{ color: p.tint }}>{p.label} Scoring</h2>
            </div>
            <RowList rows={CORE[p.key]} />

            <div className="flex items-center gap-2 mt-8 mb-4">
              <h3 className="font-display text-lg" style={{ color: p.tint }}>New Points This Season</h3>
            </div>
            <RowList rows={NEW_POINTS[p.key]} />
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex items-center gap-2 justify-center mt-6 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5" />
        Part of Rules &amp; Regulations &mdash; more Season 5 rules pages coming soon
      </div>
    </div>
  );
}
