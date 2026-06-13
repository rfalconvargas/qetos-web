import {
  MessageCircle,
  ListChecks,
  Utensils,
  Activity,
  Wind,
  BookOpen,
  Sparkles,
  TrendingUp,
  Network,
  HeartPulse,
  Eye,
  ArrowDown,
} from "lucide-react";
import { Card } from "./ui/Card";

const CONSUMER = [
  { icon: MessageCircle, label: "AI companion", desc: "Asks before it advises." },
  { icon: ListChecks, label: "Daily protocol actions", desc: "One window at a time." },
  { icon: Utensils, label: "Meal logging", desc: "Photo, label, or quick add." },
  { icon: Activity, label: "Ketone logging", desc: "Fasted readings & GKI." },
  { icon: Wind, label: "Guided breathing", desc: "Five-minute stress resets." },
  { icon: BookOpen, label: "Recipes", desc: "Protocol-aligned, not bland." },
  { icon: Sparkles, label: "Victory tracking", desc: "Momentum, banked." },
];

const CLINICAL = [
  { icon: TrendingUp, label: "Adherence trends", desc: "Follow-through over time, not snapshots." },
  { icon: Network, label: "Symptom correlations", desc: "What moves with what, surfaced gently." },
  { icon: HeartPulse, label: "Biometric context", desc: "Sleep, ketones & labs in one view." },
  { icon: Eye, label: "Early disengagement signals", desc: "A quiet heads-up before someone drifts." },
];

function FeatureRow({
  icon: Icon,
  label,
  desc,
}: {
  icon: typeof Sparkles;
  label: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-navy">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-sm font-semibold text-navy">{label}</p>
        <p className="text-xs text-text-muted">{desc}</p>
      </div>
    </li>
  );
}

export function ProductSystem() {
  return (
    <div>
      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        {/* Consumer — B2C */}
        <Card strong className="flex flex-col p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-navy">
              Consumer companion
            </span>
            <span className="text-xs font-medium text-text-muted">Today</span>
          </div>
          <h3 className="mb-1 font-display text-2xl text-navy">For the person</h3>
          <p className="mb-5 text-sm leading-relaxed text-text-muted">
            A calm daily companion that turns a protocol into momentum.
          </p>
          <ul className="space-y-3.5">
            {CONSUMER.map((f) => (
              <FeatureRow key={f.label} {...f} />
            ))}
          </ul>
        </Card>

        {/* Clinical — B2B (roadmap) */}
        <Card className="flex flex-col border-dashed p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white/60 px-3 py-1 text-xs font-semibold text-navy">
              Clinical layer
            </span>
            <span className="text-xs font-medium text-text-muted">
              On the roadmap
            </span>
          </div>
          <h3 className="mb-1 font-display text-2xl text-navy">
            For the clinician
          </h3>
          <p className="mb-5 text-sm leading-relaxed text-text-muted">
            The same calm system, seen as context a care team can act on.
          </p>
          <ul className="space-y-3.5">
            {CLINICAL.map((f) => (
              <FeatureRow key={f.label} {...f} />
            ))}
          </ul>
        </Card>
      </div>

      {/* Connector / framing */}
      <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-white">
          <ArrowDown className="h-4 w-4" />
        </span>
        <p className="text-sm leading-relaxed text-text-muted">
          Every consumer action becomes context the clinical layer can act on —
          so Qetos can grow from a personal companion into a shared tool between
          a person and their care team.{" "}
          <span className="text-navy">
            The clinical layer is product direction, not a finished feature.
          </span>
        </p>
      </div>
    </div>
  );
}
