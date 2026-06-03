# Forest Journey MVP — 设计文档

> 2026-06-02 | 最小闭环：C端首页 → 冥想 → 测评 → 报告 → 个人中心

## 一、项目概述

Forest Journey（森林之旅）是一个心理投射测评 Web 系统。用户通过沉浸式4个场景问答，系统基于映射规则生成服务意识测评报告。MVP 聚焦 C端完整体验闭环，B端暂不涉及。

## 二、技术栈

| 层级 | 选型 |
|---|---|
| 框架 | Next.js（App Router） |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| UI 组件 | shadcn/ui |
| 动画 | Framer Motion |
| 数据库 | Supabase PostgreSQL（注册用户时才用） |
| ORM | Prisma |
| 认证 | NextAuth.js（仅注册/登录环节） |
| NLP | OpenAI API（降级：关键词正则） |
| 部署 | Vercel |

## 三、MVP 范围决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 用户认证 | 无需登录即可测评，注册保存报告 | 降低入口摩擦 |
| 支付 | Mock — 点击解锁直接看到报告 | 先验证产品体验 |
| 语音输入/TTS | 文字输入，引导语用文字展示 | 降低交互复杂度 |
| 报告模板 | 5–8 种核心模板 | 链路跑通后内容可扩充 |
| 动物插画 | 预设 SVG 库 + emoji 兜底 | 零 API 依赖，风格统一 |
| 冥想引导 | 保留呼吸动画 + 文字引导 | 仪式感对体验重要 |
| 白噪音 | 全局 `<audio>` 循环播放 | 实现成本极低 |
| 卡片分享 | 仅展示，不做下载/裂变 | MVP 先验证卡片设计 |
| 个人中心 | localStorage 存最近 5 次报告 | 可回看，换设备丢失可接受 |

## 四、路由结构

```
app/
├── layout.tsx                       # 白噪音 <audio> + 全局 Context
├── (public)/
│   ├── page.tsx                     # 首页（森林之门）
│   ├── meditate/
│   │   └── page.tsx                 # 冥想引导页
│   ├── assessment/
│   │   └── page.tsx                 # 4场景测评（页内切换）
│   ├── result/
│   │   └── page.tsx                 # 结果页（卡片 + 报告）
│   └── profile/
│       └── page.tsx                 # 个人中心（localStorage）
├── api/
│   └── report/
│       └── route.ts                 # NLP 实体抽取 + 报告生成
├── components/                      # 见组件拆分
├── lib/
│   ├── mapping-engine.ts            # 核心映射算法（客户端）
│   ├── templates.ts                 # 报告模板库（5-8种）
│   └── animals.ts                   # 动物→插画映射
└── public/
    └── audio/
        └── forest-ambient.mp3       # 白噪音文件
```

## 五、页面流程

```
首页 → 冥想引导 → 场景一(动物1) → 场景二(桌子) → 场景三(墙) → 场景四(动物2) → 等待动画 → 免费卡片 → mock支付 → 完整报告 → 个人中心
```

- 所有页面切换使用 Framer Motion 淡入淡出
- 测评4场景在 `assessment/page.tsx` 内用 state machine 切换，不跨路由
- 白噪音在 `layout.tsx` 层，全局不中断
- 测评中途离开，答案存 localStorage 的 `fj_current_assessment`

## 六、4个测评场景交互

### 场景一：遇见第一个动物（映射自我认知）
- 引导文字 → 主问题"这是什么动物？"
- 输入框 + 辅助标签栏（有灵性的🦊 / 温厚的🐻 / 警觉的🦌），点击填入
- 追问1："它正在做什么？眼神是怎样的？"
- 追问2（可选）："它看到你了吗？" 按 Enter 跳过
- "没看清/跳过" 按钮

### 场景二：小屋与桌子（映射规则与团队）
- 桌布选择：崭新的有花纹 / 旧的有使用痕迹 / 其他（自定义输入）
- 凳子数量：+/- 按钮（0–8），椅子出现/消失微动画
- 确认按钮"这样就好"

### 场景三：墙（映射困难应对）
- 双滑块：高度（及腰 → 高耸）+ 材质（柔软 → 坚硬）
- 中央墙面根据滑块值实时 CSS 变化（Framer Motion）
- 确认按钮"这就是那堵墙"
- 翻越方式：轻松翻越 / 费劲爬 / 绕路 / 找门 / 自定义

### 场景四：第二个动物（映射客户认知）
- 交互同场景一
- 追加问题"你的第一感觉？"：温暖喜悦 / 想去呵护 / 平等尊重 / 有些紧张 / 好奇观察（emoji 展示）

## 七、核心映射引擎

### 四维定义（0–100 分）
- **共情 (Empathy)** — 服务意识、共情能力
- **规则 (Rule)** — 规则感、边界意识
- **韧性 (Resilience)** — 困难应对方式
- **角色 (Role)** — 主导 vs 服务倾向

### 映射规则（13 条）

| 输入 | 维度影响 |
|---|---|
| 动物1：温顺食草类（兔、鹿、羊） | Role+15, Empathy+10 |
| 动物1：猛兽独行类（虎、豹） | Role-15, Empathy-10 |
| 动物1：群居类（犬、马） | Empathy+15, Role+5 |
| 桌布：新 | Rule+20 |
| 桌布：旧 | Rule-15 |
| 凳子数 0–1 | Role-10 |
| 凳子数 ≥4 | Role+15 |
| 墙高值 ≥70 | Resilience+20 |
| 墙材质 ≥70 | Resilience+15 |
| 翻越方式：轻松/绕路 | Resilience+10（适中介于翻越和绕路之间） |
| 动物2：弱小需呵护 | Empathy+20 |
| 动物2：与动物1同类 | Empathy+10 |
| 动物2：有威胁性 | Empathy-15 |

