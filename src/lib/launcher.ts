import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import type { AppEntry, AppStatus } from "@/types";

const RUNTIME_DIR = path.join(process.cwd(), ".runtime");
const LOG_DIR = path.join(RUNTIME_DIR, "logs");
const PID_FILE = path.join(RUNTIME_DIR, "pids.json");

type PidMap = Record<string, { pid: number; port: number; startedAt: number }>;

function readPidMap(): PidMap {
  if (!fs.existsSync(PID_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(PID_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writePidMap(map: PidMap) {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(PID_FILE, JSON.stringify(map, null, 2), "utf-8");
}

export function appUrl(app: AppEntry) {
  return `http://localhost:${app.port}`;
}

export function logPath(app: AppEntry) {
  return path.join(LOG_DIR, `${app.id}.log`);
}

/** Any response at all — even a 404 — means something is listening. */
async function isPortAlive(port: number): Promise<boolean> {
  try {
    await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(1200) });
    return true;
  } catch {
    return false;
  }
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function getStatus(app: AppEntry): Promise<AppStatus> {
  if (await isPortAlive(app.port)) return "running";
  const entry = readPidMap()[app.id];
  if (entry && isProcessAlive(entry.pid)) return "starting";
  return "stopped";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function startApp(
  app: AppEntry
): Promise<{ status: "running" | "started" | "timeout"; url: string; logPath?: string }> {
  const url = appUrl(app);

  if (await isPortAlive(app.port)) {
    return { status: "running", url };
  }

  fs.mkdirSync(LOG_DIR, { recursive: true });
  const logFile = logPath(app);
  const fd = fs.openSync(logFile, "a");
  fs.writeSync(
    fd,
    `\n--- launching "${app.name}" at ${new Date().toISOString()} via: ${app.command} ---\n`
  );

  // Drop empty-string vars from our own environment before handing it down.
  // dotenv (and Next's .env.local loader) never overrides a key that's
  // already present in process.env — even if it's blank — so an empty var
  // inherited from The Lodge's own process would silently shadow a real
  // value the child app defines in its own .env.local.
  const cleanEnv = Object.fromEntries(
    Object.entries(process.env).filter(([, v]) => v !== "")
  ) as NodeJS.ProcessEnv;

  const child = spawn("/bin/sh", ["-c", app.command], {
    cwd: app.path,
    env: { ...cleanEnv, PORT: String(app.port) },
    detached: true,
    stdio: ["ignore", fd, fd],
  });
  fs.closeSync(fd);
  child.unref();

  if (child.pid) {
    const map = readPidMap();
    map[app.id] = { pid: child.pid, port: app.port, startedAt: Date.now() };
    writePidMap(map);
  }

  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    await sleep(700);
    if (await isPortAlive(app.port)) {
      return { status: "started", url };
    }
  }
  return { status: "timeout", url, logPath: logFile };
}

export async function stopApp(
  app: AppEntry
): Promise<{ status: "stopped" | "not-managed" | "already-stopped" }> {
  const map = readPidMap();
  const entry = map[app.id];

  if (!entry) {
    return (await isPortAlive(app.port)) ? { status: "not-managed" } : { status: "already-stopped" };
  }

  if (isProcessAlive(entry.pid)) {
    try {
      // Negative pid targets the whole process group spawned with detached: true,
      // so this also kills the `npm run dev` -> `next dev` child, not just the shell.
      process.kill(-entry.pid, "SIGTERM");
    } catch {
      // process group already gone
    }
  }

  delete map[app.id];
  writePidMap(map);
  return { status: "stopped" };
}
