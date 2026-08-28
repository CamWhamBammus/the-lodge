import { NextResponse } from "next/server";
import { listApps } from "@/lib/apps";
import { getStatus } from "@/lib/launcher";
import {
  fetchAlmanacSummary,
  fetchForgeSummary,
  fetchLedgerSummary,
  fetchMailroomSummary,
  fetchReadingCabinSummary,
} from "@/lib/watchtower";
import type { AppEntry, WatchtowerResponse } from "@/types";

async function resolveIfRunning<T>(
  app: AppEntry | undefined,
  fetcher: (port: number) => Promise<T | null>
): Promise<T | null> {
  if (!app) return null;
  if ((await getStatus(app)) !== "running") return null;
  return fetcher(app.port);
}

export async function GET() {
  const apps = listApps();
  const almanac = apps.find((a) => a.id === "almanac");
  const readingCabin = apps.find((a) => a.id === "reading-cabin");
  const mailroom = apps.find((a) => a.id === "mailroom");
  const ledger = apps.find((a) => a.id === "ledger");
  const forge = apps.find((a) => a.id === "the-forge");

  const [almanacSummary, readingCabinSummary, mailroomSummary, ledgerSummary, forgeSummary] = await Promise.all([
    resolveIfRunning(almanac, fetchAlmanacSummary),
    resolveIfRunning(readingCabin, fetchReadingCabinSummary),
    resolveIfRunning(mailroom, fetchMailroomSummary),
    resolveIfRunning(ledger, fetchLedgerSummary),
    resolveIfRunning(forge, fetchForgeSummary),
  ]);

  const body: WatchtowerResponse = {
    almanac: almanacSummary,
    "reading-cabin": readingCabinSummary,
    mailroom: mailroomSummary,
    ledger: ledgerSummary,
    "the-forge": forgeSummary,
  };
  return NextResponse.json(body);
}
