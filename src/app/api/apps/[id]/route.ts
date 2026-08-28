import { NextResponse } from "next/server";
import { getApp, removeApp } from "@/lib/apps";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getApp(id);
  if (!app) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  removeApp(id);
  return NextResponse.json({ ok: true });
}
