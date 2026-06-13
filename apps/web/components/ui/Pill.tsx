import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PillProps = {
  selected?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

/** A selectable, shame-free option pill used across the interactive tools. */
export function Pill({ selected, className, children, ...rest }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30",
        selected
          ? "border-navy bg-navy text-white"
          : "border-white/70 bg-white/55 text-text/75 hover:border-navy/30 hover:text-navy",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** A non-interactive informational pill / tag. */
export function Tag({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-sm font-medium text-navy",
        className
      )}
    >
      {children}
    </span>
  );
}
