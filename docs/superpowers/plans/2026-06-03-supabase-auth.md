# Supabase Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Supabase Auth for email/password login and migrate report persistence from localStorage to Supabase PostgreSQL.

**Architecture:** Supabase for auth + database, Prisma for business-table ORM. Users stay optional (no-login assessment works). On signup after assessment, localStorage reports sync to cloud. Auth state via React Context, session refresh via Next.js middleware.

**Tech Stack:** @supabase/supabase-js, @supabase/ssr, Prisma (existing), Next.js 16 App Router

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install supabase packages**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

Expected: packages added to `package.json` and `node_modules`

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @supabase/supabase-js and @supabase/ssr"
```

---

### Task 2: Update Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Remove User model and relations**

Read `prisma/schema.prisma`, replace with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Assessment {
  id         String    @id @default(cuid())
  userId     String?   @map("user_id")
  status     String    @default("in_progress")
  startedAt  DateTime  @default(now()) @map("started_at")
  finishedAt DateTime? @map("finished_at")

  answers Answer[]
  reports Report[]

  @@map("assessments")
}

model Answer {
  id           String @id @default(cuid())
  assessmentId String @map("assessment_id")
  sceneCode    String @map("scene_code")
  answerType   String @map("answer_type")
  content      Json

  assessment Assessment @relation(fields: [assessmentId], references: [id])

  @@map("answers")
}

model Report {
  id           String  @id @default(cuid())
  assessmentId String  @map("assessment_id")
  userId       String? @map("user_id")
  roleTitle    String  @map("role_title")
  cardImageUrl String? @map("card_image_url")
  fullReport   Json    @map("full_report_content")
  dimensions   Json    @map("dimensions_score")
  isPaid       Boolean @default(false) @map("is_paid")
  createdAt    DateTime @default(now()) @map("created_at")

  assessment Assessment @relation(fields: [assessmentId], references: [id])

  @@map("reports")
}
```

Key changes: removed `User` model and `user` relations from `Assessment` and `Report`. `userId` stays as optional `String?`.

- [ ] **Step 2: Run Prisma migrate**

```bash
npx prisma migrate dev --name remove_user_model
```

Expected: migration applied successfully

- [ ] **Step 3: Verify Prisma generate**

```bash
npx prisma generate
```

Expected: Prisma client generated without errors

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "refactor: remove User model from Prisma schema, use Supabase auth.users"
```

---

### Task 3: Create Supabase clients

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`

- [ ] **Step 1: Create browser client**

Write `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create server client**

Write `lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase browser and server clients"
```

---

### Task 4: Create middleware for session refresh

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Write middleware**

Write `middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add Supabase auth middleware for session refresh"
```

---

### Task 5: Create UserContext

**Files:**
- Create: `context/UserContext.tsx`

- [ ] **Step 1: Write UserContext**

Write `context/UserContext.tsx`:

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthModalMode = "login" | "signup";

interface UserContextType {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  authModalOpen: false,
  authModalMode: "login",
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const openAuthModal = (mode: AuthModalMode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider
      value={{ user, loading, authModalOpen, authModalMode, openAuthModal, closeAuthModal, signOut }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
```

- [ ] **Step 2: Commit**

```bash
git add context/UserContext.tsx
git commit -m "feat: add UserContext for auth state management"
```

---

### Task 6: Create AuthModal component

**Files:**
- Create: `components/auth/AuthModal.tsx`

- [ ] **Step 1: Write AuthModal with login and signup forms**

