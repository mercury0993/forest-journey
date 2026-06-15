# AI 测评引擎 v2 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将测评引擎从"OpenAI 简单分类 + 6 种硬编码模板"升级为"DeepSeek 深度心理分析 + 81 种原型混合模式"

**Architecture:** API 端调用 DeepSeek 完成 NLP 分析 + 四维校准 + 三段个性化报告生成；服务端规则引擎做初评 + 分歧熔断 + 81 原型匹配 + archetype 段落合成。客户端仅发送答案、接收完整报告。

**Tech Stack:** DeepSeek API (OpenAI 兼容格式), TypeScript, Next.js 16 App Router

---

### Task 1: 扩展类型定义

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: 新增类型定义**

在 `lib/types.ts` 末尾追加以下类型：

```typescript
// === v2 新增类型 ===

/** 四维档位 (0=低, 1=中, 2=高) */
export type Tier = 0 | 1 | 2;

/** 四维档位组合 */
export interface DimensionTiers {
  empathy: Tier;
  rule: Tier;
  resilience: Tier;
  role: Tier;
}

/** DeepSeek 返回的 NLP 深度分析 */
export interface AINLPResult {
  animal1Name: string;
  animal1Category: AnimalCategory;
  animal2Name: string;
  animal2Category: AnimalCategory;
  animal1Sentiment: "positive" | "neutral" | "negative";
  animal2Sentiment: "positive" | "neutral" | "negative";
  animal1Traits: string[];       // 3个中文特征词
  animal2Traits: string[];       // 3个中文特征词
  relationshipDynamic: string;   // 关系动态描述
}

/** DeepSeek 返回的完整分析结果 */
export interface AIAnalysisResult {
  nlp: AINLPResult;
  calibrationScores: DimensionScores;
  rules: string;           // ~150字
  encounter: string;       // ~150字
  prescription: string;    // ~150字
  personalizedNote: string; // 1-2句，≤80字
}

/** 81种原型定义 */
export interface ArchetypeDefinition {
  gridPosition: string;
  tiers: DimensionTiers;
  center: DimensionScores;
  roleTitle: string;
  cardTitle: string;
  cardInterpretation: string;
  aiPromptGuide: string;
  defaultReport: {
    archetype: string;
    rules: string;
    encounter: string;
    prescription: string;
  };
}
```

- [ ] **Step 2: TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 0 errors (新增类型为纯导出，不影响现有代码)

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add v2 types for AI assessment engine (ArchetypeDefinition, AIAnalysisResult, DimensionTiers)"
```

---

### Task 2: 81 种原型模板骨架

**Files:**
- Modify: `lib/templates.ts` (完全重写)

- [ ] **Step 1: 定义 81 原型元数据表 + 生成函数**

用以下完整内容替换 `lib/templates.ts`：

```typescript
import { ArchetypeDefinition, DimensionScores, DimensionTiers, Tier } from "./types";

// ============================================================
// 动物映射：role × resilience × empathy → 动物
// role: 0=专家顾问, 1=协作平衡, 2=服务者
// resilience: 0=低, 1=中, 2=高
// empathy: 0=低, 1=中, 2=高
// ============================================================

const ANIMALS: Record<string, string> = {
  // role=2 (服务者型)
  "2,2,2": "白鹿",   "2,2,1": "牧羊犬", "2,2,0": "守山犬",
  "2,1,2": "灵狐",   "2,1,1": "信鸽",   "2,1,0": "耕牛",
  "2,0,2": "幼鹿",   "2,0,1": "绵羊",   "2,0,0": "蜜蜂",
  // role=1 (协作平衡型)
  "1,2,2": "驯鹿",   "1,2,1": "苍鹰",   "1,2,0": "雪豹",
  "1,1,2": "海豚",   "1,1,1": "马",     "1,1,0": "猫头鹰",
  "1,0,2": "兔子",   "1,0,1": "松鼠",   "1,0,0": "刺猬",
  // role=0 (专家顾问型)
  "0,2,2": "大象",   "0,2,1": "狼",     "0,2,0": "虎",
  "0,1,2": "熊猫",   "0,1,1": "豹",     "0,1,0": "蛇",
  "0,0,2": "考拉",   "0,0,1": "乌龟",   "0,0,0": "变色龙",
};

// ============================================================
// 角色形容词前缀：rule 档位决定基调
// ============================================================

const RULE_PREFIXES: Record<number, string[]> = {
  0: ["洒脱", "自由", "随性", "不拘", "自然", "写意", "灵动", "从容", "通透"],
  1: ["温和", "稳健", "圆融", "周到", "持重", "沉着", "务实", "平衡", "融通"],
  2: ["严谨", "笃定", "精准", "方正", "坚定", "周密", "规矩", "缜密", "端方"],
};

// ============================================================
// 维度标签
// ============================================================

const EMPATHY_LABEL  = ["理性独立", "收放自如", "深度共情"];
const RULE_LABEL     = ["灵活变通", "弹性务实", "秩序井然"];
const RESIL_LABEL    = ["柔韧生长", "稳中求进", "坚如磐石"];
const ROLE_LABEL     = ["专家顾问", "协作平衡", "服务者"];

function tierLabel(dim: string, t: Tier): string {
  const map: Record<string, string[]> = {
    empathy: EMPATHY_LABEL, rule: RULE_LABEL, resilience: RESIL_LABEL, role: ROLE_LABEL,
  };
  return map[dim]?.[t] ?? "均衡";
}

function gridPosition(tiers: DimensionTiers): string {
  return `${tierLevel(tiers.empathy)}共情·${tierLevel(tiers.rule)}秩序·${tierLevel(tiers.resilience)}应变·${tierLevel(tiers.role)}角色`;
}

function tierLevel(t: Tier): string {
  return ["低", "中", "高"][t];
}

function centerScore(t: Tier): number {
  return [17, 50, 83][t];
}

// ============================================================
// 索引：按 empathy/rule/resilience/role 的 tier 值定位
// 每维 0/1/2，所以 index = e*27 + r*9 + s*3 + o
// ============================================================

function archetypeIndex(tiers: DimensionTiers): number {
  return tiers.empathy * 27 + tiers.rule * 9 + tiers.resilience * 3 + tiers.role;
}

