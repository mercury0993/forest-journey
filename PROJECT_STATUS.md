# Forest Journey — 项目状态

> 最后更新：2026-06-15

## 完成阶段

| 阶段 | 内容 | 状态 |
|---|---|---|
| Phase 1-11 | 脚手架、核心库、布局、页面、API、Prisma、集成验证 | ✅ |
| Phase 12 | Supabase Auth（登录/注册/AuthModal/UserContext） | ✅ |
| Phase 13 | 安全加固（RLS/速率限制/输入校验）+ 分享卡片 PNG 下载 | ✅ |
| Phase 14 | 26 种扁平矢量动物 SVG + AnimalIcon 统一组件 | ✅ |
| Phase 15 | 森林白噪音 — Web Audio API 程序化合成 | ✅ |
| Phase 16 | Google OAuth 登录 — AuthModal 一键 Google 登录 | ✅ |
| Phase 17 | 语音输入 — Web Speech API 长按录音，中文识别 | ✅ |
| Phase 18 | 密码重置 — 忘记密码 → 邮件 → 新密码 | ✅ |
| Phase 19 | B 端管理后台 — 管理员认证 + 侧边栏布局框架（子系统 1/5） | ✅ |
| Phase 20 | B 端测评码管理 — 生成/追踪/核销（子系统 2/5） | ✅ |
| Phase 21 | B 端团队看板 — 概览/成员列表/批次分组（子系统 3/5） | ✅ |
| Phase 22 | B 端岗位模型 — 四维画像+候选人匹配（子系统 4/5） | ✅ |
| Phase 23 | B 端报告导出 — CSV 批量下载（子系统 5/5） | ✅ |
| Phase 24 | B 端完善 — 仪表盘统计/邀请码用户列表/邮箱追踪 | ✅ |

## 验证

- **17/17** 测试通过 | **TypeScript** 0 错误 | 构建成功
- **页面路由**：`/` `/meditate` `/assessment` `/result` `/profile` `/reset-password` `/admin` `/admin/invite-codes`
- **API 路由**：`/api/report` `/api/reports/sync` `/api/admin/invite-codes` `/api/admin/team` `/api/auth/claim-code`

## 技术栈

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + Vitest + Prisma v7 + Supabase Auth + OpenAI API + Web Audio / Speech API

## 关键决策

- 无需登录即可测评，注册保存报告
- 限时免费（划线价 ¥9.99），直接看完整报告
- 6 种报告模板（Euclidean distance 匹配）
- 个人中心 localStorage（最多 5 条）
- 零外部音频文件（Web Audio API 程序化合成）

## 设计 & 计划文档

- [MVP 设计](docs/superpowers/specs/2026-06-02-forest-journey-mvp-design.md) / [MVP 计划](docs/superpowers/plans/2026-06-02-forest-journey-mvp.md)
- [Supabase Auth 设计](docs/superpowers/specs/2026-06-03-supabase-auth-design.md) / [Auth 计划](docs/superpowers/plans/2026-06-03-supabase-auth.md)
- [SVG 插画设计](docs/superpowers/specs/2026-06-13-animal-svg-illustrations-design.md) / [SVG 计划](docs/superpowers/plans/2026-06-13-animal-svg-illustrations.md)
- [语音输入设计](docs/superpowers/specs/2026-06-14-voice-input-design.md) / [语音计划](docs/superpowers/plans/2026-06-14-voice-input.md)
- [Admin 布局设计](docs/superpowers/specs/2026-06-15-admin-auth-layout-design.md) / [Admin 计划](docs/superpowers/plans/2026-06-15-admin-auth-layout.md)
- [测评码设计](docs/superpowers/specs/2026-06-15-invite-codes-design.md) / [测评码计划](docs/superpowers/plans/2026-06-15-invite-codes.md)

## 变更记录

- middleware → proxy（Next.js 16 废弃 middleware 文件惯例）
- Prisma v7 + PrismaClient 懒加载（避免 Vercel 构建 crash）
- 分享卡片：html-to-image → PNG 下载（Chrome Save-As）
- 安全加固：RLS 三表 + uuid、速率限制、输入校验、Prompt 注入防护
- 动物 SVG：26 种矢量插画，共享面部组件，替换所有 emoji
- 森林白噪音：程序化合成立体声景（棕噪声 + LFO 溪流 + 随机鸟鸣）
- Google OAuth：Supabase signInWithOAuth，一键跳转授权
- 语音输入：长按录音 + 实时气泡 + 红色脉冲，不支持浏览器静默降级
- 密码重置：忘记密码 → 发送邮件 → `/reset-password` 设置新密码
- **B 端管理后台（子系统 1）**：`lib/admin.ts` isAdmin 工具（Supabase user_metadata）；`app/admin` 布局（侧边栏 + 顶栏 + 权限守卫）；BottomNav 管理员入口；5 个子系统占位页
- **测评码管理（子系统 2）**：InviteCode 表（`FJ-` 前缀 8 位码）；管理员批量生成/列表/详情；用户注册选填邀请码自动核销
- **团队看板（子系统 3）**：InviteCodeUser 关联表追踪用户-码映射；`/api/admin/team` 聚合查询；三标签看板（概览面板+原型分布+四维雷达 / 成员列表可排序筛选 / 批次分组卡片）
- **岗位模型（子系统 4）**：RoleModel 表存储岗位四维画像；滑块调节+迷你雷达图实时预览；Euclidean distance 候选人匹配排序+叠加雷达对比
- **报告导出（子系统 5）**：CSV 格式团队数据批量导出，7 列包含原型+四维分+时间+批次，API 直接返回文件下载
- **B 端完善**：仪表盘展示真实统计卡片+快捷入口；InviteCodeUser 增加 email 字段；邀请码详情页显示实际使用者列表含邮箱和报告；团队看板成员列表新增邮箱列

## Bug 修复

- React setState 从渲染期间移至 useEffect
- 雷达图 SVG viewBox 标签裁切（`0 0 280 280` → `-30 -10 340 320`）

## 安全审查

**已完成：** 支付 mock 移除、RLS 三表、速率限制、输入校验、Prompt 注入防护、密码强度 8 位、请求体大小限制、密码重置流程

**未完成（低优先级）：** 邮箱验证（刻意关闭，怕自锁）、localStorage 加密（风险可接受）

## 下一步

| # | 项目 | 优先级 |
|---|---|---|
| 1 | 语音引导 TTS | 🎤 低 |
| 2 | 分享裂变 | 🔗 低 |
| 3 | PDF 个人报告导出 | 🏢 远期 |
