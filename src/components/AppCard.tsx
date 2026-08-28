"use client";

import { ExternalLink, Loader2, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAppAccent, getAppIcon } from "@/lib/appVisuals";
import { Button } from "@/components/ui/Button";
import type { AppWithStatus } from "@/types";

const DOT_STYLES: Record<AppWithStatus["status"], string> = {
  running: "bg-moss-600 pulse-dot",
  starting: "bg-amber-500 pulse-soft",
  stopped: "bg-charcoal-600/40",
};

const STATUS_TEXT: Record<AppWithStatus["status"], string> = {
  running: "Running",
  starting: "Starting…",
  stopped: "Not running",
};

export function AppCard({
  app,
  busy,
  index,
  onLaunch,
  onStop,
  onRemove,
}: {
  app: AppWithStatus;
  busy: boolean;
  index: number;
  onLaunch: () => void;
  onStop: () => void;
  onRemove: () => void;
}) {
  const running = app.status === "running";
  const starting = app.status === "starting" || busy;
  const status: AppWithStatus["status"] = starting && !running ? "starting" : app.status;
  const Icon = getAppIcon(app.id);
  const accent = getAppAccent(app.id);

  return (
    <div
      className="card-in group flex flex-col rounded-lg border border-walnut-500/15 bg-parchment-paper p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="relative">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-parchment-50 shadow-soft transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110",
              accent
            )}
          >
            {/* getAppIcon always returns a stable reference to one of a few
                module-level icon components — never creates a new one — so
                this isn't the unstable component identity the rule guards against. */}
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Icon size={24} strokeWidth={1.75} />
          </div>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-parchment-paper",
              DOT_STYLES[status]
            )}
            aria-hidden="true"
          />
        </div>
        <button
          onClick={onRemove}
          aria-label={`Remove ${app.name}`}
          className="rounded p-1.5 text-charcoal-600/40 opacity-0 transition-opacity hover:bg-clay-500/10 hover:text-clay-500 group-hover:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <h3 className="mt-3 font-serif text-lg leading-tight text-canopy-900">{app.name}</h3>
      {app.tagline && <p className="mt-1 text-sm text-charcoal-600">{app.tagline}</p>}

      <hr className="leaf-divider my-4" />

      <div className="mt-auto flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-charcoal-600/70">{STATUS_TEXT[status]}</span>
          <span className="text-[11px] text-charcoal-600/50">localhost:{app.port}</span>
        </div>

        <div className="flex items-center gap-2">
          {running && (
            <Button variant="secondary" size="sm" onClick={onStop} disabled={busy}>
              <Square size={13} />
              Stop
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onLaunch} disabled={starting && !running}>
            {starting && !running ? (
              <Loader2 size={14} className="animate-spin" />
            ) : running ? (
              <ExternalLink size={14} />
            ) : null}
            {running ? "Open" : starting ? "Starting…" : "Launch"}
          </Button>
        </div>
      </div>
    </div>
  );
}