function tiersFromIndex(idx: number): DimensionTiers {
  const empathy  = Math.floor(idx / 27) as Tier;
  const rule     = Math.floor((idx % 27) / 9) as Tier;
  const resilience = Math.floor((idx % 9) / 3) as Tier;
  const role     = (idx % 3) as Tier;
  return { empathy, rule, resilience, role };
}

// ============================================================
// 一句话解读生成
// ============================================================

function buildCardInterpretation(tiers: DimensionTiers, animal: string): string {
  const eLabel = EMPATHY_LABEL[tiers.empathy];
  const rLabel = RULE_LABEL[tiers.rule];
  const sLabel = RESIL_LABEL[tiers.resilience];
  const oLabel = ROLE_LABEL[tiers.role];
  return `你以${eLabel}的内心感知世界，在${rLabel}的秩序中前行，以${sLabel}的姿态面对挑战，天然倾向于${oLabel}的角色。像森林中的${animal}，你有自己独特的存在方式。`;
}

// ============================================================
// AI Prompt 方向指引生成
// ============================================================

function buildAiPromptGuide(tiers: DimensionTiers, animal: string): string {
  const e = EMPATHY_LABEL[tiers.empathy];
  const r = RULE_LABEL[tiers.rule];
  const s = RESIL_LABEL[tiers.resilience];
  const o = ROLE_LABEL[tiers.role];

  const empathyTips: Record<number, string> = {
    0: "共情力偏低，倾向于理性分析而非情感共鸣。解读时强调逻辑和效率在服务中的价值，同时温和建议情感觉察的练习。",
    1: "共情力适中，有选择地共情。解读时肯定其'能收能放'的平衡能力，同时探讨哪些场景适合打开共情开关。",
    2: "高共情力是ta的核心天赋。解读时赞美这份天赋，但务必在处方中提醒情绪边界和自我保护。",
  };
  const ruleTips: Record<number, string> = {
    0: "低秩序感，灵活变通。解读时强调创造力和应变能力的价值，但处方中需建议建立个人的'最小规则框架'。",
    1: "中等秩序感，弹性务实。解读时肯定其在规则与灵活之间的平衡智慧。",
    2: "高秩序感，重视流程。解读时强调标准化服务的力量，但处方中需提醒'规则之外的温暖'。",
  };

  return `该用户属于${e}+${r}+${s}+${o}的${animal}原型。
    ${empathyTips[tiers.empathy]}
    ${ruleTips[tiers.rule]}
    应变力${s}，角色定位${o}。
    报告应引用用户关于动物和墙的具体描述，让解读有据可依。`;
}

// ============================================================
// 默认报告生成（降级用）
// ============================================================

function buildDefaultArchetype(tiers: DimensionTiers, cardTitle: string, animal: string): string {
  const e = EMPATHY_LABEL[tiers.empathy];
  const r = RULE_LABEL[tiers.rule];
  const s = RESIL_LABEL[tiers.resilience];
  const o = ROLE_LABEL[tiers.role];

  return `你属于"${cardTitle}"原型——一位以${e}为底色、以${r}为框架、以${o}为方向的${animal}型服务者。

在共情力维度上，你展现出${e}的特质。这使你在服务场景中，能够以自己最自然的方式感知他人的需要——不过度卷入，也不冷漠疏离。

在秩序感维度上，你倾向于${r}。这决定了你如何理解和运用规则：不是教条式地遵守，也不是随意地打破，而是在每一个具体情境中找到属于自己的那条线。

你的应变力特质是${s}。面对困难时，这种姿态让你能够以自己的节奏穿越阻碍。像${animal}在森林中一样，你不需要走所有人都在走的路。

作为一位${o}倾向的服务者，你的价值不在于模仿任何人的风格，而在于忠于自己与生俱来的方式——那正是你最不可替代的地方。`;
}

function buildDefaultRules(tiers: DimensionTiers): string {
  const r = RULE_LABEL[tiers.rule];
  const stoolInsights: Record<number, string> = {
    0: "你偏好的少数凳子暗示着你对深度大于广度的认同——与其在一大群人中周旋，你更愿意和少数人进行有质量的对话。",
    1: "你适中的凳子数量反映出你对社交空间的平衡感——既能享受独处的专注，也能融入团队的协作。",
    2: "你偏好的充足凳子数量映射出你对团队协作的天然倾向——在群体中你能找到自己的能量和角色。",
  };
  return `你对规则的态度是${r}的。你的桌布选择映射了你对规则和边界的直觉——对你来说，规则既是约束也是保护，关键在于它服务于谁。

${stoolInsights[tiers.role]}

这种边界感让你在服务中既能保持自己的完整性，又能真诚地与他人相遇。最好的边界不是墙，而是知道自己站在哪里的那种确定感。`;
}

function buildDefaultEncounter(tiers: DimensionTiers): string {
  const e = EMPATHY_LABEL[tiers.empathy];
  const rl = ROLE_LABEL[tiers.role];

  return `你与两只动物的相遇，揭示了你对自我和他人的关系模式。第一只动物映射你的自我认知——它是你在森林之镜中看到的自己。第二只动物映射你面对服务对象时的姿态——你倾向于以一种${e}的方式去接触对方。

两只动物之间的关系动态，反映了你在服务关系中如何在'自我'和'他人'之间找到位置。这种模式不是固定不变的——它随着你的经历和觉察而演化。

对你而言，重要的不是两只动物是不是同一物种，而是你是否意识到自己与每一个'他者'相遇时，你的第一反应是什么。那个反应里藏着你的天赋，也藏着你的成长边缘。`;
}

