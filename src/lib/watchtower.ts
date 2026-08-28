import type { AlmanacSummary, ForgeSummary, LedgerSummary, MailroomSummary, ReadingCabinSummary } from "@/types";

/**
 * Read-only status pings to the other cabin apps' existing public APIs —
 * same "separate process, plain HTTP, no shared code" integration style
 * Mailroom already uses toward Almanac (see mailroom/src/lib/almanac.ts).
 * Each fetch is short-timeout-and-catch: any failure just means "no data,"
 * never an error surfaced to the homepage.
 */
const TIMEOUT_MS = 2500;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

export async function fetchAlmanacSummary(port: number): Promise<AlmanacSummary | null> {
  try {
    // Almanac computes this itself — day-keys, habit schedules and recurring
    // event projection all live over there, so re-deriving them here just
    // meant two copies that could disagree.
    return await getJson<AlmanacSummary>(`http://localhost:${port}/api/summary`);
  } catch {
    return null;
  }
}

interface ReadingCabinTextbook {
  title: string;
  percentComplete: number;
}

export async function fetchReadingCabinSummary(port: number): Promise<ReadingCabinSummary | null> {
  try {
    const base = `http://localhost:${port}`;
    const [currentlyReading, todayStats] = await Promise.all([
      getJson<ReadingCabinTextbook[]>(`${base}/api/textbooks?status=CURRENTLY_READING`),
      getJson<{ pagesRead: number }>(`${base}/api/reading-stats/today`),
    ]);

    const book = currentlyReading[0];
    return {
      currentlyReading: book ? { title: book.title, percentComplete: Math.round(book.percentComplete) } : null,
      pagesReadToday: todayStats.pagesRead,
    };
  } catch {
    return null;
  }
}

export async function fetchMailroomSummary(port: number): Promise<MailroomSummary | null> {
  try {
    const data = await getJson<{ accounts: string[] }>(`http://localhost:${port}/api/accounts`);
    return { accountCount: data.accounts.length };
  } catch {
    return null;
  }
}

export async function fetchLedgerSummary(port: number): Promise<LedgerSummary | null> {
  try {
    const data = await getJson<{ netThisMonth: number; unpaidBillsCount: number }>(
      `http://localhost:${port}/api/summary`
    );
    return { netThisMonth: data.netThisMonth, unpaidBillsCount: data.unpaidBillsCount };
  } catch {
    return null;
  }
}

export async function fetchForgeSummary(port: number): Promise<ForgeSummary | null> {
  try {
    return await getJson<ForgeSummary | null>(`http://localhost:${port}/api/summary`);
  } catch {
    return null;
  }
}
