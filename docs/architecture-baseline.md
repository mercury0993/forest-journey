# 架构基线文档

## 1. 项目信息

| 项目 | 值 |
|------|-----|
| 项目名称 | Forest Journey（森林之旅） |
| 技术栈 | Next.js 16.2.7 (App Router) + React 19 + Prisma 7 + Supabase |
| 基线版本 | v3 |
| 生成时间 | 2026-06-16 |
| 基线 Git Commit | cf6da54 |

## 2. 目录责任表

| 目录 | 单一职责 | 允许放置 | 禁止放置 | 来源 |
|------|---------|---------|---------|------|
| `app/(public)/` | C 端公开页面路由 | page.tsx、layout.tsx | API route.ts | 框架推荐 |
| `app/admin/` | B 端管理后台页面 | page.tsx、layout.tsx | 直接 DB 查询、API route.ts | 框架推荐 |
| `app/api/` | 后端 API 端点 | route.ts | 页面组件 | 框架推荐 |
| `app/api/admin/` | B 端管理 API | route.ts（admin 权限守卫） | 页面组件 | 项目自定义 |
| `components/` | 可复用 React UI 组件 | .tsx 组件，按功能分包 | 直接 API 调用、直接 DB 访问 | 框架惯例 |
| `context/` | React Context 状态管理 | Provider + hook 文件 | UI 渲染逻辑 | 项目自定义 |
| `lib/` | 工具函数、类型、业务逻辑、DB 客户端 | 纯函数、类型、Prisma/Supabase 封装 | React 组件、JSX | 项目自定义 |
| `lib/supabase/` | Supabase 客户端工厂 | client.ts、server.ts | 业务逻辑 | 项目自定义 |
| `prisma/` | 数据库 schema 与迁移 | schema.prisma、SQL 迁移 | 应用代码 | 框架推荐 |

## 3. 分层架构与调用路径

### 3.1 C 端页面请求链路（以 `/assessment` 为例）

```
浏览器 URL → Next.js App Router
  → app/layout.tsx → AudioProvider → AssessmentProvider → UserProvider → ForestLayout
  → app/(public)/assessment/page.tsx
    → components/assessment/AssessmentFlow.tsx（场景状态机）
      → SceneAnimal / SceneTable / SceneWall
    → context/AssessmentContext.tsx（答案状态 + localStorage）
  → 完成：lib/storage.ts::saveLatestAnswers() + router.push("/result")
```

### 3.2 C 端 API 链路（以 `POST /api/report` 为例）

```
浏览器 fetch("/api/report")
  → app/api/report/route.ts POST()
    → 安全校验：content-length ≤ 16KB、rateLimit(ip)
    → 参数提取：request.json() → AssessmentAnswers
    → 校验：scene1.animalName + scene4.animalName 非空 → 400
    → 规则引擎初评：lib/nlp-fallback.ts + lib/mapping-engine.ts::calculateScores()
    → DeepSeek 分析（可选）：buildPrompt(answers) → fetch("https://api.deepseek.com/v1/chat/completions")
      → JSON 防御解析：safeParseJSON() 三层提取 → validateAIFields() 字段容错
    → AI 校准：lib/mapping-engine.ts::applyAICalibration(ruleScores, aiScores)
      → 分歧熔断（|rule−ai| > 40 → 废弃校准）
    → 原型匹配：lib/templates.ts::findArchetype(scores) → 81 原型 Euclidean distance
    → 合成报告：archetype 骨架 + AI 个性化段落（rules/encounter/prescription）
    → 降级：DeepSeek 失败/熔断 → 81 原型 defaultReport 全文
    → 响应：NextResponse.json({ data: { nlp, scores, calibrationTrusted, archetypeIndex, roleTitle, cardTitle, cardInterpretation, fullReport } })
    → 错误：NextResponse.json({ error: "..." }, { status: 400/413/429/500 })
```

### 3.3 B 端 API 链路（以 `GET /api/admin/team` 为例）

```
浏览器 fetch("/api/admin/team")
  → app/api/admin/team/route.ts GET()
    → 身份验证：createServerSupabase() → auth.getUser()
    → 权限检查：lib/admin.ts::isAdmin(user) → 403
    → 业务处理：lib/invite-code.ts::getTeamMembers(adminUserId)
      → lib/prisma.ts::prisma（PrismaClient 懒加载 Proxy）
        → inviteCode.findMany → inviteCodeUser.findMany → report.findMany
    → 响应：NextResponse.json({ totalMembers, totalReports, reports, byCode })
```

