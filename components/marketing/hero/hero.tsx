import Link from "next/link";
import { CheckIcon } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ctas, prefetchFor } from "@/lib/site";
import { OpsFeed } from "./ops-feed";

const commitments = [
  "Live in 10 business days",
  "No long-term lock-in",
  "NDA before the first call",
] as const;

/**
 * Homepage hero, Concept 1 "The Ops Feed" (docs/blueprint/04-hero-concepts.md, D1).
 * The H1 is the LCP element: it is in the server HTML and its lines animate with
 * transform only (never from opacity 0), so it counts as painted on the first frame.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="grain isolate overflow-hidden pt-28 pb-24 sm:pt-32 lg:flex lg:min-h-[max(680px,calc(100svh-64px))] lg:items-center lg:pt-32 lg:pb-24"
    >
      <div aria-hidden className="grid-overlay pointer-events-none absolute inset-0 -z-10 animate-fade-in" />
      <div
        aria-hidden
        className="hero-glow-drift pointer-events-none absolute -z-10 size-[720px] rounded-full bg-(image:--glow-volt) max-lg:top-[55%] max-lg:left-1/2 max-lg:-translate-x-1/2 lg:top-[8%] lg:right-[-8%]"
      />
      <div aria-hidden className="hero-floor pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[42%]">
        <div className="hero-floor-plane">
          <div className="hero-floor-lines" />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-(--container-content) grid-cols-1 items-center gap-14 px-(--gutter) lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Eyebrow live className="mb-6 animate-rise">
            Operations, handled
          </Eyebrow>

          {/* Desktop: three set lines that rise in sequence. Mobile: one flowing
              headline (fixed line breaks would leave 1–2 words per line at 375px). */}
          <h1
            id="hero-title"
            className="font-display text-[clamp(3rem,1.94rem+4.51vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.035em] text-fg max-lg:animate-rise-lcp"
          >
            <span className="lg:block lg:animate-rise-lcp">We run the parts </span>
            <span className="lg:block lg:animate-rise-lcp lg:[animation-delay:80ms]">of your business </span>
            <span className="lg:block lg:animate-rise-lcp lg:[animation-delay:160ms]">
              <span className="text-volt-gradient text-shimmer">nobody sees.</span>
            </span>
          </h1>

          <p className="mt-7 max-w-[52ch] animate-rise text-body-lg text-fg-muted [animation-delay:200ms]">
            Akrostech is the operations team behind growing companies. Engineering, hiring, admin, finance,
            and legal work, delivered by dedicated specialists on timelines you can audit.
          </p>

          <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:280ms] sm:flex-row">
            <Button asChild size="lg" iconRight="arrow" className="max-sm:h-14">
              <Link href={ctas.primary.href} prefetch={prefetchFor(ctas.primary.href)}>
                {ctas.primary.label}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="max-sm:h-14">
              <Link href={ctas.secondary.href} prefetch={prefetchFor(ctas.secondary.href)}>
                {ctas.secondary.label}
              </Link>
            </Button>
          </div>

          <ul
            aria-label="Commitments"
            className="mt-8 flex animate-rise flex-wrap items-center gap-x-5 gap-y-2 text-caption text-fg-subtle [animation-delay:360ms]"
          >
            {commitments.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <CheckIcon aria-hidden weight="bold" className="size-3.5 text-volt-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-panel-in lg:col-span-5">
          <div className="hero-depth">
            <OpsFeed />
          </div>
        </div>
      </div>
    </section>
  );
}
