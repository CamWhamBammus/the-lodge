"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAppAccent, getAppIcon } from "@/lib/appVisuals";
import { Button } from "@/components/ui/Button";
import type { AppWithStatus, WatchtowerResponse } from "@/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function WatchtowerPanel() {
  const [data, setData] = useState<WatchtowerResponse | null>(null);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  async function refresh() {
    try {
      const [wt, appsRes] = await Promise.all([
        fetch("/api/watchtower", { cache: "no-store" }).then((r) => r.json() as Promise<WatchtowerResponse>),
        fetch("/api/apps", { cache: "no-store" }).then((r) => r.json() as Promise<{ apps: AppWithStatus[] }>),
      ]);
      setData(wt);
      setRegisteredIds(new Set(appsRes.apps.map((a) => a.id)));
      setRunningIds(new Set(appsRes.apps.filter((a) => a.status === "running").map((a) => a.id)));
    } catch {
      // next poll picks it up
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function handleLaunch(id: string) {
    setLaunchingId(id);
    try {
      await fetch(`/api/apps/${id}/launch`, { method: "POST" });
    } finally {
      setLaunchingId(null);
      refresh();
    }
  }

  if (!data) return null;

  const anyRegistered =
    registeredIds.has("almanac") ||
    registeredIds.has("reading-cabin") ||
    registeredIds.has("mailroom") ||
    registeredIds.has("ledger") ||
    registeredIds.has("the-forge");
  if (!anyRegistered) return null;

  let cardIndex = 0;

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-medium tracking-wide text-charcoal-600/60 uppercase">
        <Eye size={13} strokeWidth={2} />
        Watchtower
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {registeredIds.has("almanac") && (
          <WatchtowerCard
            index={cardIndex++}
            name="Almanac"
            icon={getAppIcon("almanac")}
            accent={getAppAccent("almanac")}
            notRunning={data.almanac === null}
            launching={launchingId === "almanac"}
            onLaunch={() => handleLaunch("almanac")}
            headline={data.almanac ? String(data.almanac.overdueCount) : undefined}
            headlineLabel={data.almanac?.overdueCount === 1 ? "task overdue" : "tasks overdue"}
            tone={data.almanac && data.almanac.overdueCount > 0 ? "negative" : "positive"}
          >
            {data.almanac && (
              <>
                <p>
                  {data.almanac.dueTodayCount} due today ·{" "}
                  {data.almanac.habitsDueCount - data.almanac.habitsOpenCount}/{data.almanac.habitsDueCount} tended
                </p>
                <p className="truncate">
                  {data.almanac.growth} growth · {data.almanac.title}
                  {data.almanac.nextUnlock ? ` · ${data.almanac.nextUnlock.pointsToGo} to ${data.almanac.nextUnlock.name}` : ""}
                </p>
                {data.almanac.nextEvent && (
                  <p className="truncate">
                    Next: {data.almanac.nextEvent.title}
                    {data.almanac.nextEvent.startTime ? ` at ${data.almanac.nextEvent.startTime}` : ""}
                  </p>
                )}
              </>
            )}
          </WatchtowerCard>
        )}

        {registeredIds.has("reading-cabin") && (
          <WatchtowerCard
            index={cardIndex++}
            name="Reading Cabin"
            icon={getAppIcon("reading-cabin")}
            accent={getAppAccent("reading-cabin")}
            notRunning={data["reading-cabin"] === null}
            launching={launchingId === "reading-cabin"}
            onLaunch={() => handleLaunch("reading-cabin")}
            headline={
              data["reading-cabin"]
                ? data["reading-cabin"].currentlyReading
                  ? `${data["reading-cabin"].currentlyReading.percentComplete}%`
                  : String(data["reading-cabin"].pagesReadToday)
                : undefined
            }
            headlineLabel={
              data["reading-cabin"]?.currentlyReading
                ? `through ${data["reading-cabin"].currentlyReading.title}`
                : "pages today"
            }
            tone="neutral"
          >
            {data["reading-cabin"] && data["reading-cabin"].currentlyReading && (
              <p>
                {data["reading-cabin"].pagesReadToday} page{data["reading-cabin"].pagesReadToday === 1 ? "" : "s"}{" "}
                read today
              </p>
            )}
          </WatchtowerCard>
        )}

        {registeredIds.has("mailroom") && (
          <WatchtowerCard
            index={cardIndex++}
            name="Mailroom"
            icon={getAppIcon("mailroom")}
            accent={getAppAccent("mailroom")}
            notRunning={data.mailroom === null}
            launching={launchingId === "mailroom"}
            onLaunch={() => handleLaunch("mailroom")}
            headline={data.mailroom ? String(data.mailroom.accountCount) : undefined}
            headlineLabel={data.mailroom?.accountCount === 1 ? "account connected" : "accounts connected"}
            tone="neutral"
          />
        )}

        {registeredIds.has("ledger") && (
          <WatchtowerCard
            index={cardIndex++}
            name="Ledger"
            icon={getAppIcon("ledger")}
            accent={getAppAccent("ledger")}
            notRunning={data.ledger === null}
            launching={launchingId === "ledger"}
            onLaunch={() => handleLaunch("ledger")}
            headline={
              data.ledger
                ? `${data.ledger.netThisMonth >= 0 ? "+" : "−"}${currency.format(Math.abs(data.ledger.netThisMonth))}`
                : undefined
            }
            headlineLabel="this month"
            tone={data.ledger && data.ledger.netThisMonth >= 0 ? "positive" : "negative"}
          >
            {data.ledger && (
              <p>
                {data.ledger.unpaidBillsCount === 0
                  ? "No bills due"
                  : `${data.ledger.unpaidBillsCount} bill${data.ledger.unpaidBillsCount === 1 ? "" : "s"} due`}
              </p>
            )}
          </WatchtowerCard>
        )}

        {registeredIds.has("the-forge") && (
          <WatchtowerCard
            index={cardIndex++}
            name="The Forge"
            icon={getAppIcon("the-forge")}
            accent={getAppAccent("the-forge")}
            notRunning={!runningIds.has("the-forge")}
            launching={launchingId === "the-forge"}
            onLaunch={() => handleLaunch("the-forge")}
            headline={data["the-forge"] ? `${data["the-forge"].daysRemaining}d` : runningIds.has("the-forge") ? "—" : undefined}
            headlineLabel={data["the-forge"] ? "left" : "no active project"}
            tone={
              !data["the-forge"]
                ? "neutral"
                : data["the-forge"].temperTier === "hot" || data["the-forge"].temperTier === "warm"
                  ? "positive"
                  : data["the-forge"].temperTier === "cold"
                    ? "negative"
                    : "neutral"
            }
          >
            {data["the-forge"] && (
              <p className="truncate">
                {data["the-forge"].title} · {data["the-forge"].milestonesDone}/{data["the-forge"].milestonesTotal}{" "}
                milestones
              </p>
            )}
          </WatchtowerCard>
        )}
      </div>

      <hr className="leaf-divider mt-8" />
    </section>
  );
}

