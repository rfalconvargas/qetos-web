"use client";

import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, Utensils, Activity, ChevronRight } from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { PhonePanel, AmbientGlow } from "./ui/Card";
import { container, fadeUp, easeOut } from "./motion";

const WINDOW_CARDS = [
  {
    icon: Moon,
    label: "Recovery",
    detail: "7h 40m sleep · resting well",
    tint: "#e3e0f2",
  },
  {
    icon: Utensils,
    label: "Meal",
    detail: "Protein-forward lunch logged",
    tint: "#cbe7e3",
  },
  {
    icon: Activity,
    label: "Ketones",
    detail: "1.4 mmol · GKI 4.2",
    tint: "#e8f0ec",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-clip px-5 pb-16 pt-32 sm:pt-40">
      <AmbientGlow className="left-1/2 top-0 h-[520px] w-[860px] max-w-[120vw] -translate-x-1/2" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <Badge>
              <Sparkles className="h-3.5 w-3.5 text-navy" />
              Qetos · AI health companion
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-balance font-display text-display font-medium leading-[var(--text-display--line-height)] tracking-tight text-navy"
          >
            The AI health companion for daily momentum.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted"
          >
            Qetos translates complex health protocols, cravings, biometric
            context, and daily routines into calm next steps — so you feel
            capable, not corrected.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button href="#decision-lab" size="lg">
              Try the Decision Lab
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button href="#system" variant="secondary" size="lg">
              Explore the Product System
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-5 text-xs text-text-muted/80">
            Educational, not medical advice · Local-first preview
          </motion.p>
        </motion.div>

        {/* Phone mock — today's protocol window */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut, delay: 0.2 }}
        >
          <PhonePanel>
            <div className="flex flex-col gap-4 px-5 pb-6 pt-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,#f7d070_45%,white)] px-3 py-1 text-xs font-semibold text-navy">
                  <Sun className="h-3.5 w-3.5" /> Midday window
                </span>
                <span className="text-xs font-medium text-text-muted">
                  Good afternoon, Maya
                </span>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
                  Today&apos;s protocol window
                </p>
                <p className="mt-1 font-display text-xl leading-snug text-navy">
                  Three calm things, right now.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {WINDOW_CARDS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.label}
                      className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-3 py-2.5"
                    >
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-navy"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${c.tint} 60%, white)`,
                        }}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy">
                          {c.label}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {c.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Log a Victory — emphasised (presentational mockup) */}
                <div
                  aria-hidden
                  className="flex items-center gap-3 rounded-2xl bg-navy px-3 py-2.5 text-left"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 text-glow">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      Log a Victory
                    </p>
                    <p className="truncate text-xs text-white/75">
                      Tap to bank today&apos;s win
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PhonePanel>
        </motion.div>
      </div>
    </section>
  );
}
