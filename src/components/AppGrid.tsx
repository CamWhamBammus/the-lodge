"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, TreePine } from "lucide-react";
import { AppCard } from "@/components/AppCard";
import { AddAppModal } from "@/components/AddAppModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/EmptyState";
import type { AppWithStatus } from "@/types";

export function AppGrid({ initialApps }: { initialApps: AppWithStatus[] }) {
  const [apps, setApps] = useState(initialApps);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const busyIdsRef = useRef(busyIds);
  useEffect(() => {
    busyIdsRef.current = busyIds;
  }, [busyIds]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/apps");
      if (!res.ok) return;
      const data: { apps: AppWithStatus[] } = await res.json();
      // Don't clobber a card mid-launch with a stale "stopped" read.
      setApps((prev) =>
        data.apps.map((next) => {
          if (busyIdsRef.current.has(next.id)) {
            const current = prev.find((a) => a.id === next.id);
            return current ?? next;
          }
          return next;
        })
      );
    } catch {
      // network hiccup — next poll will catch up
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 4000);
    return () => clearInterval(interval);
  }, [refresh]);

  function setBusy(id: string, value: boolean) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleLaunch(app: AppWithStatus) {
    // Open the tab synchronously, inside the click handler, so browsers don't
    // treat it as an unsolicited popup — then point it at the real URL once
    // we know the app is actually up. window.open() called after an `await`
    // (e.g. once the launch request resolves) gets silently blocked by most
    // browsers because it's no longer considered part of the user gesture.
    const tab = window.open("about:blank", "_blank");

    if (app.status === "running") {
      if (tab) tab.location.href = app.url;
      return;
    }

    setBusy(app.id, true);
    setNotice(null);
    try {
      const res = await fetch(`/api/apps/${app.id}/launch`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        tab?.close();
        setNotice(data.message ?? `Couldn't start "${app.name}".`);
        return;
      }
      if (tab) {
        tab.location.href = data.url;
      } else {
        setNotice(`"${app.name}" is ready at ${data.url} — your browser blocked the pop-up.`);
      }
    } catch {
      tab?.close();
      setNotice(`Couldn't reach The Lodge's server to start "${app.name}".`);
    } finally {
      setBusy(app.id, false);
      refresh();
    }
  }

  async function handleStop(app: AppWithStatus) {
    setBusy(app.id, true);
    setNotice(null);
    try {
      const res = await fetch(`/api/apps/${app.id}/stop`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.message ?? `Couldn't stop "${app.name}".`);
      }
    } finally {
      setBusy(app.id, false);
      refresh();
    }
  }

  async function handleRemove(app: AppWithStatus) {
    if (!confirm(`Remove "${app.name}" from The Lodge? This won't touch its files.`)) return;
    setApps((prev) => prev.filter((a) => a.id !== app.id));
    await fetch(`/api/apps/${app.id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-moss-600 to-canopy-900 text-parchment-50 shadow-soft">
              <TreePine size={20} strokeWidth={1.75} />
            </div>
            <h1 className="font-serif text-3xl text-canopy-900">The Lodge</h1>
          </div>
          <p className="mt-2 text-sm text-charcoal-600">Home base for every app in the cabin.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add app
        </Button>
      </div>

      {notice && (
        <div className="mt-5 rounded-md border border-clay-500/30 bg-clay-500/8 px-4 py-2.5 text-sm text-clay-500">
          {notice}
        </div>
      )}

      {apps.length === 0 ? (
        <EmptyState onAdd={() => setModalOpen(true)} />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app, index) => (
            <AppCard
              key={app.id}
              app={app}
              busy={busyIds.has(app.id)}
              index={index}
              onLaunch={() => handleLaunch(app)}
              onStop={() => handleStop(app)}
              onRemove={() => handleRemove(app)}
            />
          ))}
        </div>
      )}

      <AddAppModal open={modalOpen} onClose={() => setModalOpen(false)} onAdded={refresh} />
    </div>
  );
}
