import Link from "next/link";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-navy text-white shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] focus-visible:ring-navy/40",
        secondary:
          "glass-strong text-navy hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] focus-visible:ring-navy/30",
        soft: "bg-mint text-navy hover:-translate-y-0.5 focus-visible:ring-navy/25",
        ghost:
          "text-navy/80 hover:bg-white/55 hover:text-navy focus-visible:ring-navy/20",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-sm",
        lg: "px-7 py-3.5 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type CommonProps = VariantProps<typeof buttonStyles> & {
  href?: string;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;

export function Button({
  variant,
  size,
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = cn(buttonStyles({ variant, size }), className);

  if (href) {
    const isExternal = /^(https?:|mailto:|tel:)/.test(href);
    const isHash = href.startsWith("#");
    if (isExternal || isHash) {
      return (
        <a
          href={href}
          className={cls}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
