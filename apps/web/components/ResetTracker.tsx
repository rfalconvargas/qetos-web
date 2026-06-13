"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  readJSON,
  writeJSON,
  removeKey,
  RESET_KEY,
  type ResetState,
  type DayMark,
} from "@/lib/storage";
import { PROTECTABLE_RULES } from "@/data/rules";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { cn } from "@/lib/utils";

const PRESETS = PROTECTABLE_RULES.map((r) => r.label);

const CYCLE: DayMark[] = [null, "momentum", "reset", "reflection"];

const MARK_META: Record<
  Exclude<DayMark, null>,
  { label: string; dot: string; cell: string }
> = {
  momentum: {
    label: "Momentum",
    dot: "bg-navy",
    cell: "border-transparent bg-navy text-glow shadow-[var(--shadow-soft)]",
  },
  reset: {
    label: "Reset",
    dot: "bg-[#b9b2e8]",
    cell: "border-transparent bg-lavender text-navy",
  },
  reflection: {
    label: "Reflection",
    dot: "bg-[#f7d070]",
    cell: "border-transparent bg-[color-mix(in_srgb,#f7d070_55%,white)] text-navy",
  },
};

function blankDays(): DayMark[] {
  return Array.from({ length: 30 }, () => null);
}
function nextMark(m: DayMark): DayMark {
  return CYCLE[(CYCLE.indexOf(m) + 1) % CYCLE.length];
}
function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function ResetTracker() {
  const [state, setState] = useState<ResetState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setState(readJSON<ResetState | null>(RESET_KEY, null));
    setHydrated(true);
  }, []);

  function start(experiment: string) {
    const name = experiment.trim();
    if (!name) return;
    const next: ResetState = {
      experiment: name,
      startedAt: Date.now(),
      days: blankDays(),
    };
    setState(next);
    writeJSON(RESET_KEY, next);
    setDraft("");
  }

  function cycleDay(i: number) {
    if (!state) return;
    const days = state.days.slice();
    days[i] = nextMark(days[i] ?? null);
    const next = { ...state, days };
    setState(next);
    writeJSON(RESET_KEY, next);
  }

  function startOver() {
    removeKey(RESET_KEY);
    setState(null);
  }

  if (!hydrated) {
    return <Card className="h-64 opacity-50">{""}</Card>;
  }

  if (!state) {
    return (
      <Card strong className="p-6 sm:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Choose your reset
        </p>
        <p className="mb-5 max-w-lg text-sm leading-relaxed text-text-muted">
          Pick one gentle thing to explore for 30 days. This is a curiosity
          experiment — there&apos;s nothing here you can fail.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Pill key={p} onClick={() => start(p)}>
              {p}
            </Pill>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && start(draft)}
            placeholder="Custom — write your own"
            aria-label="Custom reset name"
            className="w-full rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm text-navy outline-none placeholder:text-text-muted/70 focus:border-[#cbe7e3] focus:ring-2 focus:ring-[#cbe7e3]"
          />
          <Button onClick={() => start(draft)} disabled={!draft.trim()} className="shrink-0">
            Start my reset
          </Button>
        </div>
      </Card>
    );
  }

  const counts = {
    momentum: state.days.filter((d) => d === "momentum").length,
    reset: state.days.filter((d) => d === "reset").length,
    reflection: state.days.filter((d) => d === "reflection").length,
  };
  const touched = counts.momentum + counts.reset + counts.reflection;

  return (
    <Card strong className="p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            Your 30-day reset
          </p>
          <h3 className="mt-1 font-display text-2xl text-navy">
            {state.experiment}
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={startOver}>
          <RotateCcw className="h-3.5 w-3.5" />
          New reset
        </Button>
      </div>

      {/* Legend */}
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-text-muted">
        {(Object.keys(MARK_META) as Array<keyof typeof MARK_META>).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cn("h-2.5 w-2.5 rounded-full", MARK_META[k].dot)} />
            {MARK_META[k].label}
          </span>
        ))}
        <span className="text-text-muted/70">· tap a day to cycle</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
        {state.days.map((d, i) => {
          const meta = d ? MARK_META[d] : null;
          return (
            <button
              key={i}
              onClick={() => cycleDay(i)}
              aria-label={`Day ${i + 1}: ${d ?? "unmarked"}`}
              title={`Day ${i + 1}${d ? ` · ${meta!.label}` : ""}`}
              className={cn(
                "grid aspect-square place-items-center rounded-xl border text-xs font-medium tabular-nums transition-all",
                meta
                  ? meta.cell
                  : "border-white/70 bg-white/55 text-text-muted/70 hover:border-navy/40"
              )}
            >
              {d === "momentum" ? "✦" : i + 1}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-sm leading-relaxed text-text-muted">
        {touched === 0
          ? "Tap any day to mark it. Momentum, a gentle reset, or a moment of reflection — every one counts as showing up."
          : `${plural(counts.momentum, "day")} of momentum · ${plural(
              counts.reset,
              "gentle reset"
            )} · ${plural(counts.reflection, "reflection")}. Every one is progress.`}
      </p>
    </Card>
  );
}
