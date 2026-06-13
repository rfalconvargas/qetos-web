import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DecisionLab } from "@/components/DecisionLab";

export const metadata: Metadata = {
  title: "Decision Lab — Qetos",
  description:
    "Tell Qetos what you're craving, the moment you're in, and a rule to lean on. Get one gentle next step — never a verdict.",
};

export default function DecisionLabPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-24 pt-32 sm:pt-40">
      <Link
        href="/#decision-lab"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" /> Back to overview
      </Link>

      <div className="mb-12 mt-6 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Decision Lab
        </span>
        <h1 className="mt-3 font-display text-h1 font-medium tracking-tight text-navy">
          A craving is a question. Let&apos;s answer it gently.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-text-muted">
          There&apos;s no wrong answer here. Pick what&apos;s true right now, and
          Qetos will offer one calm, compliant next step that honors the
          craving instead of fighting it.
        </p>
      </div>

      <DecisionLab />
    </main>
  );
}
