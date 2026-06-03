# Forest Journey / 森林之旅

一次深入心灵的森林探索——通过 4 个场景问答，发现你的服务者原型。

**线上地址（Vercel）：[forest-journey.vercel.app](https://forest-journey.vercel.app)**

## 项目简介

Forest Journey 是一个心理投射测评 Web 系统。用户沉浸式完成 4 个森林场景的问答，系统基于 13 条映射规则生成服务意识测评报告，涵盖共情、规则、韧性、角色四个维度。

**核心流程：** 首页 → 冥想引导 → 4 场景测评 → 服务者卡片 → 完整报告 → 个人中心

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 16 (App Router + Turbopack) |
| 语言 | TypeScript（全栈） |
| 样式 | Tailwind CSS v4 + shadcn/ui |
| 动画 | Framer Motion |
| 认证 | Supabase Auth（邮箱密码） |
| 数据库 | Supabase PostgreSQL + Prisma v7 |
| AI | OpenAI API（降级：关键词正则） |
| 测试 | Vitest（17 个单元测试） |
| 部署 | Vercel |

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量（需要 Supabase 项目）
cp .env.example .env.local
# 编辑 .env.local，填入以下三个变量：
#   DATABASE_URL
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY

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
│   ├── report/route.ts     # NLP 分析
│   └── reports/sync/route.ts # 报告云端同步
lib/                        # 核心库
├── mapping-engine.ts       # 映射引擎（13 条规则 → 4 维评分）
├── templates.ts            # 6 种报告模板
├── prisma.ts               # 数据库单例
└── supabase/               # Supabase 客户端
context/                    # React Context
components/                 # UI 组件
prisma/schema.prisma        # 数据模型
proxy.ts                    # Auth session 刷新
```

## 核心设计

- **无登录测评** — 降低入口摩擦，测评完成后引导注册
- **13 条映射规则** → 4 维评分（共情/规则/韧性/角色）→ 欧氏距离匹配报告
- **NLP 双轨制** — OpenAI 提取实体 + 关键词正则降级，API 不可用不影响测评

## License

MIT
