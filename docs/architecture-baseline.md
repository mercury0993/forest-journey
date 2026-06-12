# 架构基线文档

## 1. 项目信息

| 项目 | 值 |
|------|-----|
| 项目名称 | Forest Journey（森林之旅） |
| 技术栈 | Next.js 16.2.7 (App Router) + React 19 + Prisma 7 + Supabase |
| 基线版本 | v1 |
| 生成时间 | 2026-06-12 |
| 基线 Git Commit | 91a57ac |

## 2. 目录责任表

| 目录 | 单一职责 | 允许放置 | 禁止放置 | 来源 |
|------|---------|---------|---------|------|
| `app/` | Next.js 路由入口（页面 + API） | page.tsx, layout.tsx, route.ts, globals.css, 路由组目录 | 业务逻辑函数、数据库查询、React Context Provider 定义 | 框架推荐 |
| `app/(public)/` | 公开页面路由组 | 各页面的 page.tsx | API route.ts，服务端专用代码 | 框架推荐（路由组） |
| `app/api/` | 后端 API 端点 | route.ts（含 HTTP method 导出） | 页面组件、客户端专用代码 | 框架推荐 |
| `components/` | 可复用 React UI 组件 | .tsx 组件文件，按功能分包 | 直接调用 API（应通过 Context 或 props），直接访问数据库 | 框架惯例 |
| `context/` | React Context 全局状态管理 | Context Provider + hook 导出文件 | UI 渲染逻辑、API 调用 | 项目自定义 |
| `lib/` | 共享工具函数、类型、引擎逻辑 | 纯函数、类型定义、DB 客户端、SDK 封装 | React 组件、JSX、页面文件 | 项目自定义 |
| `lib/supabase/` | Supabase 客户端初始化 | client.ts（浏览器端）、server.ts（服务端） | 业务逻辑、Auth UI 逻辑 | 项目自定义 |
| `prisma/` | 数据库 schema 与迁移 | schema.prisma、迁移 SQL 文件 | 应用代码、API 逻辑 | 框架推荐 |
| `public/` | 静态资源 | 图片、音频、字体 | 源代码、配置文件 | 框架推荐 |
| `docs/` | 项目文档与规格 | .md 文档、设计稿、计划 | 应用源代码 | 项目自定义 |
| `context/` | React Context Provider 定义 | *_Context.tsx（含 Provider + hook） | UI 组件渲染 | 项目自定义 |
| `.claude/` | Claude Code 配置 | settings.json, plans, memory | 应用源代码 | 工具配置 |

## 3. 分层架构与调用路径

### 3.1 页面请求链路（以 `/assessment` 为例）

```
浏览器 URL → Next.js App Router
  → app/layout.tsx（根布局：包裹 Context Provider 层级）
    → AudioProvider → AssessmentProvider → UserProvider → ForestLayout
  → app/(public)/assessment/page.tsx（页面入口）
    → components/assessment/AssessmentFlow.tsx（场景状态机）
      → components/assessment/SceneAnimal.tsx（场景1/4：动物描述输入）
      → components/assessment/SceneTable.tsx（场景2：桌布+凳子选择）
      → components/assessment/SceneWall.tsx（场景3：墙+过墙方式）
    → context/AssessmentContext.tsx（答案状态管理 + localStorage 持久化）
  → 场景4完成后：localStorage.setItem("fj_latest_answers") + router.push("/result")
```

### 3.2 API 请求链路（以 `POST /api/report` 为例）

```
浏览器 fetch("/api/report", { body: {...} })
  → app/api/report/route.ts POST()
    → 参数提取：await request.json() → { animal1Text, animal2Text, animal2Feeling }
    → 参数校验：if (!animal1Text || !animal2Text) → 400
    → 业务处理：构造 OpenAI prompt → fetch("https://api.openai.com/...")
    → 降级策略：catch → lib/nlp-fallback.ts::nlpFallback()
    → 统一响应：NextResponse.json(result)
    → 错误处理：外层 catch → NextResponse.json({ error: "Internal server error" }, { status: 500 })
```

### 3.3 数据持久化链路（以 `POST /api/reports/sync` 为例）

```
浏览器 fetch("/api/reports/sync", { method: "POST", body: { reports } })
  → app/api/reports/sync/route.ts POST()
    → 身份验证：lib/supabase/server.ts::createServerSupabase() → supabase.auth.getUser()
      → 未认证 → NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    → 参数提取：await request.json()
    → 业务逻辑：遍历 reports 数组
    → 数据访问：lib/prisma.ts::prisma.assessment.create() + prisma.report.create()
    → 统一响应：NextResponse.json({ synced: [...] })
    → 错误处理：catch → NextResponse.json({ error: "Sync failed" }, { status: 500 })
```

