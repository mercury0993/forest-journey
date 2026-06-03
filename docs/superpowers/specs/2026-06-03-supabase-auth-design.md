# Forest Journey — Supabase Auth 集成交付设计

> 2026-06-03 | 用户认证 + 云端数据持久化

## 一、概述

将 MVP 从纯前端 localStorage 方案升级为 Supabase Auth 认证 + 云端 PostgreSQL 持久化。保持"无需登录即可测评"的低门槛入口，测评完成后引导注册保存报告。

## 二、技术决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 认证方案 | Supabase Auth + @supabase/ssr | 开箱即用，配置量少，session 管理自动 |
| 登录方式 | 邮箱 + 密码 | MVP 最小化，OAuth 后续加 |
| 用户表 | 删除 Prisma User 模型，用 Supabase `auth.users` | 不维护双份用户数据 |
| 用户 ID | Supabase user UUID | `auth.users.id` |
| ORM | 保留 Prisma（业务表） | Schema 复用，迁移成本低 |

## 三、数据模型变更

### Prisma schema 改动

- **删除** `User` 模型
- `Assessment.userId` — `String?`，存 Supabase user UUID，无外键约束
- `Report.userId` — `String?`，同上
- 删除两个模型上对 `User` 的 relation
- `DATABASE_URL` → Supabase 连接串

### Supabase 侧

- `auth.users` 管理认证用户
- 业务表（assessments, answers, reports）通过 Prisma migrate 创建

## 四、路由与组件

### 新增

```
lib/supabase/
├── client.ts          # browser client (singleton)
├── server.ts          # server client (cookies)
└── middleware.ts      # session refresh

components/auth/
├── AuthModal.tsx       # 注册/登录弹窗（tabs 切换）
├── LoginForm.tsx       # 邮箱 + 密码登录
└── SignupForm.tsx      # 邮箱 + 密码注册

app/api/auth/
└── route.ts           # 不需要 — Supabase Auth 自带
```

### 改造

- `app/layout.tsx` — 挂载 AuthModal + UserContext
- `app/(public)/result/page.tsx` — 未登录用户显示"注册保存报告"按钮
- `app/(public)/profile/page.tsx` — 登录后从 Supabase 拉数据，未登录用 localStorage 兜底

## 五、状态管理

新增 `UserContext`：

```ts
type UserContext = {
  user: SupabaseUser | null
  loading: boolean
  openAuthModal: (mode: 'login' | 'signup') => void
  closeAuthModal: () => void
}
```

## 六、关键流程

### 注册保存报告

```
结果页 → 点击"注册保存报告"
  → 打开 AuthModal（signup 模式）
  → 填写邮箱 + 密码 → 提交
  → Supabase Auth signUp
  → 自动登录
  → 从 localStorage 读取当前报告
  → INSERT 到 Supabase assessments + reports 表（关联新 userId）
  → 关闭弹窗 → 跳转个人中心
```

### 个人中心数据加载

```
进入 /profile
  → 有 user session? 
    → 是：从 Supabase 拉取历史报告（SELECT * WHERE userId = ?）
    → 否：从 localStorage 读取（现有逻辑）
```

### 错误处理

| 场景 | 处理 |
|---|---|
| Supabase 连接失败 | 降级到 localStorage，不影响测评核心流程 |
| 注册邮箱已存在 | "该邮箱已注册，请直接登录" + 切换到 login tab |
| 登录密码错误 | "邮箱或密码错误" |
| 同步报告失败 | 报告保留在 localStorage，提示"暂未保存到云端" |

## 七、安装依赖

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Prisma 已有，不新增。NextAuth.js 不用。OAuth 包后续再加。

## 八、测试策略

- Supabase client 单元测试（mock）
- AuthModal 组件测试（render/view/error states）
- Profile 降级逻辑测试（有 session / 无 session / 加载中）

## 九、不在本次范围

- OAuth（Google/微信）
- 密码重置
- 邮箱验证配置
- 部署到 Vercel

## 十、前置条件（用户侧）

- 注册 Supabase 账号
- 创建 Supabase 项目
- 获取项目 URL + anon key + 数据库连接串
- 填入 `.env.local`
