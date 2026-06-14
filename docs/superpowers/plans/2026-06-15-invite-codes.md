# Invite Codes Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add invite code generation, tracking, and user grouping for the admin backend

**Architecture:** New `invite_codes` table in Prisma. Admin API generates/batches codes. Public claim-code API used after signup. Admin pages show code tables and per-code user details. AuthModal gets optional invite code field.

**Tech Stack:** Next.js 16, Prisma v7, Supabase Auth, Tailwind CSS

---

### Task 1: Add InviteCode model to Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add InviteCode model**

Append to schema.prisma:

```prisma
model InviteCode {
  id        String   @id @default(cuid())
  code      String   @unique
  label     String?
  maxUses   Int      @default(1)
  usedCount Int      @default(0)  @map("used_count")
  isActive  Boolean  @default(true) @map("is_active")
  createdBy String   @map("created_by") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  @@map("invite_codes")
}
```

- [ ] **Step 2: Run Prisma migration**

```bash
npx prisma migrate dev --name add_invite_codes
```
Expected: migration created successfully

- [ ] **Step 3: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add InviteCode model to Prisma schema

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Create invite code utility

**Files:**
- Create: `lib/invite-code.ts`

- [ ] **Step 1: Write utility functions**

```typescript
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

export async function claimInviteCode(code: string, userId: string): Promise<boolean> {
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
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add lib/invite-code.ts
git commit -m "feat: add invite code utility functions

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Create admin invite codes API

**Files:**
- Create: `app/api/admin/invite-codes/route.ts`

- [ ] **Step 1: Write API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createInviteCodes, getAdminCodes } from "@/lib/invite-code";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const codes = await getAdminCodes(user.id);
  return NextResponse.json({ codes });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
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
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/invite-codes/route.ts
git commit -m "feat: add admin invite codes API (GET/POST)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Create claim-code API

**Files:**
- Create: `app/api/auth/claim-code/route.ts`

- [ ] **Step 1: Write API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { claimInviteCode } from "@/lib/invite-code";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code, userId } = body;

  if (!code || !userId) {
    return NextResponse.json({ error: "Missing code or userId" }, { status: 400 });
  }

  const success = await claimInviteCode(code, userId);
  if (!success) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/claim-code/route.ts
git commit -m "feat: add claim-code API for post-signup code redemption

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Create invite codes admin page

**Files:**
- Modify: `app/admin/invite-codes/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface InviteCode {
  id: string;
  code: string;
  label: string | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function InviteCodesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  const fetchCodes = useCallback(async () => {
    const res = await fetch("/api/admin/invite-codes");
    if (res.ok) {
      const data = await res.json();
      setCodes(data.codes);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch("/api/admin/invite-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, count }),
    });
    if (res.ok) {
      setLabel("");
      fetchCodes();
    }
    setGenerating(false);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-green-100">测评码管理</h1>

      {/* Generate form */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h2 className="text-sm font-medium text-white/60 mb-4">批量生成</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs text-white/30 mb-1">批次标签</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="如：2026 校招-产品岗"
              className="w-48 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm placeholder-white/15 focus:outline-none focus:border-green-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">数量</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={100}
              className="w-20 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-green-500/50"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {generating ? "生成中..." : "生成"}
          </button>
        </div>
      </div>

      {/* Code list */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-white/40 text-xs">
              <th className="text-left px-5 py-3 font-medium">邀请码</th>
              <th className="text-left px-5 py-3 font-medium">标签</th>
              <th className="text-left px-5 py-3 font-medium">使用</th>
              <th className="text-left px-5 py-3 font-medium">状态</th>
              <th className="text-left px-5 py-3 font-medium">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-white/20">暂无测评码</td>
              </tr>
            )}
            {codes.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <Link href={`/admin/invite-codes/${c.id}`} className="text-green-300 hover:text-green-200 font-mono text-xs">
                    {c.code}
                  </Link>
                </td>
                <td className="px-5 py-3 text-white/50">{c.label || "-"}</td>
                <td className="px-5 py-3 text-white/50">{c.usedCount}/{c.maxUses}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs ${c.isActive ? "text-green-400" : "text-red-400"}`}>
                    {c.isActive ? "启用" : "停用"}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/30 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/admin/invite-codes/page.tsx
git commit -m "feat: add invite codes admin page with generate and list

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Create code detail page

**Files:**
- Create: `app/admin/invite-codes/[id]/page.tsx`

- [ ] **Step 1: Write detail page**

```tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface CodeDetail {
  id: string;
  code: string;
  label: string | null;
  isActive: boolean;
  usedCount: number;
  maxUses: number;
  createdAt: string;
}

export default function InviteCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [code, setCode] = useState<CodeDetail | null>(null);

  useEffect(() => {
    fetch(`/api/admin/invite-codes?id=${id}`)
      .then((r) => r.json())
      .then((d) => setCode(d.code))
      .catch(() => router.push("/admin/invite-codes"));
  }, [id, router]);

  if (!code) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-white/30 hover:text-white/50 text-sm transition-colors">
        ← 返回列表
      </button>

      <div>
        <h1 className="text-lg font-bold text-green-100 font-mono">{code.code}</h1>
        <p className="text-white/40 text-sm mt-1">{code.label || "无标签"}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-xs mb-1">使用次数</p>
          <p className="text-white text-lg">{code.usedCount}/{code.maxUses}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-xs mb-1">状态</p>
          <p className={`text-lg ${code.isActive ? "text-green-400" : "text-red-400"}`}>
            {code.isActive ? "启用" : "停用"}
          </p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-xs mb-1">创建时间</p>
          <p className="text-white text-sm">{new Date(code.createdAt).toLocaleDateString("zh-CN")}</p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center text-white/30 text-sm">
        使用者详情 — 后续子系统完善
      </div>
    </div>
  );
}
```

Also update the GET API to support `?id=` query param:
Add to `app/api/admin/invite-codes/route.ts` GET handler, before existing response:

```typescript
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const code = await getCodeById(id);
    if (!code) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ code });
  }
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/admin/invite-codes/[id]/page.tsx app/api/admin/invite-codes/route.ts
git commit -m "feat: add invite code detail page and query-by-id API

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: Add invite code field to AuthModal

**Files:**
- Modify: `components/auth/AuthModal.tsx`

- [ ] **Step 1: Add inviteCode state**

Add after `password` state declaration:
```typescript
  const [inviteCode, setInviteCode] = useState("");
```

- [ ] **Step 2: Add claim-code logic in handleSubmit**

In the signup branch, after `closeAuthModal()`, before `setEmail("")`, add:
```typescript
      if (inviteCode.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          fetch("/api/auth/claim-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: inviteCode.trim(), userId: user.id }),
          }).catch(() => {});
        }
      }
```

- [ ] **Step 3: Add invite code input in signup form**

After the password input field, add (only when `authModalMode === "signup"`):
```tsx
            {authModalMode === "signup" && (
              <input
                type="text"
                placeholder="邀请码（选填）"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            )}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add components/auth/AuthModal.tsx
git commit -m "feat: add optional invite code field to signup form

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: Verification + project status

- [ ] **Step 1: Run tests**

```bash
npx vitest run
```
Expected: 17/17 pass

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Build check**

```bash
npm run build
```
Expected: build success

- [ ] **Step 4: Update PROJECT_STATUS.md + push**

Add Phase 20 entry. Amend next steps to show subsystem 2 as done.

```bash
git add PROJECT_STATUS.md
git commit -m "docs: log invite codes subsystem 2 in project status

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```
