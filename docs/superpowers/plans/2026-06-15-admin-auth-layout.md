# Admin Auth + Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin identification, login entry, and backend layout framework for the B-end management console

**Architecture:** `lib/admin.ts` reads `user_metadata.is_admin` from Supabase User object. `UserContext` exposes `isAdmin` to the app. `(admin)` route group has a layout that guards access and renders sidebar + topbar + content area. BottomNav shows admin entry link for admin users.

**Tech Stack:** Next.js 16 App Router, Supabase Auth metadata, Tailwind CSS, Framer Motion

---

### Task 1: Create isAdmin utility

**Files:**
- Create: `lib/admin.ts`

- [ ] **Step 1: Write isAdmin function**

```typescript
import { User } from "@supabase/supabase-js";

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.user_metadata?.is_admin === true;
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add lib/admin.ts
git commit -m "feat: add isAdmin utility using Supabase user_metadata

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Expose isAdmin in UserContext

**Files:**
- Modify: `context/UserContext.tsx`

- [ ] **Step 1: Add import and interface field**

Add import after line 4:
```typescript
import { isAdmin } from "@/lib/admin";
```

Add `isAdmin` to `UserContextType` interface (after `user`):
```typescript
  isAdmin: boolean;
```

Add default value (after `user: null`):
```typescript
  isAdmin: false,
```

- [ ] **Step 2: Compute isAdmin in provider value**

In the provider's `value` prop, add after `user`:
```typescript
        isAdmin: isAdmin(user),
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add context/UserContext.tsx
git commit -m "feat: expose isAdmin in UserContext

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Create admin layout with sidebar + auth guard

**Files:**
- Create: `app/(admin)/layout.tsx`

- [ ] **Step 1: Write admin layout**

```tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import Link from "next/link";

const sidebarItems = [
  { href: "/admin", label: "数据仪表盘", icon: "📊" },
  { href: "/admin/invite-codes", label: "测评码管理", icon: "🎫" },
  { href: "/admin/team-dashboard", label: "团队看板", icon: "👥" },
  { href: "/admin/role-models", label: "岗位模型", icon: "🎯" },
  { href: "/admin/export", label: "报告导出", icon: "📤" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, signOut } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [user, isAdmin, loading, router]);

  if (loading) return null;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0a1210] text-white flex">
      {/* Sidebar */}
      <aside className="w-[200px] min-h-screen bg-[#061208] border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <h1 className="text-sm font-bold text-green-300 tracking-wide">森林之旅 · 管理</h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-green-900/30 text-green-300 border border-green-800/30"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-white/50 text-xs transition-colors"
          >
            ← 返回首页
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/30 hover:text-red-400 text-xs transition-colors"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-6">
          <h2 className="text-sm text-white/60 font-medium">
            {sidebarItems.find((i) => i.href === pathname)?.label || "后台管理"}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30">{user.email}</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/\(admin\)/layout.tsx
git commit -m "feat: add admin layout with sidebar and auth guard

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Create admin dashboard + placeholder pages

**Files:**
- Create: `app/(admin)/page.tsx`
- Create: `app/(admin)/invite-codes/page.tsx`
- Create: `app/(admin)/team-dashboard/page.tsx`
- Create: `app/(admin)/role-models/page.tsx`
- Create: `app/(admin)/export/page.tsx`

- [ ] **Step 1: Write dashboard page**

```tsx
export default function AdminDashboard() {
  return (
    <div className="flex items-center justify-center h-64 text-white/30 text-sm">
      数据仪表盘 — 即将上线
    </div>
  );
}
```

- [ ] **Step 2: Write placeholder pages (all identical structure)**

`invite-codes/page.tsx`:
```tsx
export default function InviteCodesPage() {
  return (
    <div className="flex items-center justify-center h-64 text-white/30 text-sm">
      测评码管理 — 即将上线
    </div>
  );
}
```

`team-dashboard/page.tsx`:
```tsx
export default function TeamDashboardPage() {
  return (
    <div className="flex items-center justify-center h-64 text-white/30 text-sm">
      团队看板 — 即将上线
    </div>
  );
}
```

`role-models/page.tsx`:
```tsx
export default function RoleModelsPage() {
  return (
    <div className="flex items-center justify-center h-64 text-white/30 text-sm">
      岗位模型 — 即将上线
    </div>
  );
}
```

`export/page.tsx`:
```tsx
export default function ExportPage() {
  return (
    <div className="flex items-center justify-center h-64 text-white/30 text-sm">
      报告导出 — 即将上线
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add app/\(admin\)/page.tsx app/\(admin\)/invite-codes/ app/\(admin\)/team-dashboard/ app/\(admin\)/role-models/ app/\(admin\)/export/
git commit -m "feat: add admin dashboard and placeholder pages

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Add admin entry to BottomNav

**Files:**
- Modify: `components/layout/BottomNav.tsx`

- [ ] **Step 1: Add useUser import and admin nav item**

After line 3, add import:
```typescript
import { useUser } from "@/context/UserContext";
```

Inside the component, after `const pathname = usePathname();`:
```typescript
  const { isAdmin } = useUser();
```

Add admin item at the beginning of `navItems` array (conditionally via JSX below).

In the JSX, before the `navItems.map`, add an admin entry:
```tsx
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 transition-colors ${pathname.startsWith("/admin") ? "text-amber-400" : "text-white/50 hover:text-white/70"}`}
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px]">管理</span>
          </Link>
        )}
```

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add components/layout/BottomNav.tsx
git commit -m "feat: add admin entry link to bottom navigation

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Verification

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

- [ ] **Step 3: Manual verification**

Run dev server `npm run dev`:
- [ ] Visit `/admin` as non-admin user → redirect to `/`
- [ ] After marking admin in Supabase, visit `/admin` → admin layout with sidebar
- [ ] Click sidebar items → page switches, highlight follows
- [ ] BottomNav shows ⚙️"管理" entry (admin only)

---

### Task 7: Update project status

- [ ] **Step 1: Update PROJECT_STATUS.md**

Add Phase 19 entry with admin auth + layout

- [ ] **Step 2: Push to GitHub**

```bash
git push origin main
```
