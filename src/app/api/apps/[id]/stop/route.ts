import { NextResponse } from "next/server";
import { getApp } from "@/lib/apps";
import { stopApp } from "@/lib/launcher";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getApp(id);
  if (!app) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const result = await stopApp(app);

  if (result.status === "not-managed") {
    return NextResponse.json(
      {
        status: "not-managed",
        message: `"${app.name}" is running but The Lodge didn't start it, so it can't stop it for you.`,
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ status: result.status });
}
