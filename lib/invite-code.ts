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
