"use client";

import { motion } from "framer-motion";
import { MessageSquareHeart, ArrowRight } from "lucide-react";
import { AmbientGlow } from "./ui/Card";
import { easeOut } from "./motion";
import { PRODUCT_FEEDBACK_URL } from "@/lib/feedback";

export function FeedbackCTA() {
  return (
    <section id="feedback" className="scroll-mt-28 px-5 py-20 sm:py-28">
      <div className="relative mx-auto w-full max-w-6xl">
        <AmbientGlow className="left-1/2 top-1/2 h-[420px] w-[680px] max-w-[110vw] -translate-x-1/2 -translate-y-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="glass-strong glass-lit mx-auto flex max-w-2xl flex-col items-center rounded-[var(--radius-card)] px-6 py-12 text-center sm:px-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
            <MessageSquareHeart className="h-3.5 w-3.5 text-navy" strokeWidth={1.75} />
            Feedback
          </span>

          <h2 className="mt-6 text-balance font-display text-h2 font-medium tracking-tight text-navy">
            Give us your honest feedback.
          </h2>

          <p className="mt-4 max-w-md text-base leading-relaxed text-text-muted">
            Qetos is still taking shape — tell us what feels calm, what feels
            off, and what you wish it did.
          </p>

          <a
            href={PRODUCT_FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]"
          >
            Ailiur Feedback Form
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