### 3.4 B 端页面请求链路（以 `/admin/invite-codes` 为例）

```
浏览器 URL → app/admin/layout.tsx（侧边栏 + 权限守卫）
  → 检查 isAdmin(user) → 非 admin → router.replace("/")
  → app/admin/invite-codes/page.tsx（客户端组件）
    → useEffect → fetch("/api/admin/invite-codes")
    → 表格渲染（生成表单 + 码列表）
```

### 3.5 状态码约定

| 状态码 | 场景 |
|--------|------|
| 200 | 正常响应 |
| 400 | 参数校验失败 |
| 401 | 未认证 |
| 403 | 权限不足（非 admin） |
| 404 | 资源不存在 |
| 500 | 服务内部错误 |

## 4. 技术选型清单

| 技术/框架 | 版本 | 用途 | 类型 |
|----------|------|------|------|
| Next.js | 16.2.7 | 全栈框架（App Router + Turbopack） | 框架原生 |
| React | 19.2.4 | UI 渲染 | 框架原生 |
| TypeScript | ^5 | 类型安全 | 框架原生 |
| Prisma | ^7.8.0 | PostgreSQL ORM | 框架原生 |
| Supabase (supabase-js) | ^2.107.0 | Auth + PostgreSQL | 项目自定义 |
| Tailwind CSS | ^4 | 原子化 CSS | 框架原生 |
| Framer Motion | ^12.40.0 | 动画 | 项目自定义 |
| OpenAI API (gpt-4o-mini) | — | NLP 动物分类（已废弃，由 DeepSeek 替代） | 项目自定义 |
| DeepSeek API (deepseek-chat) | — | AI 深度心理分析 + 个性化报告生成（可选，三层降级） | 项目自定义 |
| Vitest | ^4.1.8 | 单元测试 | 项目自定义 |
| Web Speech API | 浏览器原生 | 语音输入（中文识别） | 框架原生 |
| Web Audio API | 浏览器原生 | 程序化森林音景 | 框架原生 |

### 4.1 项目自定义封装审查