Write `components/auth/AuthModal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/UserContext";

export default function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const supabase = createClient();

    if (authModalMode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        const msg = signUpError.message.includes("already registered")
          ? "该邮箱已注册，请直接登录"
          : signUpError.message;
        setError(msg);
        setSubmitting(false);
        return;
      }
      // signUp auto-logs in if email confirmation is off
      closeAuthModal();
      setEmail("");
      setPassword("");
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError("邮箱或密码错误");
        setSubmitting(false);
        return;
      }
      closeAuthModal();
      setEmail("");
      setPassword("");
    }

    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70" onClick={closeAuthModal} />

        <motion.div
          className="relative z-10 w-full max-w-sm bg-[#0d1f14] border border-green-800/40 rounded-2xl p-6 shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <h2 className="text-xl font-bold text-green-100 text-center mb-6">
            {authModalMode === "signup" ? "注册保存你的报告" : "登录查看历史报告"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="邮箱"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
            />
            <input
              type="password"
              placeholder="密码"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors"
            />

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-green-700 to-green-600 text-white font-medium disabled:opacity-50 transition-opacity"
            >
              {submitting ? "处理中..." : authModalMode === "signup" ? "注册并保存" : "登录"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-white/40">
            {authModalMode === "signup" ? (
              <p>
                已有账号？{" "}
                <button
                  onClick={() => openAuthModal("login")}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  去登录
                </button>
              </p>
            ) : (
              <p>
                还没有账号？{" "}
                <button
                  onClick={() => openAuthModal("signup")}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  注册
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth/AuthModal.tsx
git commit -m "feat: add AuthModal component with login and signup forms"
```

---

### Task 7: Wire UserProvider and AuthModal into layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Add UserProvider wrapper and AuthModal**

Read `app/layout.tsx`, replace with:

```tsx
import type { Metadata } from "next";
import { AudioProvider } from "@/context/AudioContext";
import { AssessmentProvider } from "@/context/AssessmentContext";
import { UserProvider } from "@/context/UserContext";
import ForestLayout from "@/components/layout/ForestLayout";
import BottomNav from "@/components/layout/BottomNav";
import AudioToggle from "@/components/shared/AudioToggle";
import AuthModal from "@/components/auth/AuthModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forest Journey — 森林之旅",
  description: "一次深入心灵的森林探索，发现你的服务者原型",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AudioProvider>
          <AssessmentProvider>
            <UserProvider>
              <ForestLayout>
                {children}
                <AudioToggle />
                <BottomNav />
              </ForestLayout>
              <AuthModal />
            </UserProvider>
          </AssessmentProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```

Expected: no errors. Visit `http://localhost:3000` — page loads normally.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wire UserProvider and AuthModal into root layout"
```

---

### Task 8: Add cloud sync API route

**Files:**
- Create: `app/api/reports/sync/route.ts`

- [ ] **Step 1: Write sync API route**

Write `app/api/reports/sync/route.ts`:

```typescript
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
```

- [ ] **Step 2: Add GET route for loading user reports**

Add to the same file, before or after POST:

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add app/api/reports/sync/
git commit -m "feat: add cloud sync API for reports"
```

---

### Task 9: Update result page with save-to-cloud flow

**Files:**
- Modify: `app/(public)/result/page.tsx`

- [ ] **Step 1: Add save-to-cloud logic after signup**

Read `app/(public)/result/page.tsx`. The key change: after the user signs up via AuthModal, we need to sync the current report to the cloud. Add a `useEffect` that watches for the user becoming available after signup and syncs the report.

Replace the file content with:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import WaitingAnimation from "@/components/result/WaitingAnimation";
import ServiceCard from "@/components/result/ServiceCard";
import FullReport from "@/components/result/FullReport";
import { calculateScores, matchTemplate } from "@/lib/mapping-engine";
import { nlpFallback } from "@/lib/nlp-fallback";
import { saveReport } from "@/lib/storage";
import { useUser } from "@/context/UserContext";
import { AssessmentAnswers, ReportData } from "@/lib/types";

type Stage = "waiting" | "card" | "report";

