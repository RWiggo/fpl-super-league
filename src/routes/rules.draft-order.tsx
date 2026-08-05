import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Repeat, ListOrdered, Info } from "lucide-react";

export const Route = createFileRoute("/rules/draft-order")({
  component: DraftOrderPage,
  head: () => ({
    meta: [
      { title: "Season 5 Draft Order | FPL Super League" },
      { name: "description", content: "Season 5 snake draft order, format, and draft night details." },
    ],
  }),
});

// Season 5's purple accent (hue 285) - matches the season page, prize pool, and general rules waiver order.
const ACCENT = "hsl(285 80% 55%)";
const ACCENT_SOFT = "hsl(285 80% 55% / 0.12)";
const ACCENT_BORDER = "hsl(285 80% 55% / 0.35)";

const DRAFT_ORDER: Array<{ team: string; manager: string; note?: string }> = [
  { team: "ALS Ajax", manager: "Alex Allsopp" },
  { team: "Charleston Athletic", manager: "Charlie Clark" },
  { team: "El Changusto", manager: "Alfie Clark" },
  { team: "Power Reijnders FC", manager: "Jake Toyer" },
  { team: "Raybould Eagles", manager: "Ryan Raybould" },
  { team: "Fordys XI", manager: "Ollie Ford" },
  { team: "Adam All Stars", manager: "Adam Wiggins" },
  { team: "Wiggo Wanderers", manager: "Ryan Wiggins" },
  { team: "Padleys Piranhas", manager: "Perry Padley" },
  { team: "Not Too Xabi FC", manager: "Mark Knight" },
  { team: "Send Me Location", manager: "Tim Hazzledine" },
  { team: "SW8 Gunners", manager: "Chavez", note: "New" },
];

function DraftOrderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span>Rules &amp; Regulations</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Draft Order</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-[11px] uppercase tracking-[0.3em] mb-3" style={{ color: ACCENT }}>
          Season 5 &middot; Rules &amp; Regulations
        </div>
        <h1 className="font-display text-4xl sm:text-5xl">Draft Order</h1>
        <p className="text-sm font-bold mt-4" style={{ color: ACCENT }}>
          Thursday 13th August, 8:00pm BST
        </p>
      </div>

      {/* Draft night details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="rounded-xl p-5 border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Repeat className="w-5 h-5 mx-auto mb-2" style={{ color: ACCENT }} />
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Format</div>
          <div className="font-display text-lg text-white">Snake Draft</div>
        </div>
        <div className="rounded-xl p-5 border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: ACCENT }} />
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Time Per Pick</div>
          <div className="font-display text-lg text-white">1 Minute</div>
        </div>
        <div className="rounded-xl p-5 border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
          <ListOrdered className="w-5 h-5 mx-auto mb-2" style={{ color: ACCENT }} />
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Total Rounds</div>
          <div className="font-display text-lg text-white">23</div>
        </div>
      </div>

      {/* How the snake order works */}
      <div
        className="rounded-xl p-5 sm:p-6 mb-12 flex gap-4"
        style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT}` }}
      >
        <Repeat className="w-6 h-6 shrink-0" style={{ color: ACCENT }} />
        <div>
          <p className="text-sm sm:text-base font-bold text-white mb-1">How the Order Works</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The draft order below is Round 1. From Round 2 onward, the order <strong className="text-white">reverses every round</strong> &mdash; whoever picked last in Round 1 picks first in Round 2, then it flips back for Round 3, and so on for all 23 rounds. This keeps things fair, since no manager waits through two long gaps in a row.
          </p>
        </div>
      </div>

      {/* Round 1 order */}
      <div className="rounded-xl p-5 sm:p-6 border border-white/10 mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="text-sm text-white font-bold mb-4">Round 1 Draft Order</p>
        <ol className="space-y-2.5">
          {DRAFT_ORDER.map((d, i) => (
            <li key={d.manager} className="flex items-center gap-3 text-sm">
              <span className="w-6 font-display text-base shrink-0" style={{ color: ACCENT }}>{i + 1}</span>
              <span className="text-white">{d.team}</span>
              <span className="text-muted-foreground">&mdash; {d.manager}</span>
              {d.note && (
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ml-auto shrink-0"
                  style={{ background: ACCENT_SOFT, color: ACCENT }}
                >
                  {d.note}
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground mt-5">
          Based on 2025/26 final standings, reversed &mdash; the lower you finished, the earlier you pick. New managers are tagged on at the very end.
        </p>
      </div>

      <div className="flex items-center gap-2 justify-center mt-10 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5" />
        Part of Rules &amp; Regulations &mdash; more sections will be added here over time
      </div>
    </div>
  );
}
