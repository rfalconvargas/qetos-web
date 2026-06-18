import Link from "next/link";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/ui/Section";
import { ProtocolTranslator } from "@/components/ProtocolTranslator";
import { DecisionLab } from "@/components/DecisionLab";
import { LogVictory } from "@/components/LogVictory";
import { ResetTracker } from "@/components/ResetTracker";
import { ProductSystem } from "@/components/ProductSystem";
import { FeedbackCTA } from "@/components/FeedbackCTA";

export default function Home() {
  return (
    <main className="relative overflow-clip">
      <Hero />

      <Section
        id="translate"
        index={1}
        eyebrow="Protocol Translation"
        title="The protocol isn't the product. The daily interpretation is."
        intro="Your plan arrives dense and clinical. Qetos reads it the way a thoughtful coach would — and hands back what to actually do, mapped to the natural rhythm of your day."
      >
        <ProtocolTranslator />
      </Section>

      <Section
        id="decision-lab"
        index={2}
        eyebrow="Decision Lab"
        title="A calm decision mirror — not a judgment engine."
        intro="In the moment of wanting, you don't need a rulebook. Tell Qetos what's happening and it reflects the pattern back, then offers one better step and a sentence to hold onto."
      >
        <DecisionLab />
        <p className="mt-4 text-sm text-text-muted">
          Want the focused version?{" "}
          <Link
            href="/decision-lab"
            className="font-semibold text-navy underline-offset-2 hover:underline"
          >
            Open the full Decision Lab →
          </Link>
        </p>
      </Section>

      <Section
        id="victory"
        index={3}
        eyebrow="Log a Victory"
        title="Momentum is built from small wins, banked on purpose."
        intro="No streaks to break, no guilt when life happens — including the days you re-enter after a relapse. Just a quiet record of the moments you showed up."
      >
        <LogVictory />
      </Section>

      <Section
        id="reset"
        index={4}
        eyebrow="30-Day Reset"
        title="One gentle experiment, thirty forgiving days."
        intro="Step away from one thing and notice how you feel. Some days are momentum, some are a reset, some are reflection — every one of them counts, and it all stays on your device."
      >
        <ResetTracker />
        <p className="mt-4 text-sm text-text-muted">
          Prefer a dedicated space?{" "}
          <Link
            href="/reset"
            className="font-semibold text-navy underline-offset-2 hover:underline"
          >
            Open the full 30-Day Reset →
          </Link>
        </p>
      </Section>

      <Section
        id="system"
        index={5}
        eyebrow="The Product System"
        title="A companion today. A clinical layer tomorrow."
        intro="Everything Qetos does for a person rolls up into context a clinician can act on — the same calm system, seen from two sides."
      >
        <ProductSystem />
      </Section>

      <FeedbackCTA />
    </main>
  );
}
