import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Custom font sizes from tailwind.config.ts (the shared type scale).
 * tailwind-merge does not read the Tailwind config, so without this list it
 * treats `text-h1` as a text *color* and drops it when merged with a real
 * color such as `text-content-primary`.
 */
export const TYPE_SCALE_CLASSES = [
  "display",
  "h1",
  "h1-docs",
  "h2",
  "h3",
  "body",
  "small",
  "label",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TYPE_SCALE_CLASSES] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
