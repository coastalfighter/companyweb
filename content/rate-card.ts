import { type RateCard } from "@/lib/calculator/model";

/**
 * AKROSTECH'S APPROVED RATE CARD (USD per hour, low–high per function).
 *
 * The calculator shows "Estimated Akrostech cost", savings, break-even and the
 * comparison chart only when this is set (docs/blueprint/06-cta-conversion.md,
 * F4). Until then it shows today's cost and the hours returned, and invites a
 * quote. Use the rates the sales team actually quotes; record who approved them.
 * A sample card for design review lives in ./samples.ts (sampleRateCard).
 */
export const rateCard: RateCard | null = null;
