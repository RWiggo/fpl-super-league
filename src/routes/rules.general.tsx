import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ArrowLeftRight, Lock, Users, LayoutGrid, ShieldAlert, Info } from "lucide-react";

export const Route = createFileRoute("/rules/general")({
  component: GeneralRulesPage,
  head: () => ({
    meta: [
      { title: "General Rules | FPL Super League" },
      { name: "description", content: "Gameweek line-up rules, legal formations, and other league-wide rules." },
    ],
  }),
});

const FORMATIONS = ["3-3-4", "3-4-3", "3-5-2", "4-2-4", "4-3-3", "4-4-2", "4-5-1", "5-2-3", "5-3-2", "5-4-1"];

function RuleCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5 border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-2.5 mb-2">
        <span className="text-gold shrink-0">{icon}</span>
        <h3 className="font-display text-lg text-white">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function GeneralRulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span>Rules &amp; Regulations</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">General Rules</span>
      </div>

      {/* Header */}
      <div className="text-center mb-14">
        <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Rules &amp; Regulations</div>
        <h1 className="font-display text-4xl sm:text-5xl">General Rules</h1>
        <p className="text-sm text-muted-foreground mt-4">
          League-wide rules that apply across every season, including this one.
        </p>
      </div>

      {/* Section: Gameweek Line-Up Rules */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-gold" />
          <h2 className="font-display text-2xl text-gold">Gameweek Line-Up Rules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RuleCard icon={<Clock className="w-5 h-5" />} title="Sub Order Deadline">
            You have until <strong className="text-white">15 minutes before kick off</strong> to set your substitute order for the gameweek.
          </RuleCard>

          <RuleCard icon={<ArrowLeftRight className="w-5 h-5" />} title="Mid-Week Swaps">
            You can switch anyone in or out of your starting line-up during the gameweek, as long as <strong className="text-white">both the player coming in and the player going out have not yet played their game</strong>.
          </RuleCard>
        </div>

        {/* Important callout */}
        <div
          className="rounded-xl p-5 sm:p-6 mt-4 flex gap-4"
          style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.4)" }}
        >
          <Lock className="w-6 h-6 shrink-0 text-gold" />
          <div>
            <p className="text-sm sm:text-base font-bold text-white mb-1">Important: Per-Player Lock Times</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Although you can swap a player in or out of your line-up any time before <em>their</em> game kicks off, that swap locks <strong className="text-white">15 minutes before that player&apos;s own game</strong> &mdash; not just at the start of the gameweek. Give yourself plenty of time.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <RuleCard icon={<LayoutGrid className="w-5 h-5" />} title="Automatic Substitutions">
            Subs come on automatically at the end of the gameweek for anyone in your starting line-up who didn&apos;t play at all. They come on <strong className="text-white">in the order you&apos;ve numbered them</strong>, as long as the resulting formation stays legal.
          </RuleCard>
        </div>
      </section>

      {/* Section: Legal Formations */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <LayoutGrid className="w-5 h-5 text-gold" />
          <h2 className="font-display text-2xl text-gold">Legal Formations</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">These remain unchanged from previous seasons.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {FORMATIONS.map((f) => (
            <div
              key={f}
              className="rounded-xl py-4 text-center border border-white/10"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <span className="font-display text-2xl text-gold">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section: Injured Players */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h2 className="font-display text-2xl text-red-400">Injured Players &amp; Sub Manipulation</h2>
        </div>
        <div
          className="rounded-xl p-5 sm:p-6 flex gap-4"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.4)" }}
        >
          <ShieldAlert className="w-6 h-6 shrink-0 text-red-400" />
          <div>
            <p className="text-sm sm:text-base font-bold text-white mb-1">
              It is illegal to knowingly leave a reported-injured player in your starting line-up.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you're found doing this in an attempt to manipulate your automatic substitutions, you will be docked <strong className="text-red-300">10 FPL points</strong> for that gameweek.
            </p>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 justify-center mt-10 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5" />
        Part of Rules &amp; Regulations &mdash; more sections will be added here over time
      </div>
    </div>
  );
}
