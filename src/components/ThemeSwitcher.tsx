"use client";

import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { THEME_PREFERENCE_LABELS, THEME_PREFERENCE_ORDER, THEME_SWATCH } from "@/lib/theme";

/**
 * The Lodge has no persistent sidebar the way the other cabin apps do (it's
 * a single page), so the theme control floats in a corner instead of
 * living at the bottom of one — same swatches, same behavior, new home.
 */
export function ThemeSwitcher() {
  const { preference, setTheme } = useTheme();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 rounded-full border border-walnut-500/15 bg-parchment-paper px-2.5 py-2 shadow-lifted">
      {THEME_PREFERENCE_ORDER.map((t) => {
        const active = preference === t;
        const ring = active ? "ring-canopy-900/50" : "ring-walnut-500/20 hover:ring-walnut-500/45";

        if (t === "auto") {
          return (
            <button
              key={t}
              onClick={() => setTheme(t)}
              title="Auto — follow system"
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canopy-900/5 ring-1 ring-offset-1 ring-offset-parchment-paper transition-all",
                ring
              )}
            >
              <Monitor size={12} className="text-charcoal-600/70" strokeWidth={2} />
            </button>
          );
        }

        const [surface, accent] = THEME_SWATCH[t];
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            title={`${THEME_PREFERENCE_LABELS[t]} theme`}
            className={cn(
              "h-6 w-6 shrink-0 rounded-full ring-1 ring-offset-1 ring-offset-parchment-paper transition-all",
              ring
            )}
            style={{ background: `linear-gradient(135deg, ${surface} 50%, ${accent} 50%)` }}
          />
        );
      })}
    </div>
  );
}
