# Forest Journey — 项目状态

> 最后更新：2026-06-14

## 当前阶段

**Phase 13: 安全加固 + 分享卡片 — 完成** ✅

**Phase 14: 动物 SVG 插画库 — 完成** ✅

**Phase 16: Google OAuth 登录 — 完成** ✅
- [x] `components/auth/AuthModal.tsx` — Google 登录按钮 + OAuth 流程（Supabase）
- [x] TypeScript 0 错误 + 17/17 测试通过
- ⚠️ 需外部配置：Google Cloud Console OAuth 客户端 ID + Supabase Provider 启用

- [x] 26 种扁平矢量动物 SVG 组件（6 个体型家族）
- [x] AnimalIcon 统一渲染组件（模糊匹配 fallback）
- [x] ServiceCard / ShareCardImage / HistoryList 替换 emoji
- [x] TypeScript 0 错误 + 17/17 测试通过 + 构建成功
- 📋 设计文档：[specs/2026-06-13-animal-svg-illustrations-design.md](docs/superpowers/specs/2026-06-13-animal-svg-illustrations-design.md)
- 📋 实现计划：[plans/2026-06-13-animal-svg-illustrations.md](docs/superpowers/plans/2026-06-13-animal-svg-illustrations.md)（12/12 tasks 完成）

**Phase 15: 森林白噪音（Web Audio API）— 完成** ✅

- [x] `lib/audio-engine.ts` — 程序化森林音景（棕噪声 + 溪流 + 随机鸟鸣）
- [x] `context/AudioContext.tsx` — 集成音频引擎，处理 autoplay 策略
- [x] `ForestLayout.tsx` — 移除不存在的 MP3 引用
- [x] TypeScript 0 错误 + 17/17 测试通过 + 构建成功