### NLP 实体抽取（`/api/report`）
- 输入：动物1、动物2的文字描述
- 调用 OpenAI API 提取：动物名称、类别（温顺/猛兽/群居）、情感倾向
- 降级方案：关键词正则匹配
- 失败不阻塞测评，降级到纯规则匹配

### 报告匹配
- 四维得分归一化到 0–100
- 在 5–8 种模板中按欧氏距离匹配最近模板
- 嵌入用户个性化文本片段

## 八、结果页

### 阶段一：等待动画（≤5秒）
- 森林背景中鹿跳跃 + 路径花开（CSS/Lottie）
- 文案"你的心灵画卷正在展开……"

### 阶段二：免费服务者卡片
- 根据场景一动物匹配预设插画（SVG 库 + emoji 兜底）
- 卡片内容：主称号（如"林间向导·灵狐型服务者"）+ 一句核心解读
- 底部按钮"查看完整心灵图谱 →"引导付费

### 阶段三：完整报告（mock 支付后，定价 ¥9.99）
- 4 个板块可滚动：
  1. 你的服务者原型（约500字深度解读 + 四维雷达图）
  2. 你的规则感与边界
  3. 你与他人的相遇（动物1与动物2关系解读）
  4. 你的心灵处方（3条定制化建议）
- 报告底部"我的团队也想探索"企业版入口（占位链接）

## 九、个人中心

- 未登录态：提示注册以永久保存
- 历史报告列表（localStorage，时间倒序，最多5条）
- 设置：白噪音开关、清除缓存、关于我们、隐私政策
- 每条报告可点击回看完整内容

## 十、状态管理

### React Context × 2
- `AssessmentContext` — 测评进度、4场景答案、当前步骤
- `AudioContext` — 白噪音开关、音量

### localStorage Keys
- `fj_reports` — 历史报告列表（JSON 数组，最多5条）
- `fj_audio_on` — 白噪音开关状态
- `fj_current_assessment` — 进行中测评（断点续答）

## 十一、数据流

```
用户输入答案
  → React state (assessment page)
  → 完成时存入 localStorage
  → 纯前端 mapping-engine.ts 计算四维分
  → POST /api/report（OpenAI NLP 抽取，降级为正则）
  → 四维分 + NLP结果 → 匹配模板
  → 前端渲染卡片 & 完整报告
  → 存入 localStorage (fj_reports)
  → mock支付解锁完整报告
```

## 十二、错误处理

| 场景 | 处理 |
|---|---|
| OpenAI API 不可用 | 降级为关键词正则匹配，不阻塞测评 |
| 用户中途离开测评 | localStorage 保存进度，回来可续答 |
| 网络断开 | 映射引擎纯前端运行，API 失败用降级方案 |
| localStorage 满 | 清理最旧报告（保留最近5条），提示注册 |
| 音频加载失败 | 静默降级，白噪音关闭，不弹错误 |
| 空输入/跳过 | 场景一/四允许跳过；场景二/三要求必答（按钮 disabled） |

## 十三、组件拆分

```
components/
├── layout/
│   ├── ForestLayout.tsx      # 白噪音 <audio> + 页面过渡动画
│   └── BottomNav.tsx         # 底部导航（探索/发现占位/我的）
├── home/
│   ├── ForestGate.tsx        # 发光森林之门 SVG/CSS 动画
│   └── ParticleField.tsx     # 萤火虫/极光粒子动画
├── meditate/
│   └── BreathGlow.tsx        # 呼吸光晕 CSS scale 循环动画
├── assessment/
│   ├── AssessmentFlow.tsx    # 4场景 state machine + 进度条
│   ├── SceneAnimal.tsx       # 场景一/四复用（动物输入）
│   ├── SceneTable.tsx        # 场景二（桌布 + 凳子计数）
│   └── SceneWall.tsx         # 场景三（双滑块 + 墙面预览）
├── result/
│   ├── WaitingAnimation.tsx  # 鹿跳跃加载动画
│   ├── ServiceCard.tsx       # 免费服务者卡片
│   └── FullReport.tsx        # 完整报告长页面（4板块）
├── profile/
│   └── HistoryList.tsx       # localStorage 历史报告列表
└── shared/
    ├── AudioToggle.tsx       # 白噪音开关按钮
    └── FadeTransition.tsx    # Framer Motion AnimatePresence 封装
```

## 十四、测试策略

- **映射引擎单元测试** — 固定输入 → 预期四维分输出，覆盖全部 13 条规则
- **关键组件渲染测试** — 4 场景组件可渲染、空状态正常、跳过逻辑正确
- **E2E 冒烟测试** — 首页 → 冥想 → 4场景 → 结果 → 个人中心 完整路径
- 暂不做：视觉回归、性能压测、可访问性审计

## 十五、MVP 成功标准

- 用户可完成完整测评流程（4场景）并看到卡片 + 完整报告
- 映射引擎输出合理四维分（人工抽样验证 10 组答案）
- 桌面端 + 移动端适配
- 动画流畅（60fps），无肉眼卡顿
- 首屏加载 < 3s
