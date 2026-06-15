# Forest Journey / 森林之旅

一次深入心灵的森林探索——通过 4 个场景问答，发现你的服务者原型。

**线上地址（Vercel）：[forest-journey.vercel.app](https://forest-journey.vercel.app)**

## 项目简介

Forest Journey 是一个心理投射测评 Web 系统。用户沉浸式完成 4 个森林场景的问答，系统基于自研"服务人格四维模型"（共情力、秩序感、应变力、角色定位），从 81 种原型中匹配专属报告，DeepSeek 深度分析结合个性化 AI 生成文字。

**核心流程：** 首页 → 冥想引导 → 4 场景测评 → 服务者卡片 → 完整报告 → 个人中心

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 16 (App Router + Turbopack) |
| 语言 | TypeScript（全栈） |
| 样式 | Tailwind CSS v4 |
| 动画 | Framer Motion |
| 认证 | Supabase Auth（邮箱密码 + Google OAuth） |
| 数据库 | Supabase PostgreSQL + Prisma v7 |
| AI | DeepSeek API（混合模式：AI 校准 + 81 原型，三层降级） |
| 测试 | Vitest（17 个单元测试） |
| 部署 | Vercel |

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量（需要 Supabase 项目）
cp .env.example .env.local
# 编辑 .env.local，填入以下变量：
#   DATABASE_URL
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   DEEPSEEK_API_KEY（可选，不填则使用规则引擎降级）

# 初始化数据库
npx prisma generate
npx prisma migrate dev

# 启动开发服务器
npm run dev

# 运行测试
npm test
```

## 项目结构

```
app/                        # Next.js App Router 页面
├── (public)/               # 公开路由
│   ├── page.tsx            # 首页（森林之门 + 粒子动画）
│   ├── meditate/page.tsx   # 冥想引导页
│   ├── assessment/page.tsx # 4 场景测评
│   ├── result/page.tsx     # 结果页
│   └── profile/page.tsx    # 个人中心
├── api/                    # API 路由
│   ├── report/route.ts     # DeepSeek 深度分析 + 报告生成
│   └── reports/sync/route.ts # 报告云端同步
lib/                        # 核心库
├── mapping-engine.ts       # 映射引擎（规则初评 + AI 校准 + 分歧熔断）
├── templates.ts            # 81 种服务人格原型（4维×3档全排列）
├── nlp-fallback.ts         # NLP 关键词降级（中英文 + 特征词提取）
├── prisma.ts               # 数据库单例
└── supabase/               # Supabase 客户端
context/                    # React Context
components/                 # UI 组件
prisma/schema.prisma        # 数据模型
proxy.ts                    # Auth session 刷新
```

## 核心设计

- **无登录测评** — 降低入口摩擦，测评完成后引导注册
- **自研服务人格四维模型**（共情力/秩序感/应变力/角色定位）→ 3 档 × 4 维 = 81 种原型 → 欧氏距离匹配
- **DeepSeek 混合模式** — AI 深度分析 + 规则引擎初评 + 分歧熔断（阈值 40 分），报告文字由 AI 动态生成
- **三层降级** — DeepSeek → 81 原型默认报告 → 完全离线可用，AI 服务不可用不影响测评

## License

MIT
