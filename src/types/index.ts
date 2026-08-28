export interface AppEntry {
  id: string;
  name: string;
  tagline: string;
  /** Absolute path to the app's project directory. */
  path: string;
  /** Shell command run inside `path` to start the dev server, e.g. "npm run dev". */
  command: string;
  /** Port the app listens on. Passed to the child process as $PORT. */
  port: number;
  createdAt: string;
}

export type AppStatus = "running" | "starting" | "stopped";

export interface AppWithStatus extends AppEntry {
  status: AppStatus;
  url: string;
}

export interface AlmanacSummary {
  overdueCount: number;
  dueTodayCount: number;
  nextEvent: { title: string; startTime: string | null } | null;
  habitsOpenCount: number;
  habitsDueCount: number;
  growth: number;
  title: string;
  nextUnlock: { name: string; pointsToGo: number } | null;
  bestStreak: number;
}

export interface ReadingCabinSummary {
  currentlyReading: { title: string; percentComplete: number } | null;
  pagesReadToday: number;
}

export interface MailroomSummary {
  accountCount: number;
}

export interface LedgerSummary {
  netThisMonth: number;
  unpaidBillsCount: number;
}

export interface ForgeSummary {
  title: string;
  daysRemaining: number;
  temperTier: "cold" | "cooling" | "warm" | "hot";
  milestonesDone: number;
  milestonesTotal: number;
}

export type WatchtowerAppId = "almanac" | "reading-cabin" | "mailroom" | "ledger" | "the-forge";

export interface WatchtowerResponse {
  almanac: AlmanacSummary | null;
  "reading-cabin": ReadingCabinSummary | null;
  mailroom: MailroomSummary | null;
  ledger: LedgerSummary | null;
  "the-forge": ForgeSummary | null;
}