function buildDefaultPrescription(tiers: DimensionTiers): string {
  const e = EMPATHY_LABEL[tiers.empathy];
  const s = RESIL_LABEL[tiers.resilience];
  const empathyRx: Record<number, string> = {
    0: "每天花2分钟注意一次他人的情绪状态，不评判、不分析，只是注意。这是你的'共情肌肉'训练。",
    1: "在每次服务交互后问自己：'这次我收放得当吗？'不需要立刻改变什么，保持觉察就是进步。",
    2: "建立你的'情绪清空'仪式：每天留出10分钟，在安静中让一天积累的感受自然流过。你是敏感的接收器，也需要定期归零。",
  };
  const resilienceRx: Record<number, string> = {
    0: "面对困难时，先对自己说'我可以先试一小步'。韧性不是天生的，是一次次小步积累出来的信心。",
    1: "记录你的'越小胜利'：每次解决一个难题后，花1分钟写下你当时的思路。一个月后回看，你会发现自己的成长轨迹。",
    2: "你的韧性是团队的压舱石——但压舱石也需要浮出水面呼吸。确保每周有一次让你完全放松的身体活动。",
  };
  return `1. ${empathyRx[tiers.empathy]}
2. ${resilienceRx[tiers.resilience]}
3. 找到至少一位你欣赏的服务者——可以是你生活中的人，也可以是你读过的一个故事——观察他们如何在自己的方式里做到从容。模仿不是目的，看清自己才是。`;
}

// ============================================================
// 构建全部 81 个原型
// ============================================================

function buildAllArchetypes(): ArchetypeDefinition[] {
  const archetypes: ArchetypeDefinition[] = [];

  for (let idx = 0; idx < 81; idx++) {
    const tiers = tiersFromIndex(idx);
    const { empathy: e, rule: r, resilience: s, role: o } = tiers;

    const animal = ANIMALS[`${o},${s},${e}`]!;
    const prefixList = RULE_PREFIXES[r]!;
    const prefix = prefixList[idx % prefixList.length]!;
    const cardTitle = prefix + animal;
    const roleTitle = `${cardTitle}·${animal}型服务者`;

    const gp = gridPosition(tiers);
    const center: DimensionScores = {
      empathy: centerScore(e),
      rule: centerScore(r),
      resilience: centerScore(s),
      role: centerScore(o),
    };

    archetypes.push({
      gridPosition: gp,
      tiers,
      center,
      roleTitle,
      cardTitle,
      cardInterpretation: buildCardInterpretation(tiers, animal),
      aiPromptGuide: buildAiPromptGuide(tiers, animal),
      defaultReport: {
        archetype: buildDefaultArchetype(tiers, cardTitle, animal),
        rules: buildDefaultRules(tiers),
        encounter: buildDefaultEncounter(tiers),
        prescription: buildDefaultPrescription(tiers),
      },
    });
  }

  return archetypes;
}

const ALL_ARCHETYPES: ArchetypeDefinition[] = buildAllArchetypes();

// ============================================================
// 导出函数
// ============================================================

/** 按四维分数匹配最近原型 */
export function findArchetype(scores: DimensionScores): ArchetypeDefinition {
  let best = ALL_ARCHETYPES[0]!;
  let bestDist = Infinity;

  for (const arch of ALL_ARCHETYPES) {
    const d = Math.sqrt(
      Math.pow(scores.empathy - arch.center.empathy, 2) +
        Math.pow(scores.rule - arch.center.rule, 2) +
        Math.pow(scores.resilience - arch.center.resilience, 2) +
        Math.pow(scores.role - arch.center.role, 2)
    );
    if (d < bestDist) {
      bestDist = d;
      best = arch;
    }
  }

  return best;
}

/** 按索引获取原型 */
export function getArchetypeByIndex(index: number): ArchetypeDefinition {
  return ALL_ARCHETYPES[index % 81]!;
}

/** 按四维档位获取原型 */
export function getArchetypeByTiers(tiers: DimensionTiers): ArchetypeDefinition {
  return ALL_ARCHETYPES[archetypeIndex(tiers)]!;
}

/** 四维分数 → 三档化 */
export function scoresToTiers(scores: DimensionScores): DimensionTiers {
  const toTier = (v: number): Tier => {
    if (v <= 33) return 0;
    if (v <= 66) return 1;
    return 2;
  };
  return {
    empathy: toTier(scores.empathy),
    rule: toTier(scores.rule),
    resilience: toTier(scores.resilience),
    role: toTier(scores.role),
  };
}

/** 获取原型总数 */
export function getArchetypeCount(): number {
  return ALL_ARCHETYPES.length;
}

/** 兼容旧版接口：保留 ReportTemplate 类型别名 */
export type { ArchetypeDefinition as ReportTemplate };
```

- [ ] **Step 2: TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 3: 验证 81 原型完整性**

在项目根目录临时创建验证脚本，运行后删除：

```bash
node -e "
const { findArchetype, getArchetypeCount, getArchetypeByTiers } = require('./lib/templates.ts');
" 2>/dev/null || npx tsx -e "
import { findArchetype, getArchetypeCount, getArchetypeByIndex } from './lib/templates';

console.assert(getArchetypeCount() === 81, 'Expected 81 archetypes');

// 验证不同分数匹配到不同原型
const a1 = findArchetype({ empathy: 20, rule: 20, resilience: 20, role: 20 });
const a2 = findArchetype({ empathy: 80, rule: 80, resilience: 80, role: 80 });
console.assert(a1.roleTitle !== a2.roleTitle, 'Different scores should match different archetypes');

// 验证 81 个原型称号全部唯一
const titles = new Set();
for (let i = 0; i < 81; i++) {
  const arch = getArchetypeByIndex(i);
  console.assert(!titles.has(arch.roleTitle), 'Duplicate title: ' + arch.roleTitle);
  titles.add(arch.roleTitle);
  console.assert(arch.defaultReport.archetype.length > 50, 'defaultReport too short for ' + arch.roleTitle);
  console.assert(arch.defaultReport.rules.length > 50, 'defaultReport rules too short');
  console.assert(arch.defaultReport.encounter.length > 50, 'defaultReport encounter too short');
  console.assert(arch.defaultReport.prescription.length > 50, 'defaultReport prescription too short');
}

