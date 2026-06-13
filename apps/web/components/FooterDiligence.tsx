import { ShieldCheck, BookOpen, UserCheck } from "lucide-react";
import { Card } from "./ui/Card";
import { WaitlistCTA } from "./WaitlistCTA";

const PRINCIPLES = [
  { icon: BookOpen, label: "Educational, not medical advice" },
  { icon: UserCheck, label: "AI-assisted, human-reviewed" },
  { icon: ShieldCheck, label: "Local-first & private" },
];

const LINKS = [
  { label: "Sources", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Ailiur", href: "https://ailiur.com" },
  { label: "Case Study", href: "https://rfalcon.com/projects/qetos" },
];

export function FooterDiligence() {
  return (
    <footer
      id="waitlist"
      className="mx-auto w-full max-w-6xl scroll-mt-28 px-5 pb-16 pt-10"
    >
      {/* Waitlist (carried over) */}
      <Card
        strong
        className="mb-8 grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-2 lg:items-center"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
            Limited early access
          </p>
          <h2 className="mt-3 font-display text-h2 font-medium tracking-tight text-navy">
            Be first to power your calm.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
            Qetos is your calm, AI-guided companion for metabolic and mental
            health. Drop your number and we&apos;ll text you when your spot is
            ready.
          </p>
        </div>
        <WaitlistCTA />
      </Card>

      {/* Diligence statement */}
      <div className="rounded-[var(--radius-card)] border border-white/60 bg-white/45 px-6 py-8 sm:px-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Diligence &amp; safety
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-text/80">
          This AI-assisted prototype is for education and self-reflection only.
          It is not medical advice. Health claims and nutrition guidance should
          be reviewed against credible sources before publication. Personal rules
          reflect user-defined experiments, not universal dietary prescriptions.
        </p>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;
            return (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 text-xs font-medium text-text-muted"
              >
                <Icon className="h-3.5 w-3.5 text-navy" strokeWidth={1.75} />
                {p.label}
              </span>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-6 border-t border-text-muted/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-base leading-none text-glow">
              ✦
            </span>
            <span className="font-display text-lg font-semibold text-navy">
              Qetos
            </span>
            <span className="text-sm text-text-muted">
              · A subcompany of Ailiur
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
            {LINKS.map((l) => {
              const external = l.href.startsWith("http");
              return (
                <a
                  key={l.label}
                  href={l.href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="transition-colors hover:text-navy"
                >
                  {l.label}
                </a>
              );
            })}
          </nav>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-text-muted/80">
          © 2026 Qetos. A subcompany of Ailiur. Built as a product teaser — local-first
          and educational by design.
        </p>
      </div>
    </footer>
  );
}