### Phase 12 回顾
**Phase 12: Supabase Auth 集成 — 完成** — 12/12 tasks 完成
- ✅ 安装依赖 → 更新 Prisma schema → Supabase clients → proxy
- ✅ UserContext + AuthModal → layout 接入
- ✅ API route (POST/GET) → 结果页改造 → 个人中心改造
- ✅ TypeScript 0 错误 → 17/17 测试通过 → 所有页面 200 OK
- ✅ **Vercel 部署成功** — [https://forest-journey.vercel.app](你的实际地址)

### 验证结果
- **17/17** 测试通过
- **TypeScript** 0 错误
- **4 页面**全部 200：`/`, `/meditate`, `/assessment`, `/profile`
- **Dev server** 正常启动

## 整体进度

| 阶段 | 状态 |
|---|---|
| Brainstorming / 需求对齐 | ✅ 完成 |
| 设计文档 | ✅ [specs/2026-06-02-forest-journey-mvp-design.md](docs/superpowers/specs/2026-06-02-forest-journey-mvp-design.md) |
| Supabase Auth 设计文档 | ✅ [specs/2026-06-03-supabase-auth-design.md](docs/superpowers/specs/2026-06-03-supabase-auth-design.md) |
| 实现计划 | ✅ [plans/2026-06-02-forest-journey-mvp.md](docs/superpowers/plans/2026-06-02-forest-journey-mvp.md) |
| Phase 1: 项目脚手架 | ✅ Task 1-2 |
| Phase 2: 核心库 | ✅ Task 3-6 |
| Phase 3: 布局 & 共享组件 | ✅ Task 7-8 |
| Phase 4: 首页 | ✅ Task 9-10 |
| Phase 5: 冥想页 | ✅ Task 11 |
| Phase 6: 评估场景 | ✅ Task 12-15 |
| Phase 7: 结果页面 | ✅ Task 16-18 |
| Phase 8: 个人中心 | ✅ Task 19 |
| Phase 9: API 路由 | ✅ Task 20 |
| Phase 10: Prisma Schema | ✅ Task 21 |
| Phase 11: 集成验证 | ✅ Task 22-23 |
| Phase 12: Supabase Auth | ✅ 完成 (12/12) |
| Phase 13: 安全加固 + 分享卡片 | ✅ 完成 |
| Phase 14: 动物 SVG 插画库 | ✅ 完成 (12/12) |
| Phase 15: 森林白噪音 | ✅ 完成 |
| Phase 16: Google OAuth 登录 | ✅ 完成 |
| Supabase Auth 实现计划 | ✅ [plans/2026-06-03-supabase-auth.md](docs/superpowers/plans/2026-06-03-supabase-auth.md) |
| SVG 插画设计文档 | ✅ [specs/2026-06-13-animal-svg-illustrations-design.md](docs/superpowers/specs/2026-06-13-animal-svg-illustrations-design.md) |
| SVG 插画实现计划 | ✅ [plans/2026-06-13-animal-svg-illustrations.md](docs/superpowers/plans/2026-06-13-animal-svg-illustrations.md) |

## 验证结果

- **17/17** mapping-engine 测试通过
- **TypeScript** 类型检查通过（0 errors）
- **开发服务器** 正常启动（Next.js 16.2.7 + Turbopack）
- **页面路由** 全部就位：
  - `/` — 首页（森林之门 + 粒子动画）
  - `/meditate` — 冥想页（呼吸动画 + 引导文字）
  - `/assessment` — 4 场景评估流程
  - `/result` — 等待动画 → 服务卡 → 完整报告
  - `/profile` — 历史记录（localStorage）+ 设置

## 变更记录

- **middleware → proxy 迁移**：Next.js 16 废弃 middleware 文件惯例，重命名为 proxy.ts
- **Prisma v7 配置**：datasource url 移至 prisma.config.ts，用 env() helper
- **PrismaClient 懒加载**：创建 lib/prisma.ts Proxy 单例，避免 Vercel 构建时初始化 crash
- **构建修复**：package.json build 脚本加入 prisma generate，添加 postinstall 钩子
- **结果页修复**：等待动画不再定时切页，改为报告数据就绪后展示；OpenAI 请求加 8s 超时
- **分享卡片下载**：html-to-image 生成 PNG，Chrome/Edge 支持"另存为"选路径；card 和 report 阶段均可下载
- **安全加固**：支付 mock → 限时免费、RLS 三表 + uuid、速率限制、输入校验、Prompt 注入防护
- **动物 SVG 插画**：26 种扁平矢量动物 SVG，共享面部组件（EyesRound/EyesAlmond/NoseSmall/NoseSnout），AnimalIcon 统一渲染组件，替换 ServiceCard/ShareCardImage/HistoryList 的 emoji
- **森林白噪音（Web Audio API）**：程序化合成棕噪声（风/树叶）、bandpass 溪流（LFO 调制）、随机鸟鸣（双振荡器和声），零外部文件依赖；自动处理浏览器 autoplay 策略
- **Google OAuth 登录**：AuthModal 新增"Google 登录"按钮（白底 + Google 彩色 logo），调用 `supabase.auth.signInWithOAuth`，回调到 /profile；需外部配置 Google Cloud Console OAuth 客户端 ID 和 Supabase Provider

## Bug 修复记录

- **默认模板冲突**：删除 `app/page.tsx`（create-next-app 默认模板），避免与 `app/(public)/page.tsx` 路由冲突
- **React setState 错误**：`AssessmentFlow` 中 `restoreFromStorage()` 从渲染期间调用改为 `useEffect` 中调用
- **雷达图标签裁切**：SVG viewBox 太小导致"角色"标签左半部分被裁切，扩展 viewBox 从 `0 0 280 280` 到 `-30 -10 340 320`

## MVP 核心决策

- 无需登录即可测评，注册保存报告
- 限时免费（划线价 ¥9.99），无需支付直接看完整报告
- 文字输入（无语音），引导语用文字展示
- 6 种报告模板（Euclidean distance 匹配）
- 动物插画：emoji 映射表
- 白噪音全局循环播放
- 个人中心 localStorage（最多 5 条）

## 技术栈

Next.js 16 (App Router + Turbopack) + TypeScript + Tailwind CSS v4 + shadcn/ui v4 + Framer Motion + Vitest + Prisma v7

## 下一步

### 后续待办

按推荐优先级排序：

| # | 项目 | 说明 | 优先级 |
|---|---|---|---|
| 1 | 语音输入 | Web Speech API 浏览器原生，手机上体验好 | 🎤 中 |
| 2 | 语音引导 TTS | 冥想和场景引导语音，比纯文字更有沉浸感 | 🎤 低 |
| 3 | 分享裂变 | 邀请好友注册免费解锁 | 🔗 低 |
| 4 | B 端管理后台 | 测评码管理、团队看板、岗位模型、报告导出 | 🏢 远期 |

### 🔐 Google OAuth 登录实施指南

**状态：** 待执行（需先完成外部配置）

#### 第一部分：外部配置（需手动操作）

**1. Google Cloud Console 创建凭据**

1. 打开 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建或选择项目 → 左侧菜单 "OAuth 同意屏幕"
   - User Type 选 **External**（外部用户可用）
   - 填写应用名 `Forest Journey`、开发者邮箱
   - 范围无需添加（只请求邮箱和姓名）
   - 添加测试用户（你自己的 Gmail）
   - 发布状态设为"测试中"即可
3. 左侧菜单 "凭据" → "创建凭据" → **OAuth 客户端 ID**
   - 应用类型：**Web 应用**
   - 名称：`Forest Journey`
   - 已获授权的 JavaScript 来源：`https://forest-journey.vercel.app`（部署后加，开发时加 `http://localhost:3000`）
   - 已获授权的重定向 URI：`https://<你的项目ID>.supabase.co/auth/v1/callback`
     - 替换 `<你的项目ID>` 为 Supabase 项目 URL 中的 ID
   - 创建后会弹出 Client ID 和 Client Secret，**记下来**

**2. Supabase Dashboard 配置**

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard) → 选择项目
2. 左侧菜单 Authentication → **Providers**
3. 找到 **Google** → 点击展开
4. 开启开关，填入：
   - Client ID（从 Google Cloud Console 获取）
   - Client Secret（从 Google Cloud Console 获取）
