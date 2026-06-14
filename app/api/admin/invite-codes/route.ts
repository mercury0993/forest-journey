import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { createInviteCodes, getAdminCodes, getCodeById, getCodeUsers } from "@/lib/invite-code";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const code = await getCodeById(id, user.id);
    if (!code) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (searchParams.get("users") === "true") {
      const users = await getCodeUsers(id);
      return NextResponse.json({ code, users });
    }
    return NextResponse.json({ code });
  }

  const codes = await getAdminCodes(user.id);
  return NextResponse.json({ codes });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { label, count } = body;

  if (!count || count < 1 || count > 100) {
    return NextResponse.json({ error: "count must be 1-100" }, { status: 400 });
  }

  const codes = await createInviteCodes(label || "", count, user.id);
  return NextResponse.json({ codes });
}
