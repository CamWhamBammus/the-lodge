import { NextResponse } from "next/server";
import { getApp } from "@/lib/apps";
import { startApp } from "@/lib/launcher";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getApp(id);
  if (!app) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const result = await startApp(app);

  if (result.status === "timeout") {
    return NextResponse.json(
      {
        status: "timeout",
        url: result.url,
        message: `"${app.name}" didn't respond on port ${app.port} within 25s. Check the log for errors.`,
        logPath: result.logPath,
      },
      { status: 504 }
    );
  }

  return NextResponse.json({ status: result.status, url: result.url });
}
