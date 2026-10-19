/**
 * Pure helpers for the service hero visuals (components/services/heroes/*).
 * No DOM, no GSAP: unit-tested in hero-math.test.ts.
 */

const TAU = Math.PI * 2;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * A point on a tilted elliptical orbit (The Swarm, §3d). `z` runs from -1 (far side)
 * to 1 (near side); `scale` shrinks far cards so the ring reads as 3D without WebGL.
 */
export function orbitPoint(
  angle: number,
  radiusX: number,
  radiusY: number,
): { x: number; y: number; z: number; scale: number } {
  const z = Math.sin(angle);
  return {
    x: Math.cos(angle) * radiusX,
    y: z * radiusY,
    z,
    scale: 0.78 + 0.22 * ((z + 1) / 2),
  };
}

/**
 * Quantizes depth into `levels` buckets (0 = nearest). Blur and stacking only change
 * when a card crosses a bucket boundary, never per frame (filters are costly to repaint).
 */
export function depthLevel(z: number, levels: number): number {
  if (levels <= 1) return 0;
  const near = (clamp(z, -1, 1) + 1) / 2; // 1 = nearest
  return clamp(Math.floor((1 - near) * levels), 0, levels - 1);
}

/** Even spacing for `count` cards around the orbit, starting at `phase` radians. */
export function orbitAngles(count: number, phase = 0): number[] {
  return Array.from({ length: count }, (_, i) => phase + (i / count) * TAU);
}

/**
 * Where particle `index` of `count` sits along a connector (0–1) after `seconds`,
 * travelling at `speed` path-lengths per second. Particles are evenly spaced and wrap.
 */
export function flowOffset(seconds: number, index: number, count: number, speed: number): number {
  const raw = seconds * speed + index / Math.max(count, 1);
  return ((raw % 1) + 1) % 1;
}

/**
 * Pointer position → a small tilt in degrees, ±`max` on each axis, so a card leans
 * toward the cursor. `rotateX` is inverted: the top edge comes toward a pointer above it.
 */
export function pointerTilt(
  clientX: number,
  clientY: number,
  width: number,
  height: number,
  max: number,
): { rotateX: number; rotateY: number } {
  if (width <= 0 || height <= 0) return { rotateX: 0, rotateY: 0 };
  const nx = clamp((clientX / width) * 2 - 1, -1, 1);
  const ny = clamp((clientY / height) * 2 - 1, -1, 1);
  return { rotateX: -ny * max, rotateY: nx * max };
}

/**
 * How many checklist items are ticked at scroll `progress` (0–1). The first ticks a
 * little way in and the last just before the hero leaves, so each one is seen landing.
 */
export function checkedCount(progress: number, total: number, start = 0.12, end = 0.7): number {
  if (total <= 0) return 0;
  const p = clamp((progress - start) / (end - start), 0, 1);
  return Math.max(0, Math.ceil(p * total - 1e-9));
}

/** "128400" → "128,400". Locale-independent, so server and client render the same text. */
export function formatAmount(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Characters in a line of the code editor, for `steps(n)` typing (one step per glyph). */
export function glyphCount(tokens: readonly { text: string }[]): number {
  return tokens.reduce((sum, token) => sum + [...token.text].length, 0);
}