type Tone = "positive" | "negative" | "neutral";

const TONE_TEXT: Record<Tone, string> = {
  positive: "text-moss-600",
  negative: "text-clay-500",
  neutral: "text-canopy-900",
};

function WatchtowerCard({
  index,
  name,
  icon: Icon,
  accent,
  notRunning,
  launching,
  onLaunch,
  headline,
  headlineLabel,
  tone = "neutral",
  children,
}: {
  index: number;
  name: string;
  icon: LucideIcon;
  accent: string;
  notRunning: boolean;
  launching: boolean;
  onLaunch: () => void;
  headline?: string;
  headlineLabel?: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <div
      className="card-in flex flex-col rounded-lg border border-walnut-500/15 bg-parchment-paper p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-parchment-50",
            accent
          )}
        >
          <Icon size={13} strokeWidth={1.75} />
        </div>
        <span className="truncate text-[10px] font-medium tracking-wide text-charcoal-600/50 uppercase">
          {name}
        </span>
      </div>

      {notRunning ? (
        <div className="mt-4 flex-1">
          <p className="text-sm text-charcoal-600/50">Not running.</p>
        </div>
      ) : (
        <div className="mt-3 flex-1">
          <p className={cn("font-serif text-3xl leading-none", TONE_TEXT[tone])}>{headline}</p>
          <p className="mt-1.5 text-xs text-charcoal-600/60">{headlineLabel}</p>
          {children && <div className="mt-2 space-y-0.5 text-xs text-charcoal-600/70">{children}</div>}
        </div>
      )}

      {notRunning && (
        <Button variant="ghost" size="sm" className="mt-3 self-start" onClick={onLaunch} disabled={launching}>
          {launching ? "Launching…" : "Launch"}
        </Button>
      )}
    </div>
  );
}