export default function ResultPage() {
  const router = useRouter();
  const { user, openAuthModal } = useUser();
  const [stage, setStage] = useState<Stage>("waiting");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncedToCloud, setSyncedToCloud] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("fj_latest_answers");
    if (!raw) {
      router.push("/");
      return;
    }

    try {
      const answers: AssessmentAnswers = JSON.parse(raw);

      const runNLP = async () => {
        let nlpResult;
        try {
          const res = await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              animal1Text: `${answers.scene1.animalName} ${answers.scene1.description} ${answers.scene1.followUp1}`,
              animal2Text: `${answers.scene4.animalName} ${answers.scene4.description}`,
              animal2Feeling: answers.scene4.firstFeeling,
            }),
          });
          if (res.ok) {
            nlpResult = await res.json();
          } else {
            throw new Error("API failed");
          }
        } catch {
          nlpResult = nlpFallback(
            `${answers.scene1.animalName} ${answers.scene1.description} ${answers.scene1.followUp1}`,
            `${answers.scene4.animalName} ${answers.scene4.description}`,
            answers.scene4.firstFeeling
          );
        }

        const scores = calculateScores(answers, nlpResult);
        const match = matchTemplate(scores);

        const report: ReportData = {
          id: Date.now().toString(36),
          createdAt: new Date().toISOString(),
          answers,
          scores,
          nlp: nlpResult,
          templateIndex: match.templateIndex,
          roleTitle: match.roleTitle,
          cardTitle: match.cardTitle,
          cardInterpretation: match.cardInterpretation,
          fullReport: match.fullReport,
          isPaid: false,
        };

        setReportData(report);
        localStorage.removeItem("fj_latest_answers");
      };

      runNLP();
    } catch {
      setError(true);
    }
  }, [router]);

  // When user becomes authenticated after signup, sync the report to cloud
  useEffect(() => {
    if (!user || !reportData || syncedToCloud || syncing) return;

    const syncToCloud = async () => {
      setSyncing(true);
      try {
        const res = await fetch("/api/reports/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reports: [{
              id: reportData.id,
              createdAt: reportData.createdAt,
              roleTitle: reportData.roleTitle,
              fullReport: reportData.fullReport,
              dimensions: reportData.scores,
              isPaid: reportData.isPaid,
            }],
          }),
        });
        if (res.ok) {
          setSyncedToCloud(true);
        }
      } catch {
        // Silently fail — report still in localStorage
      }
      setSyncing(false);
    };

    syncToCloud();
  }, [user, reportData, syncedToCloud, syncing]);

  const handleUnlock = () => {
    if (!reportData) return;
    const updated = { ...reportData, isPaid: true };
    setReportData(updated);
    saveReport(updated);
    setStage("report");
  };

  const handleSave = () => {
    if (reportData && !reportData.isPaid) {
      saveReport({ ...reportData, isPaid: true });
    }
  };

  const handleSaveToCloud = () => {
    openAuthModal("signup");
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">出了点问题，请返回重试</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center pb-20">
      {stage === "waiting" && (
        <WaitingAnimation onComplete={() => setStage("card")} />
      )}

      {stage === "card" && reportData && (
        <div className="text-center">
          <ServiceCard
            animalName={reportData.answers.scene1.animalName}
            roleTitle={reportData.roleTitle}
            cardTitle={reportData.cardTitle}
            cardInterpretation={reportData.cardInterpretation}
            onUnlock={handleUnlock}
          />
          {!user && !syncedToCloud && (
            <div className="mt-6">
              <button
                onClick={handleSaveToCloud}
                className="px-6 py-2.5 rounded-full border border-green-500/30 text-green-400/80 text-sm hover:bg-green-500/10 transition-colors"
              >
                {syncing ? "保存中..." : "注册以永久保存报告"}
              </button>
              {syncedToCloud && (
                <p className="text-green-400/60 text-xs mt-2">已保存到云端</p>
              )}
            </div>
          )}
        </div>
      )}

      {stage === "report" && reportData && (
        <FullReport
          report={reportData.fullReport}
          scores={reportData.scores}
          roleTitle={reportData.roleTitle}
          onSave={handleSave}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(public\)/result/page.tsx
git commit -m "feat: add save-to-cloud flow on result page after signup"
```

---

### Task 10: Update profile page with cloud data support

**Files:**
- Modify: `app/(public)/profile/page.tsx`
- Modify: `components/profile/HistoryList.tsx`

- [ ] **Step 1: Update HistoryList to accept cloud reports**

Read `components/profile/HistoryList.tsx`. Replace with a version that accepts an optional `cloudReports` prop and merges data:

```tsx
"use client";

import { useState, useEffect } from "react";
import { getReports } from "@/lib/storage";
import { ReportData } from "@/lib/types";
import { getAnimalIllustration } from "@/lib/animals";
import FullReport from "@/components/result/FullReport";
import { useUser } from "@/context/UserContext";

interface CloudReport {
  id: string;
  roleTitle: string;
  fullReport: Record<string, unknown>;
  dimensions: Record<string, number>;
  isPaid: boolean;
  createdAt: string;
}

interface Props {
  cloudReports: CloudReport[];
  cloudLoading: boolean;
}

export default function HistoryList({ cloudReports, cloudLoading }: Props) {
  const { user, openAuthModal } = useUser();
  const [localReports, setLocalReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedCloudReport, setSelectedCloudReport] = useState<CloudReport | null>(null);

  useEffect(() => {
    setLocalReports(getReports());
  }, []);

  const handleSave = () => {
    // already saved when unlocked
  };

  // Full report view for localStorage report
  if (selectedReport) {
    return (
      <div>
        <button
          onClick={() => setSelectedReport(null)}
          className="mb-6 text-green-400/60 hover:text-green-400 text-sm transition-colors"
        >
          ← 返回列表
        </button>
        <FullReport
          report={selectedReport.fullReport}
          scores={selectedReport.scores}
          roleTitle={selectedReport.roleTitle}
          onSave={handleSave}
        />
      </div>
    );
  }

  // Full report view for cloud report
  if (selectedCloudReport) {
    return (
      <div>
        <button
          onClick={() => setSelectedCloudReport(null)}
          className="mb-6 text-green-400/60 hover:text-green-400 text-sm transition-colors"
        >
          ← 返回列表
        </button>
        <FullReport
          report={selectedCloudReport.fullReport as {
            archetype: string;
            rules: string;
            encounter: string;
            prescription: string;
          }}
          scores={selectedCloudReport.dimensions as {
            empathy: number;
            rule: number;
            resilience: number;
            role: number;
          }}
          roleTitle={selectedCloudReport.roleTitle}
          onSave={handleSave}
        />
      </div>
    );
  }

  const hasCloudReports = cloudReports.length > 0;
  const hasLocalReports = localReports.length > 0;

  if (!hasCloudReports && !hasLocalReports) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🌿</div>
        <p className="text-white/40">还没有测评记录</p>
        <p className="text-white/20 text-sm mt-2">完成一次测评后，报告会保存在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cloud reports (if logged in) */}
      {user && (
        <div className="mb-6">
          <h2 className="text-green-200/70 text-sm font-medium mb-3">
            云端报告
          </h2>
          {cloudLoading ? (
            <p className="text-white/20 text-sm">加载中...</p>
          ) : cloudReports.length === 0 ? (
            <p className="text-white/20 text-sm">暂无云端报告</p>
          ) : (
            <div className="space-y-3">
              {cloudReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedCloudReport(report)}
                  className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-green-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌿</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/80 font-medium truncate">
                        {report.roleTitle}
                      </div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString("zh-CN")}
                        {report.isPaid ? " · 已解锁" : " · 未解锁"}
                      </div>
                    </div>
                    <span className="text-white/20 text-sm">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Local reports */}
      {hasLocalReports && (
        <div>
          <h2 className="text-green-200/70 text-sm font-medium mb-3">
            本地记录（本设备 · 最多5条）
          </h2>
          <div className="space-y-3">
            {localReports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-green-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {report.answers.scene1.animalName
                      ? getAnimalIllustration(report.answers.scene1.animalName).emoji
                      : "🌿"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/80 font-medium truncate">
                      {report.cardTitle}
                    </div>
                    <div className="text-white/30 text-xs mt-0.5">
                      {new Date(report.createdAt).toLocaleDateString("zh-CN")}
                      {report.isPaid ? " · 已解锁" : " · 未解锁"}
                    </div>
                  </div>
                  <span className="text-white/20 text-sm">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings section */}
      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <h3 className="text-green-200/70 text-sm font-medium mb-3">设置</h3>
        <div className="space-y-1 text-sm text-white/40">
          <div className="py-2">🔊 白噪音（右上角开关）</div>
          <button
            onClick={() => {
              localStorage.clear();
              setLocalReports([]);
            }}
            className="py-2 hover:text-white/60 transition-colors block w-full text-left"
          >
            🗑 清除本地缓存
          </button>
          <div className="py-2">ℹ️ 关于 Forest Journey</div>
          <div className="py-2">🔒 隐私政策</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update profile page to fetch cloud data**

Read `app/(public)/profile/page.tsx`. Replace with:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import HistoryList from "@/components/profile/HistoryList";

interface CloudReport {
  id: string;
  roleTitle: string;
  fullReport: Record<string, unknown>;
  dimensions: Record<string, number>;
  isPaid: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, loading, openAuthModal, signOut } = useUser();
  const [cloudReports, setCloudReports] = useState<CloudReport[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setCloudLoading(true);
    fetch("/api/reports/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data.reports) {
          setCloudReports(data.reports);
        }
      })
      .catch(() => {})
      .finally(() => setCloudLoading(false));
  }, [user]);

  return (
    <main className="min-h-screen px-6 pt-12 pb-24 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
          {user ? "🌲" : "🌿"}
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="text-white/30 text-sm">加载中...</div>
          ) : user ? (
            <>
              <h1 className="text-white/80 font-medium truncate">
                {user.email}
              </h1>
              <button
                onClick={() => signOut()}
                className="text-white/30 text-xs mt-0.5 hover:text-white/50 transition-colors"
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <h1 className="text-white/70 font-medium">未登录</h1>
              <button
                onClick={() => openAuthModal("login")}
                className="text-green-400/60 text-xs mt-0.5 hover:text-green-400 transition-colors"
              >
                登录以查看云端报告
              </button>
            </>
          )}
        </div>
      </div>

      <HistoryList cloudReports={cloudReports} cloudLoading={cloudLoading} />
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/profile/page.tsx components/profile/HistoryList.tsx
git commit -m "feat: add cloud data support to profile and HistoryList"
```

---

### Task 11: Verify TypeScript compilation and fix issues

**Files:**
- No new files — type checking pass

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors. If errors exist, fix them inline.

- [ ] **Step 2: Start dev server and smoke test flows**

```bash
npm run dev
```

Smoke test:
1. Visit `http://localhost:3000` — homepage loads
2. Complete a full assessment flow
3. On result page, verify "注册以永久保存报告" button appears
4. Click it — AuthModal opens in signup mode
5. Register with email+password — modal closes
6. Check profile page — user email shown, report listed

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: TypeScript and integration fixes for Supabase auth"
```

---

### Task 12: Final verification

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```

Expected: 17/17 tests pass (existing mapping-engine tests unchanged)

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 3: Verify all pages load without errors**

Open dev server, manually verify:
- `/` homepage
- `/meditate` breathing page
- `/assessment` 4-scene flow
- `/result` with auth modal trigger
- `/profile` with login/logout

- [ ] **Step 4: Update PROJECT_STATUS.md**

```markdown
## 当前阶段

**Phase 12: Supabase Auth 集成完成**
```

- [ ] **Step 5: Final commit**

```bash
git add PROJECT_STATUS.md
git commit -m "docs: mark Phase 12 Supabase Auth as complete"
```
