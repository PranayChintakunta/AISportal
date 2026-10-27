import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Liveness probe for uptime monitors. Must not touch the database so that
// frequent pings don't keep the Neon compute awake.
export async function GET() {
  return NextResponse.json({ ok: true });
}