console.log('All 81 archetypes OK, titles:', titles.size);
"
```

Expected: `All 81 archetypes OK, titles: 81`

- [ ] **Step 4: Commit**

```bash
git add lib/templates.ts
git commit -m "feat: 81 archetype templates with defaultReport fallback system"
```

---

### Task 3: 映射引擎升级

**Files:**
- Modify: `lib/mapping-engine.ts`

- [ ] **Step 1: 更新文件顶部导入 + 替换 matchTemplate + 新增校准函数**

`lib/mapping-engine.ts` 当前顶部为：

```typescript
import { AssessmentAnswers, DimensionScores, NLPResult } from "./types";
import { getTemplateByIndex } from "./templates";
```

将顶部导入替换为：

```typescript
import { AssessmentAnswers, DimensionScores, NLPResult, DimensionTiers } from "./types";
import { findArchetype, scoresToTiers } from "./templates";
```

然后将现有 `matchTemplate` 函数（约第 74-106 行）替换为使用新模板系统的版本：

```typescript
export function matchTemplate(scores: DimensionScores): {
  templateIndex: number;
  roleTitle: string;
  cardTitle: string;
  cardInterpretation: string;
  fullReport: { archetype: string; rules: string; encounter: string; prescription: string };
} {
  const arch = findArchetype(scores);
  const idx = arch.tiers.empathy * 27 + arch.tiers.rule * 9 + arch.tiers.resilience * 3 + arch.tiers.role;
  return {
    templateIndex: idx,
    roleTitle: arch.roleTitle,
    cardTitle: arch.cardTitle,
    cardInterpretation: arch.cardInterpretation,
    fullReport: arch.defaultReport,
  };
}
```

最后在文件末尾追加校准 + 熔断函数：

```typescript

/** 校准权重，可通过环境变量 AI_CALIBRATION_WEIGHT 配置（默认 0.4） */
function getCalibrationWeight(): number {
  const env = process.env.AI_CALIBRATION_WEIGHT;
  if (env) {
    const parsed = parseFloat(env);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  }
  return 0.4;
}

/** 分歧熔断阈值：任一维度差值超过此值则废弃 AI 校准 */
const DIVERGENCE_THRESHOLD = 40;

export interface CalibrationResult {
  finalScores: DimensionScores;
  calibrationTrusted: boolean;
  tiers: DimensionTiers;
  archetypeIndex: number;
}

/**
 * 对规则引擎初评分进行 AI 校准
 * 返回最终分数、校准是否可信、档位、原型索引
 */
export function applyAICalibration(
  ruleScores: DimensionScores,
  aiCalibration: DimensionScores | null
): CalibrationResult {
  const weight = getCalibrationWeight();

  // 无 AI 校准 → 纯规则
  if (!aiCalibration) {
    const tiers = scoresToTiers(ruleScores);
    const arch = findArchetype(ruleScores);
    const idx = archIndexFromTiers(tiers);
    return { finalScores: ruleScores, calibrationTrusted: false, tiers, archetypeIndex: idx };
  }

  // 分歧熔断检查
  const dims: (keyof DimensionScores)[] = ["empathy", "rule", "resilience", "role"];
  for (const dim of dims) {
    if (Math.abs(ruleScores[dim] - aiCalibration[dim]) > DIVERGENCE_THRESHOLD) {
      console.warn(`[calibration] divergence fuse triggered on ${dim}: rule=${ruleScores[dim]} ai=${aiCalibration[dim]}`);
      const tiers = scoresToTiers(ruleScores);
      const idx = archIndexFromTiers(tiers);
      return { finalScores: ruleScores, calibrationTrusted: false, tiers, archetypeIndex: idx };
    }
  }

  // 加权合并
  const finalScores: DimensionScores = {
    empathy: Math.round(ruleScores.empathy * (1 - weight) + aiCalibration.empathy * weight),
    rule: Math.round(ruleScores.rule * (1 - weight) + aiCalibration.rule * weight),
    resilience: Math.round(ruleScores.resilience * (1 - weight) + aiCalibration.resilience * weight),
    role: Math.round(ruleScores.role * (1 - weight) + aiCalibration.role * weight),
  };

  const tiers = scoresToTiers(finalScores);
  const archetype = findArchetype(finalScores);
  const idx = archIndexFromTiers(tiers);

  return { finalScores, calibrationTrusted: true, tiers, archetypeIndex: idx };
}

function archIndexFromTiers(tiers: DimensionTiers): number {
  return tiers.empathy * 27 + tiers.rule * 9 + tiers.resilience * 3 + tiers.role;
}
```

- [ ] **Step 2: TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 0 errors（导入已更新，matchTemplate 已替换为基于 findArchetype 的版本）

- [ ] **Step 3: 验证分歧熔断逻辑**

```bash
npx tsx -e "
import { applyAICalibration } from './lib/mapping-engine';

// 正常情况：AI 校准被接受
const r1 = applyAICalibration(
  { empathy: 50, rule: 50, resilience: 50, role: 50 },
  { empathy: 60, rule: 55, resilience: 45, role: 58 }
);
console.assert(r1.calibrationTrusted === true, 'Normal calibration should be trusted');
console.assert(r1.finalScores.empathy > 50, 'AI should influence score');

// 分歧过大：熔断
const r2 = applyAICalibration(
  { empathy: 50, rule: 50, resilience: 50, role: 50 },
  { empathy: 95, rule: 50, resilience: 50, role: 50 }
);
console.assert(r2.calibrationTrusted === false, 'Divergence should trigger fuse');
console.assert(r2.finalScores.empathy === 50, 'Should fall back to rule score');

// 无 AI 校准：纯规则
const r3 = applyAICalibration(
  { empathy: 70, rule: 30, resilience: 60, role: 80 },
  null
);
console.assert(r3.calibrationTrusted === false, 'Null AI should not be trusted');
console.assert(r3.finalScores.empathy === 70, 'Should use rule scores');

console.log('Calibration tests passed');
"
```

Expected: `Calibration tests passed`

- [ ] **Step 4: Commit**

```bash
git add lib/mapping-engine.ts
git commit -m "feat: add AI calibration with divergence fuse and tier classification"
```

---

### Task 4: 增强 NLP 关键词降级库

**Files:**
- Modify: `lib/nlp-fallback.ts`

- [ ] **Step 1: 扩充关键词库 + 新增特征词提取**

用以下内容替换 `lib/nlp-fallback.ts`：

```typescript
import { AnimalCategory } from "./types";

const HERBIVORE_KEYWORDS = [
  "rabbit","bunny","deer","sheep","goat","lamb","horse","cow","elephant","giraffe",
  "squirrel","mouse","hamster","bird","sparrow","dove","butterfly","turtle","tortoise",
  "fish","koala","panda","llama","donkey","pony","fawn","猫","兔","鹿","羊","马",
  "牛","象","长颈鹿","松鼠","鼠","鸟","麻雀","鸽子","蝴蝶","龟","鱼","考拉",
  "熊猫","驴","兔子","小鹿","羔羊","羚羊","斑马","河马","犀牛","袋鼠",
];

