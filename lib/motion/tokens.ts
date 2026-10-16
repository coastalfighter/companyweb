/**
 * Motion design tokens (docs/blueprint/11-motion-system.md, §1). One source for every
 * GSAP timeline and the CSS that mirrors it (styles/tokens.css `--ease-*`, `--dur-*`).
 *
 * Tone: precise, confident, tech-forward. Per emil-design-eng, entrances use a strong
 * ease-out (fast start = instant feedback), on-screen movement uses ease-in-out, and
 * nothing bounces except the magnetic spring-back, which is small enough to read as
 * physical rather than cartoony.
 */

export const palette = {
  /** Brand lime: an accent that "hits like a laser, not a floodlight" (≤10% of any screen). */
  volt: "#A3E635",
  voltGlow: "#C6F56B",
  /** Brand black, the canvas for 90% of every screen. */
  ink: "#0A0A0A",
  ink900: "#111113",
  ink800: "#1C1C1F",
  line: "#2E2E33",
  fg: "#F4F4F5",
  fgMuted: "#A3A3AD",
} as const;

export const ease = {
  /** Default entrance: power3.out ≈ cubic-bezier(0.215, 0.61, 0.355, 1). */
  entrance: "power3.out",
  /** Hero focal moments: expo.out ≈ var(--ease-out-expo), cubic-bezier(0.16, 1, 0.3, 1). */
  focal: "expo.out",
  /** Shutters and curtains: both ends soft, fast middle (power4.inOut). */
  curtain: "power4.inOut",
  /** Ambient loops (yoyo): power2.inOut, so the turnaround never "hits a wall". */
  loop: "power2.inOut",
  /** Exits are faster and accelerate away (still not ease-in on UI the user touches). */
  exit: "power2.in",
  /** Pointer followers (cursor, tilt): power3.out on a quickTo, so motion lags slightly. */
  follow: "power3.out",
  /** Magnetic release: a single soft overshoot, amplitude 1, period 0.55. */
  spring: "elastic.out(1, 0.55)",
  /** Scrubbed and constant motion: 1:1 with scroll or time. */
  linear: "none",
} as const;

/** Seconds (GSAP units). */
export const duration = {
  instant: 0.08,
  press: 0.12,
  fast: 0.15,
  base: 0.22,
  slow: 0.36,
  /** Scroll reveals of text and cards. */
  reveal: 0.8,
  /** Count-up stats. */
  count: 1.5,
  /** Each half of the route curtain (cover + reveal = 0.6s). */
  curtainHalf: 0.3,
  /** Boot preloader, from first frame to fully lifted. */
  preloader: 1.45,
  /** Pointer followers' catch-up. */
  follow: 0.1,
} as const;

export const stagger = {
  /** Words in a headline. */
  words: 0.06,
  /** Menu items, short lists. */
  tight: 0.05,
  /** Siblings in a section (brief: 0.08–0.12s). */
  base: 0.09,
  loose: 0.12,
} as const;

/** Pixels unless noted. */
export const distance = {
  text: 48,
  card: 80,
  /** Card content shift on hover. */
  nudge: 4,
  /** Card lift on hover. */
  lift: 8,
  /** Magnetic pull ceiling and reach. */
  magnet: 12,
  magnetRadius: 80,
  /** Blur for the "materialize" text reveal. */
  blur: 8,
} as const;

/** Scroll-speed multipliers relative to content (1×). */
export const parallax = {
  mesh: 0.15,
  grid: 0.3,
  particles: 0.5,
  /** Particle shift per pixel of pointer offset from the viewport centre. */
  pointer: 0.05,
} as const;

export const tilt = {
  /** Degrees. The brief allows up to 10; 8 keeps body copy legible at the extremes. */
  max: 8,
  /** Visual and media cards (no paragraphs) may use the full range. */
  maxMedia: 10,
} as const;

export const motionTokens = { palette, ease, duration, stagger, distance, parallax, tilt } as const;
export type MotionTokens = typeof motionTokens;
