import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge needs to know about our custom type-scale utilities,
 * otherwise `text-h2` and `text-fg` would be treated as conflicting
 * (both start with `text-`) and one would be dropped.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "overline",
            "body-lg",
            "body",
            "body-sm",
            "caption",
            "micro",
            "stat",
          ],
        },
      ],
      shadow: [{ shadow: ["e1", "e2", "e3", "e4", "glow"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