const PREDATOR_KEYWORDS = [
  "tiger","lion","leopard","panther","wolf","bear","eagle","hawk","snake",
  "crocodile","shark","dragon","scorpion","spider","vulture","hyena","cheetah",
  "jaguar","虎","狮","豹","狼","熊","鹰","蛇","鳄","鲨","龙","蝎","蜘蛛",
  "秃鹫","鬣狗","猎豹","蟒","隼","枭",
];

const SOCIAL_KEYWORDS = [
  "dog","puppy","horse","dolphin","elephant","monkey","chimp","gorilla","parrot",
  "bee","ant","wolf","raven","crow","magpie","狗","犬","海豚","猴子","猩猩",
  "鹦鹉","蜜蜂","蚂蚁","渡鸦","乌鸦","喜鹊","企鹅","水獭","燕子",
];

const POSITIVE_KEYWORDS = [
  "gentle","warm","friendly","soft","cute","lovely","beautiful","kind","sweet",
  "calm","peaceful","happy","bright","sparkling","graceful","elegant","温柔","温暖",
  "友好","柔软","可爱","美丽","善良","甜","平静","明亮","闪光","优雅","灵动",
  "清澈","纯净","安详","治愈","轻盈","晶莹","透亮","洁白","发光",
];

const NEGATIVE_KEYWORDS = [
  "fierce","scary","angry","dark","sharp","cold","threatening","aggressive",
  "dangerous","frightening","intense","staring","silent","凶猛","可怕","愤怒",
  "黑暗","尖锐","冰冷","威胁","危险","恐惧","紧张","沉默","阴森","锐利",
  "孤傲","戒备","警惕","疏离","压抑",
];

const TRAIT_KEYWORDS: Record<string, string[]> = {
  灵动: ["灵动","机敏","活泼","跳跃","敏捷","轻盈"],
  温和: ["温和","温顺","安静","恬静","温柔","柔顺","乖"],
  威严: ["威严","庄重","沉着","霸气","王者","肃穆"],
  警觉: ["警觉","警惕","机警","戒备","审视","注视"],
  神秘: ["神秘","朦胧","若隐若现","幽深","梦幻","空灵"],
  坚韧: ["坚韧","顽强","不屈","执着","耐力"],
  独立: ["独立","孤傲","独自","单独","独自"],
  好奇: ["好奇","探索","探出头","张望","打量"],
  羞涩: ["害羞","羞涩","怯生生","躲闪","退缩"],
  快乐: ["快乐","欢快","活泼","跳跃","叽叽喳喳"],
};

function classifyAnimal(text: string): AnimalCategory {
  const lower = text.toLowerCase();
  for (const kw of HERBIVORE_KEYWORDS) {
    if (lower.includes(kw)) return "herbivore_gentle";
  }
  for (const kw of PREDATOR_KEYWORDS) {
    if (lower.includes(kw)) return "predator_solitary";
  }
  for (const kw of SOCIAL_KEYWORDS) {
    if (lower.includes(kw)) return "social";
  }
  return "unknown";
}

function classifySentiment(text: string): "positive" | "neutral" | "negative" {
  const lower = text.toLowerCase();
  let pos = 0, neg = 0;
  for (const kw of POSITIVE_KEYWORDS) {
    if (lower.includes(kw)) pos++;
  }
  for (const kw of NEGATIVE_KEYWORDS) {
    if (lower.includes(kw)) neg++;
  }
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

function extractAnimalName(text: string): string {
  const allKnown = [...HERBIVORE_KEYWORDS, ...PREDATOR_KEYWORDS, ...SOCIAL_KEYWORDS];
  const lower = text.toLowerCase();
  for (const kw of allKnown) {
    if (lower.includes(kw)) return kw;
  }
  const words = text.trim().split(/\s+/);
  return words[0] || "unknown";
}

function extractTraits(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [trait, keywords] of Object.entries(TRAIT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        found.push(trait);
        break;
      }
    }
  }
  return found.slice(0, 3);
}

export interface FallbackResult {
  animal1Name: string;
  animal1Category: AnimalCategory;
  animal2Name: string;
  animal2Category: AnimalCategory;
  animal1Sentiment: "positive" | "neutral" | "negative";
  animal2Sentiment: "positive" | "neutral" | "negative";
  animal1Traits: string[];
  animal2Traits: string[];
  relationshipDynamic: string;
}

export function nlpFallback(animal1Text: string, animal2Text: string, animal2Feeling: string): FallbackResult {
  const cat1 = classifyAnimal(animal1Text);
  const cat2 = classifyAnimal(animal2Text);
  const traits1 = extractTraits(animal1Text);
  const traits2 = extractTraits(animal2Text);

  let dynamic = "各自独立的存在";
  if (cat1 !== "unknown" && cat1 === cat2) {
    dynamic = "同类相遇，彼此映照";
  } else if (cat1 === "herbivore_gentle" && cat2 === "predator_solitary") {
    dynamic = "温柔面对力量，一种微妙的张力";
  } else if (cat1 === "predator_solitary" && cat2 === "herbivore_gentle") {
    dynamic = "守护与被守护的关系";
  }

  return {
    animal1Name: extractAnimalName(animal1Text),
    animal1Category: cat1,
    animal2Name: extractAnimalName(animal2Text),
    animal2Category: cat2,
    animal1Sentiment: classifySentiment(animal1Text),
    animal2Sentiment: classifySentiment(animal2Text + " " + animal2Feeling),
    animal1Traits: traits1.length > 0 ? traits1 : ["独特"],
    animal2Traits: traits2.length > 0 ? traits2 : ["独特"],
    relationshipDynamic: dynamic,
  };
}
```

- [ ] **Step 2: TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add lib/nlp-fallback.ts
git commit -m "feat: expand NLP fallback with Chinese keywords, trait extraction, and relationship dynamics"
```

---

### Task 5: DeepSeek API 路由重写

**Files:**
- Modify: `app/api/report/route.ts`
- Modify: `.env.example` (如存在)

