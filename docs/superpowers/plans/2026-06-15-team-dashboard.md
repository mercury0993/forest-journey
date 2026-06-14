# Team Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add team dashboard with overview stats, member list, and batch grouping for admin users

**Architecture:** New `invite_code_users` junction table links invite codes to Supabase users. Team API aggregates reports data across all team members. Dashboard page renders 3 tabs with charts, tables, and cards.

**Tech Stack:** Next.js 16, Prisma v7, Supabase Auth, Tailwind CSS, Framer Motion

---

### Task 1: Add InviteCodeUser model + update claim-code

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `app/api/auth/claim-code/route.ts`
- Modify: `lib/invite-code.ts`

- [ ] **Step 1: Add InviteCodeUser to Prisma schema**

Append to schema.prisma:

```prisma
model InviteCodeUser {
  id           String   @id @default(cuid())
  inviteCodeId String   @map("invite_code_id")
  userId       String   @map("user_id") @db.Uuid
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("invite_code_users")
}
```

- [ ] **Step 2: Write SQL migration**

`prisma/migrations/20260614161500_add_invite_code_users/migration.sql`:

```sql
CREATE TABLE "invite_code_users" (
    "id" TEXT NOT NULL,
    "invite_code_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invite_code_users_pkey" PRIMARY KEY ("id")
);
```

- [ ] **Step 3: Add createInviteCodeUser to lib/invite-code.ts**

```typescript
export async function createInviteCodeUser(code: string, userId: string): Promise<boolean> {
  const record = await prisma.inviteCode.findUnique({ where: { code } });
  if (!record || !record.isActive) return false;

  await prisma.inviteCodeUser.create({
    data: {
      inviteCodeId: record.id,
      userId,
    },
  });
  return true;
}

export async function getTeamMembers(adminUserId: string) {
  // Get all invite codes created by this admin
  const codes = await prisma.inviteCode.findMany({
    where: { createdBy: adminUserId },
    select: { id: true, code: true, label: true },
  });

  const codeIds = codes.map((c) => c.id);

  // Get all user-code mappings
  const mappings = await prisma.inviteCodeUser.findMany({
    where: { inviteCodeId: { in: codeIds } },
  });

  const userIds = [...new Set(mappings.map((m) => m.userId))];

  // Get reports for these users
  const reports = await prisma.report.findMany({
    where: { userId: { in: userIds } },
    orderBy: { createdAt: "desc" },
  });

  // Build user → code mapping
  const userCodeMap = new Map<string, { code: string; label: string | null }>();
  for (const m of mappings) {
    const c = codes.find((c) => c.id === m.inviteCodeId);
    if (c) userCodeMap.set(m.userId, { code: c.code, label: c.label });
  }

  // Group by code
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
    })),
    byCode: Array.from(byCode.values()),
  };
}
```

- [ ] **Step 4: Update claim-code API**

In `app/api/auth/claim-code/route.ts`, replace the POST handler:

```typescript
import { claimInviteCode, createInviteCodeUser } from "@/lib/invite-code";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, userId } = body;

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const claimed = await claimInviteCode(code);
  if (!claimed) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  if (userId) {
    await createInviteCodeUser(code, userId);
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Generate Prisma client + TypeScript check**

```bash
set -a && source .env.local && npx prisma generate && npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ lib/invite-code.ts app/api/auth/claim-code/route.ts
git commit -m "feat: add InviteCodeUser model and Team API queries

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Create team data API

**Files:**
- Create: `app/api/admin/team/route.ts`

- [ ] **Step 1: Write API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getTeamMembers } from "@/lib/invite-code";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await getTeamMembers(user.id);
  return NextResponse.json(data);
}
```

- [ ] **Step 2: TypeScript check**

```bash
set -a && source .env.local && npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/team/route.ts
git commit -m "feat: add team data aggregation API

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Rewrite team dashboard page

**Files:**
- Modify: `app/admin/team-dashboard/page.tsx`

- [ ] **Step 1: Write team dashboard page**

