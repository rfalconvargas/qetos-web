"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import {
  readJSON,
  writeJSON,
  VICTORIES_KEY,
  type Victory,
} from "@/lib/storage";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Pill } from "./ui/Pill";
import { easeOut } from "./motion";

const WIN_KINDS = [
  { id: "resisted-craving", label: "Resisted a craving", emoji: "🛡️" },
  { id: "protocol-meal", label: "Ate a protocol-aligned meal", emoji: "🥗" },
  { id: "breathwork", label: "Completed breathwork", emoji: "🌬️" },
  { id: "logged-ketones", label: "Logged ketones", emoji: "📈" },
  { id: "chose-recovery", label: "Chose recovery", emoji: "🌙" },
  { id: "re-entered", label: "Re-entered after a relapse", emoji: "🌱" },
];

function labelFor(id: string) {
  return WIN_KINDS.find((w) => w.id === id)?.label ?? "A win";
}
function emojiFor(id: string) {
  return WIN_KINDS.find((w) => w.id === id)?.emoji ?? "✦";
}

export function LogVictory() {
  const [victories, setVictories] = useState<Victory[]>([]);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("");
  const [helped, setHelped] = useState("");
  const [bloom, setBloom] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setVictories(readJSON<Victory[]>(VICTORIES_KEY, []));
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function resetForm() {
    setKind(null);
    setDifficulty("");
    setHelped("");
  }

  function save() {
    if (!kind) return;
    const v: Victory = {
      id: `${kind}-${victories.length + 1}-${Math.round(performance.now())}`,
      kind,
      difficulty: difficulty.trim() || undefined,
      helped: helped.trim() || undefined,
      at: Date.now(),
    };
    const next = [v, ...victories].slice(0, 50);
    setVictories(next);
    writeJSON(VICTORIES_KEY, next);
    setOpen(false);
    resetForm();
    setBloom(true);
    window.setTimeout(() => setBloom(false), 1000);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Vitality */}
      <Card
        strong
        className="relative flex flex-col items-center justify-center gap-3 overflow-hidden p-8 text-center"
      >
        <AnimatePresence>
          {bloom && (
            <motion.span
              key="bloom"
              aria-hidden
              className="pointer-events-none absolute inset-0 grid place-items-center"
            >
              <span className="animate-bloom text-7xl">✦</span>
            </motion.span>
          )}
        </AnimatePresence>

        <span className="grid h-14 w-14 place-items-center rounded-full bg-[color-mix(in_srgb,#f7d070_50%,white)] text-2xl text-navy">
          ✦
        </span>
        <p className="font-display text-5xl font-medium tabular-nums text-navy">
          {victories.length}
        </p>
        <p className="text-sm text-text-muted">
          {victories.length === 1 ? "win banked" : "wins banked"} in your
          Vitality
        </p>
        <Button onClick={() => setOpen(true)} className="mt-2">
          <Sparkles className="h-4 w-4 text-glow" /> Log a victory
        </Button>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
          Recent moments of momentum
        </p>
        {victories.length === 0 ? (
          <p className="text-sm leading-relaxed text-text-muted">
            Nothing here yet — and that&apos;s completely fine. Your first small
            win is waiting whenever you are.
          </p>
        ) : (
          <ol className="relative space-y-5 before:absolute before:left-[18px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-text-muted/20">
            {victories.slice(0, 5).map((v) => (
              <li key={v.id} className="relative flex gap-4">
                <span className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/70 bg-white text-base shadow-[var(--shadow-soft)]">
                  {emojiFor(v.kind)}
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-sm font-semibold text-navy">
                    {labelFor(v.kind)}
                  </p>
                  {v.helped && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      <span className="font-medium text-navy/70">
                        What helped:
                      </span>{" "}
                      {v.helped}
                    </p>
                  )}
                  {v.difficulty && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      <span className="font-medium text-navy/70">
                        The hard part:
                      </span>{" "}
                      {v.difficulty}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto px-4 py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-navy/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Log a victory"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="glass-strong glass-lit relative z-10 my-auto w-full max-w-md rounded-[var(--radius-panel)] p-6"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl text-navy">
                    Log a victory
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    Big or small, it counts. Let&apos;s mark it.
                  </p>
                </div>
                <button
                  ref={closeRef}
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-full text-text-muted hover:bg-white/60 hover:text-navy"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                    What did you win today?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WIN_KINDS.map((w) => (
                      <Pill
                        key={w.id}
                        selected={kind === w.id}
                        onClick={() => setKind(w.id)}
                      >
                        <span className="mr-1.5">{w.emoji}</span>
                        {w.label}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="victory-difficulty"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-muted"
                  >
                    What made it difficult?
                  </label>
                  <input
                    id="victory-difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    placeholder="Optional — name the hard part"
                    className="w-full rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm text-navy outline-none placeholder:text-text-muted/70 focus:border-[#cbe7e3] focus:ring-2 focus:ring-[#cbe7e3]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="victory-helped"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-text-muted"
                  >
                    What helped?
                  </label>
                  <input
                    id="victory-helped"
                    value={helped}
                    onChange={(e) => setHelped(e.target.value)}
                    placeholder="Optional — what you'll want to remember"
                    className="w-full rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm text-navy outline-none placeholder:text-text-muted/70 focus:border-[#cbe7e3] focus:ring-2 focus:ring-[#cbe7e3]"
                  />
                </div>
              </div>

              <Button
                onClick={save}
                disabled={!kind}
                className="mt-6 w-full"
              >
                <Sparkles className="h-4 w-4 text-glow" />
                Bank this win
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
