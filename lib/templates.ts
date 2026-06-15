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
