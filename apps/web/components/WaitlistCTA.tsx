"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

const GOALS = [
  "Metabolic reset",
  "Calmer stress & sleep",
  "Steadier energy",
  "Follow a protocol",
  "Just exploring",
];

type Status = "idle" | "sending" | "done" | "error";

export function WaitlistCTA() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      firstName: String(data.get("firstName") ?? ""),
      phone: String(data.get("phone") ?? ""),
      goal: String(data.get("goal") ?? ""),
      consent: data.get("consent") === "on",
    };
    if (!payload.firstName || !payload.phone || !payload.consent) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-white/70 bg-white/55 px-6 py-10 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[color-mix(in_srgb,#f7d070_55%,white)] text-navy">
          <Check className="h-6 w-6" />
        </span>
        <p className="font-display text-xl text-navy">You&apos;re on the list.</p>
        <p className="max-w-sm text-sm text-text-muted">
          We&apos;ll text you the moment your spot opens up. No pressure, no spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="firstName"
          required
          placeholder="First name"
          className="w-full rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm text-navy outline-none placeholder:text-text-muted/70 focus:border-[#cbe7e3] focus:ring-2 focus:ring-[#cbe7e3]"
        />
        <input
          name="phone"
          required
          type="tel"
          placeholder="Phone number"
          className="w-full rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm text-navy outline-none placeholder:text-text-muted/70 focus:border-[#cbe7e3] focus:ring-2 focus:ring-[#cbe7e3]"
        />
      </div>
      <select
        name="goal"
        defaultValue=""
        className="w-full rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm text-navy outline-none focus:border-[#cbe7e3] focus:ring-2 focus:ring-[#cbe7e3]"
      >
        <option value="" disabled>
          What brings you to Qetos? (optional)
        </option>
        {GOALS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <label className="flex items-start gap-2.5 px-1 text-xs leading-relaxed text-text-muted">
        <input
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-text-muted/40 accent-navy"
        />
        <span>
          It&apos;s okay to text me about early access. Qetos provides general
          wellness and educational information — not medical advice.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="group inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Join the waitlist"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
      {status === "error" && (
        <p className="px-1 text-xs text-text-muted">
          Something hiccuped on our end — please try again in a moment.
        </p>
      )}
    </form>
  );
}
