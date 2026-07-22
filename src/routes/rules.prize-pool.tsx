import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Info, RefreshCcw, MessageCircleWarning } from "lucide-react";

export const Route = createFileRoute("/rules/prize-pool")({
  component: PrizePoolPage,
  head: () => ({
    meta: [
      { title: "Season 5 Prize Pool | FPL Super League" },
      { name: "description", content: "Season 5 entry brackets, prize structure, and how winnings are shared out." },
    ],
  }),
});

// Season 5's purple accent (hue 285) - matches the season page and homepage draft countdown widget.
const ACCENT = "hsl(285 80% 55%)";
const ACCENT_SOFT = "hsl(285 80% 55% / 0.12)";
const ACCENT_BORDER = "hsl(285 80% 55% / 0.35)";

const BRACKETS = [
  { amount: "£100", count: 3 },
  { amount: "£50", count: 6 },
  { amount: "£25", count: 1 },
  { amount: "£20", count: 2 },
];

const PRIZES = [
  { place: "1st", amount: "£365" },
  { place: "2nd", amount: "£200" },
  { place: "3rd", amount: "£100" },
];

const TOTAL_POT = "£665";

function PrizePoolPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span>Rules &amp; Regulations</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Prize Pool</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-[11px] uppercase tracking-[0.3em] mb-3" style={{ color: ACCENT }}>
          Season 5 &middot; Rules &amp; Regulations
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <h1 className="font-display text-4xl sm:text-5xl">Prize Pool</h1>
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
            style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT}`, color: ACCENT }}
          >
            Provisional
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Figures can still change before Draft Night
        </p>
        <p className="text-sm font-bold mt-1" style={{ color: ACCENT }}>
          Thursday 13th August, 8:00pm BST
        </p>
      </div>

      {/* Total pot */}
      <div
        className="rounded-2xl p-8 text-center mb-6"
        style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT}` }}
      >
        <div className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: ACCENT }}>Total Pot</div>
        <div className="font-display text-6xl sm:text-7xl">{TOTAL_POT}</div>
      </div>

      {/* Entry brackets */}
      <h2 className="font-display text-xl mb-4 mt-12">Entry Brackets</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
        {BRACKETS.map((b) => (
          <div
            key={b.amount}
            className="rounded-xl p-5 text-center border border-white/10"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className="font-display text-3xl" style={{ color: ACCENT }}>{b.amount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {b.count} {b.count === 1 ? "entrant" : "entrants"}
            </div>
          </div>
        ))}
      </div>

      {/* Base prizes */}
      <h2 className="font-display text-xl mb-4">Base Prizes <span className="text-sm font-normal text-muted-foreground">(at full £100 entry)</span></h2>
      <div className="grid grid-cols-3 gap-4 mb-12">
        {PRIZES.map((p) => (
          <div key={p.place} className="rounded-xl p-5 text-center border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{p.place}</div>
            <div className="font-display text-3xl">{p.amount}</div>
          </div>
        ))}
      </div>

      {/* How winnings are shared out */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-6"
        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT_BORDER}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5" style={{ color: ACCENT }} />
          <h2 className="font-display text-xl" style={{ color: ACCENT }}>How Winnings Are Shared Out</h2>
        </div>
        <p className="text-sm sm:text-base mb-4">
          What you claim from the prize for the spot you finish in is based on the % you entered compared to the £100 max.
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>e.g. a £20 entry finishing in a prize spot wins 20% of that spot&apos;s prize</li>
          <li>e.g. a £50 entry finishing in a prize spot wins 50% of that spot&apos;s prize</li>
        </ul>
      </div>

      {/* Leftover money */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-6"
        style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT_BORDER}` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <RefreshCcw className="w-5 h-5" style={{ color: ACCENT }} />
          <h2 className="font-display text-xl" style={{ color: ACCENT }}>Any Money Left Over</h2>
        </div>
        <p className="text-sm sm:text-base">
          Refunded to every entrant &mdash; prioritising those who entered more, i.e. split in proportion to each person&apos;s original entry amount.
        </p>
      </div>

      {/* Footer note */}
      <div
        className="rounded-2xl p-6 sm:p-8 flex gap-4"
        style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT}` }}
      >
        <MessageCircleWarning className="w-6 h-6 shrink-0" style={{ color: ACCENT }} />
        <div>
          <p className="text-sm sm:text-base font-bold mb-2">These amounts are agreed in principle only, not final.</p>
          <p className="text-sm text-muted-foreground mb-1">
            Message Ryan privately any time before Draft Night (Thu 13 Aug) if you want to change your entry.
          </p>
          <p className="text-sm text-muted-foreground">
            Individual entries stay private &mdash; only bracket totals are ever shown publicly.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-center mt-10 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5" />
        Part of Rules &amp; Regulations &mdash; more Season 5 rules pages coming soon
      </div>
    </div>
  );
}
