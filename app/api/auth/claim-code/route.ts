import { NextRequest, NextResponse } from "next/server";
import { claimInviteCode, createInviteCodeUser } from "@/lib/invite-code";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const { code, userId, email } = body;

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const success = await claimInviteCode(code);
  if (!success) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  if (userId) {
    await createInviteCodeUser(code, userId, email);
  }

  return NextResponse.json({ ok: true });
}
