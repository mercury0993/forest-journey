import { NextRequest, NextResponse } from "next/server";
import { claimInviteCode, createInviteCodeUser } from "@/lib/invite-code";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, userId } = body;

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const success = await claimInviteCode(code);
  if (!success) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  if (userId) {
    await createInviteCodeUser(code, userId);
  }

  return NextResponse.json({ ok: true });
}
