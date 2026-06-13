"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#translate", label: "Translate" },
  { href: "/#decision-lab", label: "Decision Lab" },
  { href: "/#reset", label: "30-Day Reset" },
  { href: "/#system", label: "System" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full py-2.5 pl-5 pr-2.5 transition-colors duration-300",
          scrolled ? "glass-strong" : "glass"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-base leading-none text-glow">
            ✦
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-navy">
            Qetos
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-text/75 transition-colors hover:text-navy"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/#waitlist"
            className="hidden rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:inline-block"
          >
            Join waitlist
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full text-navy md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass-strong mx-auto mt-3 max-w-6xl rounded-[var(--radius-card)] p-3 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-text/80 hover:bg-white/50 hover:text-navy"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#waitlist"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-2xl bg-navy px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Join waitlist
          </a>
        </div>
      )}
    </header>
  );
}
