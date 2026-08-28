import { AppWindow, BookOpen, Flame, Gamepad2, Hammer, Mail, NotebookTabs, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Each known app gets its own brand icon (matching what that app itself
 * uses in its own sidebar) and a distinct accent gradient, so the launcher
 * and Watchtower read as a set of distinct places rather than repeats of
 * the same generic card. Unrecognized/custom apps fall back to a neutral
 * default rather than guessing.
 */
const ICONS: Record<string, LucideIcon> = {
  almanac: NotebookTabs,
  "reading-cabin": BookOpen,
  woodshed: Hammer,
  mailroom: Mail,
  ledger: Wallet,
  "the-forge": Flame,
  "the-foundry": Gamepad2,
};

const ACCENTS: Record<string, string> = {
  almanac: "from-moss-600 to-canopy-900",
  "reading-cabin": "from-walnut-500 to-walnut-900",
  woodshed: "from-amber-500 to-clay-500",
  mailroom: "from-sage-400 to-moss-600",
  ledger: "from-clay-500 to-canopy-950",
  "the-forge": "from-amber-500 to-charcoal-800",
  "the-foundry": "from-olive-500 to-walnut-900",
};

const DEFAULT_ICON = AppWindow;
const DEFAULT_ACCENT = "from-moss-600 to-canopy-800";

export function getAppIcon(id: string): LucideIcon {
  return ICONS[id] ?? DEFAULT_ICON;
}

export function getAppAccent(id: string): string {
  return ACCENTS[id] ?? DEFAULT_ACCENT;
}
