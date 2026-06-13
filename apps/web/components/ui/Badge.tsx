import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A small glass eyebrow badge, e.g. "AI HEALTH COMPANION". */
export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "glass-strong inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
