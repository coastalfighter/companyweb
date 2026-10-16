import Link from "next/link";
import { cn } from "@/lib/utils";

/** Placeholder mark until the official SVG is supplied (see README "Brand assets"). */
export function Logo({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      aria-label="Akrostech home"
      onClick={onNavigate}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="6" fill="var(--volt-500)" />
        <path
          d="M8 20 L14 7 L20 20 M10.6 15 H17.4"
          stroke="var(--ink-950)"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-[1.1875rem] font-semibold tracking-[-0.02em] text-fg">
        Akrostech
      </span>
    </Link>
  );
}