### 3.4 核心算法链路（客户端评分）

```
用户完成4个场景 → AssessmentAnswers
  → lib/mapping-engine.ts::calculateScores(answers, nlp)
    → 13条规则逐条应用 → DimensionScores { empathy, rule, resilience, role }
  → lib/mapping-engine.ts::matchTemplate(scores)
    → 6个模板欧几里得距离计算 → 最近匹配的 ReportTemplate
  → lib/types.ts::ReportData 组装
```

## 4. 技术选型清单

| 技术/框架 | 版本 | 用途 | 类型 | 合理性说明 |
|----------|------|------|------|-----------|
| Next.js | 16.2.7 | 全栈框架（App Router + Turbopack） | 框架原生 | — |
| React | 19.2.4 | UI 渲染 | 框架原生（Next.js 捆绑） | — |
| TypeScript | ^5 | 类型安全 | 框架原生 | — |
| Prisma | ^7.8.0 | PostgreSQL ORM | 框架原生 | — |
| Supabase (supabase-js) | ^2.107.0 | Auth 认证 + PostgreSQL 托管 | 项目自定义 | 替代 NextAuth：统一 Auth + DB 托管在一个平台 |
| @supabase/ssr | ^0.10.3 | Supabase 服务端会话管理（cookie 读写） | 框架原生（Supabase 官方） | — |
| Tailwind CSS | ^4 | 原子化 CSS | 框架原生 | — |
| shadcn/ui | ^4.10.0 | UI 组件基元（Button 等） | 项目自定义 | 提供可复制的组件源码，不引入 npm 黑盒依赖 |
| Framer Motion | ^12.40.0 | 声明式动画 | 项目自定义 | React 动画生态事实标准 |
| OpenAI API (gpt-4o-mini) | — | NLP 动物分类（可选） | 项目自定义 | 可选依赖，无 key 时降级到关键词正则 |
| Vitest | ^4.1.8 | 单元测试 | 项目自定义 | 与 Vite 生态一致的测试框架 |
| @vitejs/plugin-react | ^6.0.2 | Vitest 中的 React JSX 支持 | 框架原生（Vitest 官方） | — |
| jsdom | ^29.1.1 | 测试环境 DOM 模拟 | 框架原生（Vitest 配套） | — |
| class-variance-authority | ^0.7.1 | 组件变体类型安全定义 | 框架原生（shadcn/ui 依赖） | — |
| clsx + tailwind-merge | ^2.1.1 / ^3.6.0 | className 条件合并 | 框架原生（shadcn/ui 依赖） | — |
| lucide-react | ^1.17.0 | 图标库 | 项目自定义 | shadcn/ui 默认图标方案 |
| @base-ui/react | ^1.5.0 | shadcn/ui Button 底层基元 | 框架原生（shadcn/ui 依赖） | — |

### 4.1 项目自定义封装审查

