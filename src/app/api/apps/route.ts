import { NextResponse } from "next/server";
import { listApps, addApp } from "@/lib/apps";
import { getStatus, appUrl } from "@/lib/launcher";
import type { AppWithStatus } from "@/types";

export async function GET() {
  const apps = listApps();
  const withStatus: AppWithStatus[] = await Promise.all(
    apps.map(async (app) => ({
      ...app,
      status: await getStatus(app),
      url: appUrl(app),
    }))
  );
  return NextResponse.json({ apps: withStatus });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, tagline, path: appPath, command, port } = body ?? {};

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!appPath || typeof appPath !== "string") {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }
  if (!command || typeof command !== "string") {
    return NextResponse.json({ error: "command is required" }, { status: 400 });
  }
  const portNum = Number(port);
  if (!Number.isInteger(portNum) || portNum <= 0 || portNum > 65535) {
    return NextResponse.json({ error: "port must be a valid port number" }, { status: 400 });
  }

  const entry = addApp({
    name,
    tagline: typeof tagline === "string" ? tagline : "",
    path: appPath,
    command,
    port: portNum,
  });
  return NextResponse.json({ app: entry }, { status: 201 });
}
