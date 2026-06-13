"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { easeOut } from "../motion";
import { cn } from "@/lib/utils";

export function Section({
  id,
  index,
  eyebrow,
  title,
  intro,
  children,
  className,
  headerClassName,
}: {
  id?: string;
  index?: number;
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}) {
  const hasHeader = eyebrow || title || intro;
  return (
    <section
      id={id}
      className={cn("scroll-mt-28 px-5 py-20 sm:py-28", className)}
    >
      <div className="mx-auto w-full max-w-6xl">
        {hasHeader && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className={cn("mb-12 max-w-2xl", headerClassName)}
          >
            {(index != null || eyebrow) && (
              <div className="mb-4 flex items-center gap-3">
                {index != null && (
                  <>
                    <span className="font-display text-sm font-medium tabular-nums text-text-muted/70">
                      {String(index).padStart(2, "0")}
                    </span>
                    <span className="h-px w-8 bg-text-muted/30" />
                  </>
                )}
                {eyebrow && (
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                    {eyebrow}
                  </span>
                )}
              </div>
            )}
            {title && (
              <h2 className="text-balance font-display text-h1 font-medium tracking-tight text-navy">
                {title}
              </h2>
            )}
            {intro && (
              <p className="mt-4 text-lg leading-relaxed text-text-muted">
                {intro}
              </p>
            )}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