5. 保存

#### 第二部分：代码改动（外部配置完成后执行）

改动仅涉及 `components/auth/AuthModal.tsx` 一个文件：

1. 在表单下方添加分隔线 `或`
2. 添加 Google 登录按钮，调用：
   ```ts
   const supabase = createClient();
   await supabase.auth.signInWithOAuth({
     provider: "google",
     options: {
       redirectTo: `${window.location.origin}/profile`,
     },
   });
   ```
3. Supabase 自动处理完整的 OAuth 2.0 流程（跳转 Google → 授权 → 回调 → 创建 session）

> 核心逻辑只有 3 行，OAuth 流程由 Supabase + Google 自动完成，无需后端改动。

### 🔒 安全审查待办（2026-06-12 审查）

**🔴 高危：**
- [x] **支付 mock 移除**：`isPaid` 改为始终 `true`，ServiceCard 显示划线价 + "限时免费"（2026-06-12 已修复）
- [x] **数据库 RLS 启用**：assessments/answers/reports 三表已启用 RLS，`user_id` 列已改为 uuid 类型（2026-06-12 已修复）

**🟡 中危：**
- [x] **同步接口输入校验**：reports 数组长度 ≤10，字段类型/长度校验（2026-06-12 已修复）
- [x] **速率限制**：`/api/report` 每 IP 每分钟 10 次，`lib/rate-limit.ts` 内存实现（2026-06-12 已修复）
- [x] **Prompt 注入防护**：用户文本用 `JSON.stringify()` 包裹，输入限长 2000 字符（2026-06-12 已修复）
- [x] **密码强度**：`minLength` 6 → 8（2026-06-12 已修复）
- [x] **请求体大小限制**：`/api/report` 8KB，`/api/reports/sync` 64KB（2026-06-12 已修复）

**🟢 低危：**
- [ ] 邮箱验证（Supabase Dashboard 启用）
- [ ] 密码重置流程（`resetPasswordForEmail` API + UI 入口）
- [ ] localStorage 数据加密（可选，当前风险可接受）

---

> 此文档随开发进度持续更新。每完成一个开发任务即更新对应状态。
