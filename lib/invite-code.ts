import { prisma } from "@/lib/prisma";

export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FJ-${suffix}`;
}

export async function createInviteCodes(label: string, count: number, createdBy: string) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.inviteCode.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }
    codes.push({
      code,
      label: label || null,
      createdBy,
    });
  }
  await prisma.inviteCode.createMany({ data: codes });
  return codes;
}

export async function claimInviteCode(code: string): Promise<boolean> {
  const record = await prisma.inviteCode.findUnique({ where: { code } });
  if (!record || !record.isActive) return false;
  if (record.usedCount >= record.maxUses) return false;

  await prisma.inviteCode.update({
    where: { id: record.id },
    data: { usedCount: record.usedCount + 1 },
  });

  return true;
}

export async function getAdminCodes(createdBy: string) {
  return prisma.inviteCode.findMany({
    where: { createdBy },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCodeById(id: string) {
  return prisma.inviteCode.findUnique({ where: { id } });
}

export async function getCodeUsers(inviteCodeId: string) {
  const mappings = await prisma.inviteCodeUser.findMany({
    where: { inviteCodeId },
  });
  const userIds = mappings.map((m) => m.userId);
  const reports = await prisma.report.findMany({
    where: { userId: { in: userIds } },
    orderBy: { createdAt: "desc" },
  });
  return mappings.map((m) => {
    const report = reports.find((r) => r.userId === m.userId);
    return {
      email: m.email,
      userId: m.userId,
      createdAt: m.createdAt,
      report: report ? {
        roleTitle: report.roleTitle,
        dimensions: report.dimensions,
        reportCreatedAt: report.createdAt,
      } : null,
    };
  });
}

export async function createInviteCodeUser(code: string, userId: string, email?: string): Promise<boolean> {
  const record = await prisma.inviteCode.findUnique({ where: { code } });
  if (!record || !record.isActive) return false;

  await prisma.inviteCodeUser.create({
    data: {
      inviteCodeId: record.id,
      userId,
      email: email || null,
    },
  });
  return true;
}

export async function getTeamMembers(adminUserId: string) {
  const codes = await prisma.inviteCode.findMany({
    where: { createdBy: adminUserId },
    select: { id: true, code: true, label: true },
  });

  const codeIds = codes.map((c) => c.id);

  const mappings = await prisma.inviteCodeUser.findMany({
    where: { inviteCodeId: { in: codeIds } },
  });

  const userIds = [...new Set(mappings.map((m) => m.userId))];

  const reports = await prisma.report.findMany({
    where: { userId: { in: userIds } },
    orderBy: { createdAt: "desc" },
  });

  const userCodeMap = new Map<string, { code: string; label: string | null; email: string | null }>();
  for (const m of mappings) {
    const c = codes.find((c) => c.id === m.inviteCodeId);
    if (c) userCodeMap.set(m.userId, { code: c.code, label: c.label, email: m.email });
  }

  const byCode = new Map<string, { code: string; label: string | null; reports: typeof reports }>();
  for (const m of mappings) {
    const c = codes.find((c) => c.id === m.inviteCodeId);
    if (!c) continue;
    if (!byCode.has(c.id)) byCode.set(c.id, { code: c.code, label: c.label, reports: [] });
  }
  for (const r of reports) {
    const codeInfo = userCodeMap.get(r.userId!);
    if (!codeInfo) continue;
    const code = codes.find((c) => c.code === codeInfo.code);
    if (code) byCode.get(code.id)?.reports.push(r);
  }

  return {
    totalMembers: userIds.length,
    totalReports: reports.length,
    reports: reports.map((r) => ({
      ...r,
      inviteCode: userCodeMap.get(r.userId!)?.code || null,
      batchLabel: userCodeMap.get(r.userId!)?.label || null,
      email: userCodeMap.get(r.userId!)?.email || null,
    })),
    byCode: Array.from(byCode.values()),
  };
}
