"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sunrise,
  Sun,
  Moon,
  Activity,
  Sparkles,
  ChevronDown,
  RotateCcw,
  FileText,
} from "lucide-react";
import {
  PROTOCOL_TITLE,
  PROTOCOL_RAW,
  PROTOCOL_STEPS,
  type StepWhen,
} from "@/data/protocols";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { easeOut } from "./motion";
import { cn } from "@/lib/utils";

const WHEN_ICON: Record<StepWhen, typeof Sun> = {
  Morning: Sunrise,
  Midday: Sun,
  Evening: Moon,
  Daily: Activity,
  Anytime: Sparkles,
};

export function ProtocolTranslator() {
  const [translated, setTranslated] = useState(false);
  const [openWhy, setOpenWhy] = useState<number | null>(null);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* RAW — dense clinical protocol */}
      <Card className="flex flex-col p-6">
        <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          <FileText className="h-3.5 w-3.5 text-orange" />
          The protocol, as it arrives
        </p>
        <p className="mb-3 text-sm font-medium text-navy">{PROTOCOL_TITLE}</p>
        <ul className="space-y-3">
          {PROTOCOL_RAW.map((line, i) => (
            <li
              key={i}
              className="rounded-xl bg-navy/[0.04] px-4 py-3 font-mono text-[13px] leading-relaxed text-navy/80"
            >
              {line}
            </li>
          ))}
        </ul>
      </Card>

      {/* TRANSLATED — calm daily steps */}
      <Card strong className="relative flex flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            <Sparkles className="h-3.5 w-3.5 text-glow" />
            What Qetos makes of it
          </p>
          {translated && (
            <button
              onClick={() => {
                setTranslated(false);
                setOpenWhy(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-navy"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Replay
            </button>
          )}
        </div>

        {!translated ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
            <p className="max-w-xs text-sm leading-relaxed text-text-muted">
              Watch a wall of clinical instructions become a handful of calm,
              time-aware actions.
            </p>
            <Button onClick={() => setTranslated(true)}>
              <Sparkles className="h-4 w-4 text-glow" />
              Translate protocol
            </Button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } },
            }}
            className="flex flex-col gap-3"
          >
            {PROTOCOL_STEPS.map((step, i) => {
              const Icon = WHEN_ICON[step.when];
              const isOpen = openWhy === i;
              return (
                <motion.div
                  key={step.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: easeOut },
                    },
                  }}
                  className="rounded-2xl border border-white/70 bg-white/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint text-navy">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-navy">
                          {step.title}
                        </p>
                        <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy/70">
                          {step.when}
                        </span>
                      </div>
                      <p className="mt-1 text-[15px] leading-snug text-text/85">
                        {step.action}
                      </p>
                      <button
                        onClick={() => setOpenWhy(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-navy"
                      >
                        Why this works
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            isOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: easeOut }}
                            className="overflow-hidden"
                          >
                            <p className="mt-2 text-xs leading-relaxed text-text-muted">
                              {step.why}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Card>
    </div>
  );
}