| 封装 | 文件 | 解决的具体问题 | 去掉后的后果 | 框架是否已提供 |
|------|------|--------------|-------------|--------------|
| PrismaClient 懒加载 Proxy | lib/prisma.ts | Vercel 构建时 DATABASE_URL 不可用导致 `npx prisma generate` 崩溃 | `next build` 在 Vercel 上失败 | 否，Prisma 默认热重载方案不处理此边缘情况 |
| localStorage 工具 | lib/storage.ts | 统一 key 命名 + max-5-reports 限制 + 存储满降级 | 各组件使用原始 localStorage，key 不一致，数量无限制 | 否 |
| 动物表情映射 | lib/animals.ts | 26种动物英文→中文+emoji 的视觉化映射 | 每个组件硬编码自己的 emoji 映射表 | 否 |
| 报告模板数据 | lib/templates.ts | 6种人格原型的完整中文描述内容 | 需要把这些数据存到数据库或 CMS 中 | 否 |
| 映射引擎 | lib/mapping-engine.ts | 13条规则的4维人格评分算法 + 模板匹配 | 需要在服务端实现相同逻辑或调用外部评分 API | 否 |
| NLP 关键词降级 | lib/nlp-fallback.ts | OpenAI API 不可用时的关键词正则兜底方案 | 无 OPENAI_API_KEY 时 NLP 完全不可用 | 否 |
| cn() 工具函数 | lib/utils.ts | Tailwind className 条件合并+去重 | shadcn/ui 组件无法正常工作 | 是（shadcn/ui 标准模式，非项目发明） |
| Supabase 客户端工厂 | lib/supabase/*.ts | 浏览器/服务端 Supabase 客户端创建（含 cookie 处理） | Auth 功能完全不可用 | 是（Supabase 官方推荐模式） |
| proxy.ts 会话刷新 | proxy.ts | 每次请求刷新 Supabase 会话 cookie | 用户登录态在 cookie 过期后丢失 | 是（Supabase SSR 官方推荐模式，但 Next.js 16 要求命名为 proxy.ts 而非 middleware.ts） |

## 5. 接口规范

### 5.1 响应结构约定

**正常响应：**
```json
// POST /api/report 正常返回
{
  "animal1Name": "狐狸",
  "animal1Category": "predator_solitary",
  "animal2Name": "小鹿",
  "animal2Category": "herbivore_gentle",
  "animal1Sentiment": "positive",
  "animal2Sentiment": "positive"
}

// GET /api/reports/sync 正常返回
{
  "reports": [...]
}

// POST /api/reports/sync 正常返回
{
  "synced": ["report-id-1", "report-id-2"]
}
```

**异常响应：**
```json
// 参数校验失败 → 400
{ "error": "Missing required fields" }

// 未认证 → 401
{ "error": "Not authenticated" }

// 服务内部错误 → 500
{ "error": "Internal server error" }
// 或
{ "error": "Sync failed" }
// 或
{ "error": "Failed to fetch reports" }
```

### 5.2 状态码约定

| 状态码 | 场景 |
|--------|------|
| 200 | 所有正常响应（默认） |
| 400 | 参数校验失败（缺少必填字段） |
| 401 | 未认证（需要登录） |
| 500 | 服务内部错误 |

## 6. 启动与配置

### 6.1 环境变量清单

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DATABASE_URL` | 是 | PostgreSQL 连接串（Prisma） |
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase 匿名密钥（客户端安全） |
| `OPENAI_API_KEY` | 否 | OpenAI API Key，不填则 NLP 降级为关键词正则 |

### 6.2 启动命令

```bash
npm install          # 安装依赖
npx prisma generate  # 生成 Prisma Client
npx prisma db push   # 同步数据库 schema
npm run dev          # 开发模式启动（Turbopack）
npm run build        # 生产构建
npm start            # 生产启动
npm test             # 运行 Vitest 单元测试
```

### 6.3 服务监听端口

默认 `http://localhost:3000`

### 6.4 健康检查

无独立的 `/health` 端点。项目为客户端渲染应用，任何页面路由返回 200 即表示服务正常。

## 7. 验收记录

| 日期 | 版本 | 通过 | 警告 | 未通过 | 结论 |
|------|------|------|------|--------|------|
| 2026-06-12 | v1 | 4 | 2 | 0 | ⚠️ 有条件通过 |

### 2026-06-12 验收详情（v1，首次全量验收）

| # | 验收项 | 结果 | 证据位置 | 未通过原因 | 是否阻塞 |
|---|--------|------|---------|-----------|---------|
| 1 | 规则验证 | ⚠️ | 见详报 | localStorage 旁路 lib/storage.ts | 否 |
| 2 | 目录责任 | ✅ | 见详报 | — | — |
| 3 | 最小模块演练 | ✅ | 见详报 | — | — |
| 4 | 接口返回示例 | ⚠️ | 见详报 | POST /api/report 正常响应缺少外层包装 | 否 |
| 5 | 框架封装边界 | ✅ | 见详报 | — | — |
| 6 | 启动和配置 | ✅ | 见详报 | — | — |

**详报：**

**第1步 ⚠️ 规则验证 — localStorage 旁路**
- 问题描述：`fj_latest_answers` 键在 `app/(public)/result/page.tsx:26,78` 和 `components/assessment/AssessmentFlow.tsx:45` 中直接使用 `localStorage.getItem/setItem/removeItem`，但此键未纳入 `lib/storage.ts` 的统一管理（storage.ts 只管理 `fj_current_assessment`、`fj_reports`、`fj_audio_on`）
- 涉及文件：`app/(public)/result/page.tsx:26,78,119`、`components/assessment/AssessmentFlow.tsx:45`、`components/profile/HistoryList.tsx:169`
- 修复建议：将 `fj_latest_answers` 键加入 `lib/storage.ts` 管理，或确认此键是刻意独立的设计决策
- 是否阻塞：否（建议修复）

**第4步 ⚠️ 接口返回示例 — 响应格式不统一**
- 问题描述：`POST /api/report` 正常响应直接返回 NLP 解析结果（裸对象），而 `GET/POST /api/reports/sync` 使用 `{ reports: [...] }` / `{ synced: [...] }` 包装。客户端需要区分两种响应格式
- 涉及文件：`app/api/report/route.ts:56`
- 修复建议：统一为 `{ data: nlpResult }` 包装格式，或统一为无包装裸对象
- 是否阻塞：否（建议修复）
