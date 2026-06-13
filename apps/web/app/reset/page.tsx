import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResetTracker } from "@/components/ResetTracker";

export const metadata: Metadata = {
  title: "30-Day Reset — Qetos",
  description:
    "Pick one gentle thing to step away from for thirty forgiving days. A curiosity experiment, not a test you can fail. Stays on your device.",
};

export default function ResetPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-32 sm:pt-40">
      <Link
        href="/#reset"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> Back to overview
      </Link>

      <div className="mb-12 mt-6 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          30-Day Reset
        </span>
        <h1 className="mt-3 font-display text-h1 font-medium tracking-tight text-navy">
          One gentle experiment, thirty forgiving days.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-text-muted">
          Step away from one thing and notice how you feel. Miss a day and
          nothing breaks — you just pick up where you left off. Everything here
          stays on your device.
        </p>
      </div>

      <ResetTracker />
    </main>
  );
}
