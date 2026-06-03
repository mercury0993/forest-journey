import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { reports } = body as {
      reports: Array<{
        id: string;
        createdAt: string;
        roleTitle: string;
        fullReport: Record<string, unknown>;
        dimensions: Record<string, number>;
        isPaid: boolean;
      }>;
    };

    const synced: string[] = [];

    for (const report of reports) {
      const assessment = await prisma.assessment.create({
        data: {
          userId: user.id,
          status: "completed",
          startedAt: new Date(report.createdAt),
          finishedAt: new Date(report.createdAt),
        },
      });

      await prisma.report.create({
        data: {
          assessmentId: assessment.id,
          userId: user.id,
          roleTitle: report.roleTitle,
          fullReport: report.fullReport as Record<string, unknown>,
          dimensions: report.dimensions as Record<string, unknown>,
          isPaid: report.isPaid,
          createdAt: new Date(report.createdAt),
        },
      });

      synced.push(report.id);
    }

    return NextResponse.json({ synced });
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        assessment: true,
      },
    });

    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