```tsx
"use client";

import { useState, useEffect, useMemo } from "react";

interface TeamReport {
  id: string;
  roleTitle: string;
  dimensions: { empathy: number; rule: number; resilience: number; role: number };
  createdAt: string;
  inviteCode: string | null;
  batchLabel: string | null;
  userId?: string;
}

interface ByCode {
  code: string;
  label: string | null;
  reports: TeamReport[];
}

interface TeamData {
  totalMembers: number;
  totalReports: number;
  reports: TeamReport[];
  byCode: ByCode[];
}

type Tab = "overview" | "members" | "batches";

function RadarChart({ dimensions }: { dimensions: { empathy: number; rule: number; resilience: number; role: number } }) {
  const dims = [
    { key: "empathy", label: "共情" },
    { key: "rule", label: "规则" },
    { key: "resilience", label: "韧性" },
    { key: "role", label: "角色" },
  ] as const;

  const cx = 80;
  const cy = 80;
  const r = 60;
  const centerAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / dims.length;

  const points = dims.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    const value = dimensions[dims[i].key] / 100;
    return { x: cx + r * value * Math.cos(angle), y: cy + r * value * Math.sin(angle) };
  });

  const axisPoints = dims.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[160px] mx-auto">
      {[0.25, 0.5, 0.75, 1].map((level) => {
        const pts = dims.map((_, i) => {
          const a = centerAngle + i * angleStep;
          return `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={level} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      <path d={pathData} fill="rgba(74, 138, 74, 0.25)" stroke="rgba(132, 200, 132, 0.6)" strokeWidth="1.5" />
      {axisPoints.map((p, i) => (
        <text key={i} x={cx + (r + 15) * Math.cos(centerAngle + i * angleStep)} y={cy + (r + 15) * Math.sin(centerAngle + i * angleStep)} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.4)" fontSize="8">
          {dims[i].label}
        </text>
      ))}
    </svg>
  );
}

