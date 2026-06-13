"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, ArrowRight, Info, ShieldCheck } from "lucide-react";
import { FOODS, TRIGGERS } from "@/data/foods";
import { PROTECTABLE_RULES, deriveDecision } from "@/data/rules";
import { Card } from "./ui/Card";
import { Pill } from "./ui/Pill";
import { easeOut } from "./motion";

function Field<T extends { id: string }>({
  label,
  items,
  selected,
  onSelect,
  render,
}: {
  label: string;
  items: T[];
  selected: string | null;
  onSelect: (id: string) => void;
  render: (item: T) => React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Pill
            key={item.id}
            selected={selected === item.id}
            onClick={() => onSelect(item.id)}
          >
            {render(item)}
          </Pill>
        ))}
      </div>
    </div>
  );
}

function ResultRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-[15px] leading-relaxed text-text/85">{children}</p>
    </div>
  );
}

export function DecisionLab() {
  const [food, setFood] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<string | null>(null);
  const [rule, setRule] = useState<string | null>(null);

  const ready = food && trigger && rule;
  const result = ready ? deriveDecision(food, trigger, rule) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      {/* Inputs */}
      <Card className="flex flex-col gap-6 p-6">
        <Field
          label="What are you craving?"
          items={FOODS}
          selected={food}
          onSelect={setFood}
          render={(f) => (
            <span>
              <span className="mr-1.5">{f.emoji}</span>
              {f.name}
            </span>
          )}
        />
        <Field
          label="What's the trigger?"
          items={TRIGGERS}
          selected={trigger}
          onSelect={setTrigger}
          render={(t) => t.label}
        />
        <Field
          label="What rule are you protecting?"
          items={PROTECTABLE_RULES}
          selected={rule}
          onSelect={setRule}
          render={(r) => r.label}
        />
      </Card>

      {/* Output — the decision mirror */}
      <Card strong className="relative flex min-h-[360px] flex-col justify-center p-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={`${food}-${trigger}-${rule}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: easeOut }}
              className="flex flex-col gap-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                    <Compass className="h-3.5 w-3.5 text-orange" />
                    Pattern
                  </p>
                  <p className="mt-1.5 font-display text-2xl leading-tight text-navy">
                    {result.pattern}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-medium text-navy">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {result.rule}
                </span>
              </div>

              <ResultRow label="What this is really about">
                {result.meaning}
              </ResultRow>

              <ResultRow label="How it sits with your rule">
                {result.conflict}
              </ResultRow>

              <div className="rounded-2xl border border-white/60 bg-white/45 p-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                  <Info className="h-3.5 w-3.5" />
                  A cautious note
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  {result.caution}
                </p>
              </div>

              <div className="rounded-2xl bg-mint/70 p-4">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                  <ArrowRight className="h-3.5 w-3.5 text-navy" />
                  One better step
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-navy">
                  {result.better}
                </p>
              </div>

              <figure className="border-l-2 border-navy/25 pl-4">
                <blockquote className="font-display text-xl leading-snug text-navy">
                  &ldquo;{result.emergency}&rdquo;
                </blockquote>
                <figcaption className="mt-1 text-xs text-text-muted">
                  An emergency sentence — say it, then move on.
                </figcaption>
              </figure>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm leading-relaxed text-text-muted"
            >
              Pick a craving, a trigger, and the rule you&apos;re protecting.
              <br />
              Qetos will mirror the pattern back — calmly, without judgment.
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
