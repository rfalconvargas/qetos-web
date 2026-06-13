import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  strong = false,
  lit = true,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  lit?: boolean;
}) {
  return (
    <div
      className={cn(
        strong ? "glass-strong" : "glass",
        lit && "glass-lit",
        "rounded-[var(--radius-card)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** A floating, phone-like panel used to show product UI mockups. */
export function PhonePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[320px]", className)}>
      <div className="glass-strong glass-lit rounded-[2.6rem] p-2.5 shadow-[var(--glass-shadow-lg)]">
        <div className="overflow-hidden rounded-[2.2rem] bg-white/85 ring-1 ring-white/60">
          {children}
        </div>
      </div>
    </div>
  );
}

/** A soft, cinematic ambient glow placed behind hero / section content. */
export function AmbientGlow({
  className,
  from = "rgba(247,208,112,0.35)",
  via = "rgba(203,231,227,0.25)",
}: {
  className?: string;
  from?: string;
  via?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 rounded-full opacity-70 blur-3xl",
        className
      )}
      style={{
        background: `radial-gradient(closest-side, ${from}, ${via} 55%, transparent)`,
      }}
    />
  );
}