export default function TeamDashboardPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [prototypeFilter, setPrototypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const prototypeCounts = useMemo(() => {
    if (!data) return {};
    const counts: Record<string, number> = {};
    for (const r of data.reports) {
      counts[r.roleTitle] = (counts[r.roleTitle] || 0) + 1;
    }
    return counts;
  }, [data]);

  const avgDimensions = useMemo(() => {
    if (!data || data.reports.length === 0) return { empathy: 0, rule: 0, resilience: 0, role: 0 };
    const sum = { empathy: 0, rule: 0, resilience: 0, role: 0 };
    for (const r of data.reports) {
      sum.empathy += r.dimensions.empathy;
      sum.rule += r.dimensions.rule;
      sum.resilience += r.dimensions.resilience;
      sum.role += r.dimensions.role;
    }
    const n = data.reports.length;
    return { empathy: Math.round(sum.empathy / n), rule: Math.round(sum.rule / n), resilience: Math.round(sum.resilience / n), role: Math.round(sum.role / n) };
  }, [data]);

  const prototypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.reports.map((r) => r.roleTitle))];
  }, [data]);

  const filteredReports = useMemo(() => {
    if (!data) return [];
    let list = [...data.reports];
    if (prototypeFilter !== "all") {
      list = list.filter((r) => r.roleTitle === prototypeFilter);
    }
    list.sort((a, b) => {
      const aVal = sortKey === "createdAt" ? a.createdAt : a.dimensions[sortKey as keyof typeof a.dimensions] ?? 0;
      const bVal = sortKey === "createdAt" ? b.createdAt : b.dimensions[sortKey as keyof typeof b.dimensions] ?? 0;
      return sortDir === "desc" ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });
    return list;
  }, [data, prototypeFilter, sortKey, sortDir]);

  if (!data) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "概览" },
    { key: "members", label: "成员列表" },
    { key: "batches", label: "批次分组" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-green-100">团队看板</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              tab === t.key ? "bg-green-900/40 text-green-300" : "text-white/40 hover:text-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-white/30 text-xs">成员总数</p>
              <p className="text-2xl font-bold text-white mt-1">{data.totalReports}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-white/30 text-xs">邀请码批次</p>
              <p className="text-2xl font-bold text-white mt-1">{data.byCode.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-medium text-white/60 mb-4">原型分布</h3>
              {Object.entries(prototypeCounts).length === 0 ? (
                <p className="text-white/20 text-sm text-center py-8">暂无数据</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(prototypeCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([role, count]) => (
                      <div key={role} className="flex items-center gap-2">
                        <span className="text-white/50 text-xs w-24 truncate">{role}</span>
                        <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-700/50 rounded-full transition-all"
                            style={{ width: `${(count / data.reports.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-white/30 text-xs w-6 text-right">{count}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-medium text-white/60 mb-4">四维平均分</h3>
              {data.reports.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-8">暂无数据</p>
              ) : (
                <RadarChart dimensions={avgDimensions} />
              )}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/60 mb-4">最近测评</h3>
            {data.reports.slice(0, 5).length === 0 ? (
              <p className="text-white/20 text-sm text-center py-8">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {data.reports.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] text-sm">
                    <span className="text-white/50">{r.roleTitle}</span>
                    <span className="text-white/20 text-xs">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {tab === "members" && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <select
              value={prototypeFilter}
              onChange={(e) => setPrototypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/60 text-xs focus:outline-none focus:border-green-500/50"
            >
              <option value="all">全部原型</option>
              {prototypes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="text-white/20 text-xs">{filteredReports.length} 条记录</span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/40 text-xs">
                  {[
                    { key: "roleTitle", label: "原型" },
                    { key: "empathy", label: "共情" },
                    { key: "rule", label: "规则" },
                    { key: "resilience", label: "韧性" },
                    { key: "role", label: "角色" },
                    { key: "createdAt", label: "测评时间" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="text-left px-4 py-3 font-medium cursor-pointer hover:text-white/60"
                      onClick={() => {
                        if (sortKey === col.key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                        else { setSortKey(col.key); setSortDir("desc"); }
                      }}
                    >
                      {col.label} {sortKey === col.key ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 font-medium">批次</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-white/20">暂无数据</td></tr>
                )}
                {filteredReports.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/70">{r.roleTitle}</td>
                    <td className="px-4 py-3 text-white/50">{r.dimensions.empathy}</td>
                    <td className="px-4 py-3 text-white/50">{r.dimensions.rule}</td>
                    <td className="px-4 py-3 text-white/50">{r.dimensions.resilience}</td>
                    <td className="px-4 py-3 text-white/50">{r.dimensions.role}</td>
                    <td className="px-4 py-3 text-white/30 text-xs">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</td>
                    <td className="px-4 py-3 text-white/30 text-xs">{r.batchLabel || r.inviteCode || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batches Tab */}
      {tab === "batches" && (
        <div className="grid grid-cols-2 gap-4">
          {data.byCode.length === 0 && (
            <p className="text-white/20 text-sm col-span-2 text-center py-12">暂无批次数据</p>
          )}
          {data.byCode.map((bc) => (
            <div key={bc.code} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-green-300 font-mono text-sm">{bc.code}</h3>
              <p className="text-white/40 text-xs mt-1">{bc.label || "无标签"}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-white/30 text-xs">{bc.reports.length} 人</span>
              </div>
              {bc.reports.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {[...new Set(bc.reports.map((r) => r.roleTitle))].map((role) => (
                    <span key={role} className="px-2 py-0.5 rounded-full bg-green-900/20 text-green-300/70 text-xs">
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
set -a && source .env.local && npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/admin/team-dashboard/page.tsx
git commit -m "feat: add team dashboard with overview, members, and batches tabs

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Verification + project status

- [ ] **Step 1: Run tests**

```bash
npx vitest run
```
Expected: 17/17 pass

- [ ] **Step 2: Build check**

```bash
set -a && source .env.local && npm run build
```
Expected: build success

- [ ] **Step 3: Update PROJECT_STATUS.md + push**

Add Phase 21 entry. Update next steps.

```bash
git add PROJECT_STATUS.md
git commit -m "docs: log team dashboard subsystem 3 in project status"
git push origin main
```