- [ ] **Step 1: 检查 .env.example 是否存在并更新**

```bash
cat .env.example 2>/dev/null || echo "FILE_NOT_FOUND"
```

如果文件存在，确保包含 `DEEPSEEK_API_KEY`。如果不存在，创建：

```bash
echo "DEEPSEEK_API_KEY=sk-your-deepseek-key" >> .env.example
```

- [ ] **Step 2: 重写 API 路由**

用以下内容替换 `app/api/report/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { nlpFallback } from "@/lib/nlp-fallback";
import { rateLimit } from "@/lib/rate-limit";
import { calculateScores, applyAICalibration } from "@/lib/mapping-engine";
import { findArchetype } from "@/lib/templates";
import { AIAnalysisResult, AssessmentAnswers } from "@/lib/types";

const DEEPSEEK_BASE = "https://api.deepseek.com/v1";
const TIMEOUT_MS = 20000;

function safeParseJSON(raw: string): AIAnalysisResult | null {
  // 1. 直接解析
  try { return JSON.parse(raw) as AIAnalysisResult; } catch { /* continue */ }

  // 2. 提取 ```json ... ``` 包裹的内容
  const mdMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) {
    try { return JSON.parse(mdMatch[1]) as AIAnalysisResult; } catch { /* continue */ }
  }

  // 3. 提取第一个完整 {...} 对象
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]) as AIAnalysisResult; } catch { /* continue */ }
  }

  return null;
}

function validateAIFields(parsed: Record<string, unknown>): AIAnalysisResult | null {
  try {
    const nlp = parsed.nlp as Record<string, unknown> | undefined;
    const cal = parsed.calibrationScores as Record<string, number> | undefined;

    if (!nlp || !cal || !parsed.rules || !parsed.encounter || !parsed.prescription || !parsed.personalizedNote) {
      return null;
    }

    return {
      nlp: {
        animal1Name: (nlp.animal1Name as string) || "unknown",
        animal1Category: (nlp.animal1Category as string) || "unknown",
        animal2Name: (nlp.animal2Name as string) || "unknown",
        animal2Category: (nlp.animal2Category as string) || "unknown",
        animal1Sentiment: (nlp.animal1Sentiment as string) || "neutral",
        animal2Sentiment: (nlp.animal2Sentiment as string) || "neutral",
        animal1Traits: Array.isArray(nlp.animal1Traits) ? nlp.animal1Traits as string[] : [],
        animal2Traits: Array.isArray(nlp.animal2Traits) ? nlp.animal2Traits as string[] : [],
        relationshipDynamic: (nlp.relationshipDynamic as string) || "独特的关系",
      },
      calibrationScores: {
        empathy: typeof cal.empathy === "number" ? cal.empathy : 50,
        rule: typeof cal.rule === "number" ? cal.rule : 50,
        resilience: typeof cal.resilience === "number" ? cal.resilience : 50,
        role: typeof cal.role === "number" ? cal.role : 50,
      },
      rules: parsed.rules as string,
      encounter: parsed.encounter as string,
      prescription: parsed.prescription as string,
      personalizedNote: parsed.personalizedNote as string,
    };
  } catch {
    return null;
  }
}

function buildPrompt(answers: AssessmentAnswers): string {
  return `你是一位资深心理投射测评分析师，专精于通过森林意象投射解读服务型人格。

## 场景隐喻解读指南
用户完成了4个森林场景的心理投射测评。每个场景对应一个心理维度：

- **场景一（遇到的第一个动物）**：映射**自我认知**。动物的种类、状态、眼神反映用户如何看待自己作为服务者。
- **场景二（小屋木桌）**：映射**规则与边界**。桌布新旧=对规则的态度（新=重视规则和标准，旧=灵活务实随性），凳子数量=社交边界（少=倾向独立工作，多=团队导向）。
- **场景三（墙）**：映射**困难应对**。墙的高度=困难感知强度，墙的材质=困难性质（柔软=人际情绪类困难，坚硬=制度结构类障碍），跨越方式=应对策略（翻越=直面，绕路=变通，找门=寻求外部帮助）。
- **场景四（遇到的第二个动物）**：映射**客户/服务对象认知**。用户对第二个动物的描述和第一感觉，反映ta如何看待服务对象。

## 用户答案

**场景一（自我认知）：**
- 动物：${answers.scene1.animalName}
- 描述：${answers.scene1.description}
- 它在做什么、眼神如何：${answers.scene1.followUp1}
- 它看到你了吗、有交流吗：${answers.scene1.followUp2 || "未回答"}

**场景二（规则与边界）：**
- 桌布选择：${answers.scene2.tablecloth}${answers.scene2.tableclothOther ? "（" + answers.scene2.tableclothOther + "）" : ""}
- 凳子数量：${answers.scene2.stoolCount}

**场景三（困难应对）：**
- 墙的高度（0柔软低矮-100高耸入云）：${answers.scene3.wallHeight}
- 墙的材质（0柔软灌木-100坚硬石砖）：${answers.scene3.wallMaterial}
- 如何过去：${answers.scene3.crossingMethod === "easy" ? "轻松翻越" : answers.scene3.crossingMethod === "climb" ? "费点劲爬过去" : answers.scene3.crossingMethod === "detour" ? "绕路走" : answers.scene3.crossingMethod === "door" ? "找找有没有门" : answers.scene3.crossingOther || answers.scene3.crossingMethod}

**场景四（客户认知）：**
- 动物：${answers.scene4.animalName}
- 描述：${answers.scene4.description}
- 它在做什么、眼神如何：${answers.scene4.followUp1}
- 它看到你了吗、有交流吗：${answers.scene4.followUp2 || "未回答"}
- 第一感觉：${answers.scene4.firstFeeling === "warm_joy" ? "温暖喜悦" : answers.scene4.firstFeeling === "care" ? "想去呵护" : answers.scene4.firstFeeling === "equal_respect" ? "平等尊重" : answers.scene4.firstFeeling === "nervous" ? "有些紧张" : "好奇观察"}

## 任务