| 封装 | 文件 | 解决的具体问题 | 去掉后的后果 | 框架是否提供 |
|------|------|--------------|-------------|------------|
| PrismaClient 懒加载 Proxy | lib/prisma.ts | Vercel 构建时 DB URL 不可用导致 crash | 构建失败 | 否 |
| localStorage 工具 | lib/storage.ts | 统一 key 命名 + 最多 5 条 + 满降级 | key 不一致、无限制 | 否 |
| 动物表情映射 | lib/animals.ts | 26 种动物 icon 映射 | 组件硬编码重复 | 否 |
| 报告模板 | lib/templates.ts | 81 种人格原型（4维×3档）+ AI prompt 方向指引 + 默认降级报告 | 需存数据库或 CMS（175KB 约 81×2KB） | 否 |
| 映射引擎 | lib/mapping-engine.ts | 13 条规则初评 + AI 校准（权重可配）+ 分歧熔断（阈值 40）+ 三档化定位 | 需外部评分 API | 否 |
| NLP 降级 | lib/nlp-fallback.ts | DeepSeek 不可用时关键词兜底（中英文扩展 + 特征词提取 + 关系动态推断） | NLP 完全不可用 | 否 |
| 管理员判断 | lib/admin.ts | `user.user_metadata.is_admin` 封装 | 每处 API 重复 3 行 | 否 |
| 邀请码业务逻辑 | lib/invite-code.ts | 码生成/核销/查询/团队聚合 | API 路由充斥 Prisma 查询 | 否 |
| Supabase 客户端 | lib/supabase/*.ts | 浏览器/服务端客户端创建 | Auth 不可用 | 是（官方模式） |
| cn() 工具 | lib/utils.ts | className 合并去重 | shadcn/ui 不可用 | 是（shadcn/ui 标准） |

## 5. 接口规范

**正常响应（包装格式）：**
```json
// GET /api/admin/invite-codes → { codes: [...] }
// GET /api/admin/team → { totalMembers, totalReports, reports, byCode }
// GET /api/admin/role-models → { models: [...] }
// POST /api/admin/invite-codes → { codes: [...] }
// POST /api/admin/role-models → { model: {...} }
// DELETE /api/admin/role-models → { ok: true }
```

**异常响应：**
```json
{ "error": "Missing required fields" }    // 400
{ "error": "Not authenticated" }           // 401
{ "error": "Forbidden" }                   // 403
{ "error": "Not found" }                   // 404
{ "error": "Internal server error" }       // 500
```

## 6. 启动与配置

### 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DATABASE_URL` | 是 | PostgreSQL 连接串 |
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase 匿名密钥 |
| `OPENAI_API_KEY` | 否 | （已废弃，由 DEEPSEEK_API_KEY 替代） |
| `DEEPSEEK_API_KEY` | 否 | 不填则三层降级：规则引擎 + 81 原型默认报告 + 关键词 NLP |
| `AI_CALIBRATION_WEIGHT` | 否 | AI 校准权重（0-1），默认 0.4 |

### 启动

```bash
npm install && npx prisma generate && npm run dev   # 开发
npm run build && npm start                            # 生产
npm test                                              # 测试（17/17）
```

### 健康检查

`http://localhost:3000` 返回 200 即正常。无独立 `/health` 端点。

## 7. 验收记录

| 日期 | 版本 | 通过 | 警告 | 未通过 | 结论 |
|------|------|------|------|--------|------|
| 2026-06-16 | v3 | 6 | 0 | 0 | ✅ 全部通过（增量） |
| 2026-06-15 | v2 | 6 | 0 | 0 | ✅ 全部通过 |
| 2026-06-12 | v1 | 4 | 2 | 0 | ⚠️ 有条件通过 |

### 2026-06-15 验收详情（v2，全量复查）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 规则验证 | ✅ | 所有基线规则通过，v1 警告项已修复 |
| 2 | 目录责任 | ✅ | app/admin 无 DB 直接调用，app/api 无页面组件 |
| 3 | 最小模块演练 | ✅ | GET /api/admin/team：入口→鉴权→业务→数据→响应，逐层调用 |
| 4 | 接口返回示例 | ✅ | 新 API 统一 `{ key: value }` 包装，状态码 200/400/403/404/500 |
| 5 | 框架封装边界 | ✅ | lib/admin.ts + lib/invite-code.ts 各有明确业务理由 |
| 6 | 启动和配置 | ✅ | TypeScript 0 错误 + 17/17 测试 + 构建成功 |

### v1 警告项修复确认

| 警告 | 状态 |
|------|------|
| `fj_latest_answers` 旁路 storage.ts | ✅ lib/storage.ts 已纳入 KEYS.latestAnswers |
| POST /api/report 裸对象返回 | ✅ 已解决（v3）：改为 `{ data: { nlp, scores, calibrationTrusted, ... } }` 包装 |

---

### 2026-06-16 验收详情（v3，增量验收，基线 cf6da54 vs cd4a7cd）

| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | 规则验证 | ✅ | lib/*.ts 无 React/JSX 引用，app/api/report 无直接 DB 访问 |
| 3 | 最小模块演练 | ✅ | POST /api/report：入口→安全校验→规则初评→DeepSeek→AI校准→原型匹配→合成报告，逐层调用 |
| 4 | 接口返回示例 | ✅ | `{ data: { nlp, scores, calibrationTrusted, fullReport } }` 统一包装，状态码 200/400/413/429/500 |
| 5 | 框架封装边界 | ✅ | templates.ts（81原型生成）、mapping-engine.ts（校准熔断）、nlp-fallback.ts（中英文关键词）各有明确业务理由 |
| 6 | 启动和配置 | ✅ | TypeScript 0 错误，17/17 测试通过，构建成功，.env.example 含 DEEPSEEK_API_KEY |

**变更明细（vs v2）：**
- `lib/templates.ts` — 6 种 → 81 种原型（程序化生成，defaultReport 降级）
- `lib/mapping-engine.ts` — 新增 applyAICalibration + 分歧熔断 + 权重可配
- `lib/nlp-fallback.ts` — 中文关键词 + 特征词提取 + 关系动态推断
- `lib/types.ts` — 新增 Tier、DimensionTiers、AIAnalysisResult、ArchetypeDefinition
- `app/api/report/route.ts` — DeepSeek 替换 OpenAI，JSON 防御解析，混合报告合成
- `.env.example` — OPENAI_API_KEY → DEEPSEEK_API_KEY
- 未变更项 — Step 2（目录责任）：沿用 v2 验收结论
