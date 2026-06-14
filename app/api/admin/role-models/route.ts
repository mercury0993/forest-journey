import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const models = await prisma.roleModel.findMany({ where: { createdBy: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ models });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const { name, empathy, rule, resilience, role } = body;
  if (!name || [empathy, rule, resilience, role].some((v: number) => v < 0 || v > 100)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const model = await prisma.roleModel.create({
    data: { name, empathy, rule, resilience, role, createdBy: user.id },
  });
  return NextResponse.json({ model });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.roleModel.deleteMany({ where: { id, createdBy: user.id } });
  return NextResponse.json({ ok: true });
}