1. **深度分析**（nlp字段）：分析两只动物的心理投射含义：
   - animal1Name / animal2Name：动物名称（中文）
   - animal1Category / animal2Category：类别，必须是 "herbivore_gentle"、"predator_solitary"、"social"、"unknown" 之一
   - animal1Sentiment / animal2Sentiment：情感色彩，"positive"、"neutral"、"negative" 之一
   - animal1Traits / animal2Traits：3个性格特征词（中文），如["灵动","警觉","温暖"]
   - relationshipDynamic：两只动物关系的动态描述（一句中文）

2. **四维校准**（calibrationScores字段）：先判断各维度的档位（低0-33/中34-66/高67-100），再在档位区间内给出具体分数。各维度：
   - empathy（共情力）：低=理性独立/中=收放自如/高=深度共情
   - rule（秩序感）：低=灵活变通/中=弹性务实/高=秩序井然
   - resilience（应变力）：低=柔韧生长/中=稳中求进/高=坚如磐石
   - role（角色定位）：低=专家顾问型/中=协作平衡型/高=服务者型

3. **个性化报告段落**（以下部分不要提及任何具体的动物原型称号）：
   - **rules**（约150字）：结合用户的桌布选择和凳子数量，解读ta的规则与边界感。引用用户的实际选择。
   - **encounter**（约150字）：解读两只动物的关系，映射ta与他人相遇的方式。引用用户对动物的具体描述。
   - **prescription**（约150字）：三条具体、可操作的心灵处方，编号1. 2. 3.，每条约50字。
   - **personalizedNote**（1-2句，不超过80字）：从用户的具体描述中提炼个性化点评。格式："你在描述中提到[用户具体描述]，这反映了你[心理特质]。"

## 输出格式
严格输出纯 JSON，不要 \`\`\`json 标记，不要任何解释文字。输出以下结构：

{"nlp":{"animal1Name":"...","animal1Category":"...","animal2Name":"...","animal2Category":"...","animal1Sentiment":"...","animal2Sentiment":"...","animal1Traits":["...","...","..."],"animal2Traits":["...","...","..."],"relationshipDynamic":"..."},"calibrationScores":{"empathy":0,"rule":0,"resilience":0,"role":0},"rules":"...","encounter":"...","prescription":"...","personalizedNote":"..."}`;
}

