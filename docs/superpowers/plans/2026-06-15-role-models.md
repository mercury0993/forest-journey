# Role Models Implementation Plan

> 4 tasks: schema + API + page + verification. Inline execution.

**Goal:** Admin creates ideal role profiles, matches team members by Euclidean distance

---

### Task 1: Schema + migration

Add to `prisma/schema.prisma`:

```prisma
model RoleModel {
  id          String   @id @default(cuid())
  name        String
  empathy     Int
  rule        Int
  resilience  Int
  role        Int
  createdBy   String   @map("created_by") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")
  @@map("role_models")
}
```

SQL migration:
```sql
CREATE TABLE "role_models" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL,
    "empathy" INTEGER NOT NULL, "rule" INTEGER NOT NULL,
    "resilience" INTEGER NOT NULL, "role" INTEGER NOT NULL,
    "created_by" UUID NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_models_pkey" PRIMARY KEY ("id")
);
```

---

### Task 2: API route

`app/api/admin/role-models/route.ts` — GET (list by admin) + POST (create) + DELETE (?id=)

```typescript
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
  if (!name || [empathy, rule, resilience, role].some((v) => v < 0 || v > 100)) {
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
```

---

### Task 3: Role models page

`app/admin/role-models/page.tsx` — create form with sliders + list cards + candidate matching panel.

Key sections:
- State: models[], showCreate, form fields, candidateModel (selected for matching), candidates[]
- Create form: name input + 4 range sliders (0-100) + mini radar preview + save button
- Model cards: grid, each showing name + mini radar + edit/delete/match buttons
- Match panel: overlay/modal when a model is selected — fetch team API data, compute Euclidean distance per member, sort, display table with comparison bars

---

### Task 4: Verification + docs

TypeScript check, build, tests, PROJECT_STATUS.md update, push.
