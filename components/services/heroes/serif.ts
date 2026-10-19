import { Fraunces } from "next/font/google";

/**
 * The Legal page's serif voice (docs/blueprint/11-motion-system.md §3f). Not preloaded:
 * only /services/legal uses it, and its H1 paints in the fallback serif first (swap),
 * so the face never blocks the LCP.
 */
export const legalSerif = Fraunces({
  subsets: ["latin"],
  // One static weight (the H1 and the clause headings are both medium): about a third
  // of the variable file, which kept /services/legal under the 600 KB page budget.
  weight: "500",
  variable: "--font-serif",
  display: "swap",
  preload: false,
});
