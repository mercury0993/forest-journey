import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 65536) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const body = await request.json();
    const { reports } = body;

    if (!Array.isArray(reports) || reports.length === 0 || reports.length > 10) {
      return NextResponse.json({ error: "Invalid reports array" }, { status: 400 });
    }

    for (const report of reports) {
      if (
        typeof report.id !== "string" || report.id.length > 50 ||
        typeof report.createdAt !== "string" || report.createdAt.length > 30 ||
        typeof report.roleTitle !== "string" || report.roleTitle.length > 100
      ) {
        return NextResponse.json({ error: "Invalid report fields" }, { status: 400 });
      }
    }

    const typedReports = reports as Array<{
      id: string;
      createdAt: string;
      roleTitle: string;
      fullReport: Record<string, unknown>;
      dimensions: Record<string, number>;
      isPaid: boolean;
    }>;

    const synced: string[] = [];

    for (const report of typedReports) {
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
          fullReport: report.fullReport as Prisma.InputJsonValue,
          dimensions: report.dimensions as Prisma.InputJsonValue,
          isPaid: true,
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
