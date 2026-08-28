import fs from "node:fs";
import path from "node:path";
import type { AppEntry } from "@/types";

// Your real app list lives in data/apps.local.json, which is gitignored —
// it holds absolute paths that only exist on your own machine. The committed
// data/apps.example.json is the template a fresh clone starts from; the first
// write creates the local file so the example is never modified.
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "apps.local.json");
const EXAMPLE_FILE = path.join(DATA_DIR, "apps.example.json");

function sourceFile(): string {
  return fs.existsSync(DATA_FILE) ? DATA_FILE : EXAMPLE_FILE;
}

function readFile(): AppEntry[] {
  const file = sourceFile();
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8").trim();
  if (!raw) return [];
  return (JSON.parse(raw) as { apps: AppEntry[] }).apps;
}

function writeFile(apps: AppEntry[]) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ apps }, null, 2) + "\n", "utf-8");
}

export function listApps(): AppEntry[] {
  return readFile();
}

export function getApp(id: string): AppEntry | undefined {
  return readFile().find((a) => a.id === id);
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function addApp(input: {
  name: string;
  tagline: string;
  path: string;
  command: string;
  port: number;
}): AppEntry {
  const apps = readFile();
  const base = slugify(input.name) || "app";
  let id = base;
  let n = 2;
  while (apps.some((a) => a.id === id)) {
    id = `${base}-${n++}`;
  }
  const entry: AppEntry = {
    id,
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    path: input.path.trim(),
    command: input.command.trim(),
    port: input.port,
    createdAt: new Date().toISOString(),
  };
  apps.push(entry);
  writeFile(apps);
  return entry;
}

export function removeApp(id: string): boolean {
  const apps = readFile();
  const next = apps.filter((a) => a.id !== id);
  if (next.length === apps.length) return false;
  writeFile(next);
  return true;
}