export async function POST(request: NextRequest) {
  try {
    // --- 安全校验 ---
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 16384) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const answers = body as AssessmentAnswers;

    if (!answers.scene1?.animalName || !answers.scene4?.animalName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- 规则引擎初评 ---
    const animal1Text = `${answers.scene1.animalName} ${answers.scene1.description} ${answers.scene1.followUp1}`;
    const animal2Text = `${answers.scene4.animalName} ${answers.scene4.description}`;
    const animal2Feeling = answers.scene4.firstFeeling || "";

    const fallbackResult = nlpFallback(animal1Text, animal2Text, animal2Feeling);
    const ruleScores = calculateScores(answers, {
      animal1Name: fallbackResult.animal1Name,
      animal1Category: fallbackResult.animal1Category,
      animal2Name: fallbackResult.animal2Name,
      animal2Category: fallbackResult.animal2Category,
      animal1Sentiment: fallbackResult.animal1Sentiment,
      animal2Sentiment: fallbackResult.animal2Sentiment,
    });

    // --- DeepSeek API 调用 ---
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    let aiResult: AIAnalysisResult | null = null;

    if (deepseekKey) {
      try {
        const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: buildPrompt(answers) }],
            temperature: 0.5,
            max_tokens: 2000,
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = safeParseJSON(content);
            if (parsed) {
              aiResult = validateAIFields(parsed);
            }
          }
        }
      } catch {
        // DeepSeek failed — fall through to fallback
        console.warn("[report] DeepSeek API call failed, using fallback");
      }
    }

    // --- 校准与原型匹配 ---
    const calibration = applyAICalibration(ruleScores, aiResult?.calibrationScores ?? null);
    const archetype = findArchetype(calibration.finalScores);

    // --- 合成报告 ---
    const fullReport = {
      archetype: calibration.calibrationTrusted && aiResult
        ? archetype.defaultReport.archetype + "\n\n" + aiResult.personalizedNote
        : archetype.defaultReport.archetype,
      rules: aiResult?.rules || archetype.defaultReport.rules,
      encounter: aiResult?.encounter || archetype.defaultReport.encounter,
      prescription: aiResult?.prescription || archetype.defaultReport.prescription,
    };

    return NextResponse.json({
      data: {
        nlp: aiResult?.nlp || fallbackResult,
        scores: calibration.finalScores,
        calibrationTrusted: calibration.calibrationTrusted,
        archetypeIndex: calibration.archetypeIndex,
        roleTitle: archetype.roleTitle,
        cardTitle: archetype.cardTitle,
        cardInterpretation: archetype.cardInterpretation,
        fullReport,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 3: TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 4: 测试降级模式（无 API Key）**

```bash
npx tsx -e "
// 模拟：无 DEEPSEEK_API_KEY 时的请求处理
// 仅验证代码路径正常导入，不实际发起 HTTP 请求

import { calculateScores } from './lib/mapping-engine';
import { nlpFallback } from './lib/nlp-fallback';
import { findArchetype, scoresToTiers } from './lib/templates';
import { applyAICalibration } from './lib/mapping-engine';

// 模拟用户答案
const mockAnswers = {
  scene1: { animalName: '白兔', description: '一只温柔的白兔', followUp1: '在溪边喝水', followUp2: '它看到了我', skipped: false },
  scene2: { tablecloth: 'old' as const, tableclothOther: '', stoolCount: 3 },
  scene3: { wallHeight: 60, wallMaterial: 70, crossingMethod: 'climb' as const, crossingOther: '' },
  scene4: { animalName: '小鹿', description: '一只好奇的小鹿', followUp1: '正在靠近', followUp2: '我们对视了', skipped: false, firstFeeling: 'warm_joy' as const },
};

const fallbackNLP = nlpFallback(
  '白兔 一只温柔的白兔 在溪边喝水',
  '小鹿 一只好奇的小鹿',
  'warm_joy'
);

const ruleScores = calculateScores(mockAnswers, {
  animal1Name: fallbackNLP.animal1Name,
  animal1Category: fallbackNLP.animal1Category,
  animal2Name: fallbackNLP.animal2Name,
  animal2Category: fallbackNLP.animal2Category,
  animal1Sentiment: fallbackNLP.animal1Sentiment,
  animal2Sentiment: fallbackNLP.animal2Sentiment,
});

const calibration = applyAICalibration(ruleScores, null);
const archetype = findArchetype(calibration.finalScores);

console.log('Scores:', JSON.stringify(calibration.finalScores));
console.log('Archetype:', archetype.roleTitle);
console.log('Calibration trusted:', calibration.calibrationTrusted);
console.log('defaultReport.archetype has', archetype.defaultReport.archetype.length, 'chars');
console.log('Fallback OK: all paths work without API key');
"
```

Expected: 输出分数、匹配原型名、`Calibration trusted: false`、降级报告字数 > 50

- [ ] **Step 5: Commit**

```bash
git add app/api/report/route.ts .env.example
git commit -m "feat: rewrite report API with DeepSeek integration, JSON defense parsing, and hybrid report synthesis"
```

---

### Task 6: 结果页适配新数据格式

**Files:**
- Modify: `app/(public)/result/page.tsx`

- [ ] **Step 1: 更新 result page 的数据处理逻辑**

`app/(public)/result/page.tsx` 中替换 `runNLP` 函数体内的代码（约第 68-112 行）：

将：
```typescript
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
      nlpResult = (await res.json()).data;
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
    isPaid: true,
  };

  setReportData(report);
  clearLatestAnswers();
};
```

替换为：
```typescript
const runNLP = async () => {
  let apiData;
  try {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    if (res.ok) {
      apiData = (await res.json()).data;
    } else {
      throw new Error("API failed");
    }
  } catch {
    // API 完全失败 → 使用本地降级
    const animal1Text = `${answers.scene1.animalName} ${answers.scene1.description} ${answers.scene1.followUp1}`;
    const animal2Text = `${answers.scene4.animalName} ${answers.scene4.description}`;

    const { nlpFallback } = await import("@/lib/nlp-fallback");
    const { calculateScores, applyAICalibration } = await import("@/lib/mapping-engine");
    const { findArchetype } = await import("@/lib/templates");

    const fallbackNLP = nlpFallback(animal1Text, animal2Text, answers.scene4.firstFeeling);
    const ruleScores = calculateScores(answers, {
      animal1Name: fallbackNLP.animal1Name,
      animal1Category: fallbackNLP.animal1Category,
      animal2Name: fallbackNLP.animal2Name,
      animal2Category: fallbackNLP.animal2Category,
      animal1Sentiment: fallbackNLP.animal1Sentiment,
      animal2Sentiment: fallbackNLP.animal2Sentiment,
    });
    const calibration = applyAICalibration(ruleScores, null);
    const archetype = findArchetype(calibration.finalScores);

    apiData = {
      nlp: fallbackNLP,
      scores: calibration.finalScores,
      calibrationTrusted: false,
      archetypeIndex: calibration.archetypeIndex,
      roleTitle: archetype.roleTitle,
      cardTitle: archetype.cardTitle,
      cardInterpretation: archetype.cardInterpretation,
      fullReport: archetype.defaultReport,
    };
  }

  const report: ReportData = {
    id: Date.now().toString(36),
    createdAt: new Date().toISOString(),
    answers,
    scores: apiData.scores,
    nlp: apiData.nlp,
    templateIndex: apiData.archetypeIndex,
    roleTitle: apiData.roleTitle,
    cardTitle: apiData.cardTitle,
    cardInterpretation: apiData.cardInterpretation,
    fullReport: apiData.fullReport,
    isPaid: true,
  };

  setReportData(report);
  clearLatestAnswers();
};
```

同时删除文件顶部的无用导入（不再直接从客户端调用这些）：
```typescript
// 删除这两行：
import { calculateScores, matchTemplate } from "@/lib/mapping-engine";
import { nlpFallback } from "@/lib/nlp-fallback";
```

- [ ] **Step 2: TypeScript 检查**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 3: 构建验证**

```bash
npx next build 2>&1 | tail -20
```

Expected: 构建成功，无报错

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/result/page.tsx"
git commit -m "feat: adapt result page to v2 API format with client-side fallback rendering"
```

---

### Task 7: 端到端验证

- [ ] **Step 1: 完整构建**

```bash
npx next build 2>&1 | tail -5
```

Expected: 构建成功

- [ ] **Step 2: TypeScript 全面检查**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 3: 运行现有测试**

```bash
npx vitest run 2>&1
```

Expected: 所有测试通过 (17/17)

- [ ] **Step 4: 验证 API 降级路径（无 DeepSeek Key 时）**

启动 dev server 后手动测试或用 curl：

```bash
curl -s -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{"scene1":{"animalName":"白兔","description":"温柔的白兔","followUp1":"在溪边喝水","followUp2":"它看到了我","skipped":false},"scene2":{"tablecloth":"old","tableclothOther":"","stoolCount":3},"scene3":{"wallHeight":60,"wallMaterial":70,"crossingMethod":"climb","crossingOther":""},"scene4":{"animalName":"小鹿","description":"好奇的小鹿","followUp1":"正在靠近","followUp2":"我们对视了","skipped":false,"firstFeeling":"warm_joy"}}' | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).data; console.log('roleTitle:', d.roleTitle); console.log('calibrationTrusted:', d.calibrationTrusted); console.log('scores:', JSON.stringify(d.scores)); console.log('archetype has', d.fullReport.archetype.length, 'chars'); console.log('rules has', d.fullReport.rules.length, 'chars');"
```

Expected: 返回完整报告，`calibrationTrusted: false`，4 段报告每段 > 50 字

- [ ] **Step 5: 验证 git status 干净**

```bash
git status
```

Expected: clean (working tree clean)

---

## 实现顺序依赖

```
Task 1 (types) ──┐
                 ├──> Task 2 (templates) ──┐
                 └──> Task 4 (nlp-fallback) ─┼──> Task 5 (API route) ──> Task 6 (result page) ──> Task 7 (e2e)
                               ┌──> Task 3 (mapping-engine) ──┘
                               └── (Task 3 可在 Task 1 后独立并行)
```

Task 1 完成后，Task 2、3、4 可并行。Task 2、3、4 全部完成后才能做 Task 5。Task 5 完成后做 Task 6。所有完成后做 Task 7。
