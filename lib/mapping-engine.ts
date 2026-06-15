import { AssessmentAnswers, DimensionScores, NLPResult, DimensionTiers } from "./types";
import { findArchetype, scoresToTiers } from "./templates";

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function calculateScores(answers: AssessmentAnswers, nlp: NLPResult): DimensionScores {
  let empathy = 50;
  let rule = 50;
  let resilience = 50;
  let role = 50;

  switch (nlp.animal1Category) {
    case "herbivore_gentle":
      role += 15;
      empathy += 10;
      break;
    case "predator_solitary":
      role -= 15;
      empathy -= 10;
      break;
    case "social":
      empathy += 15;
      role += 5;
      break;
  }

  if (answers.scene2.tablecloth === "new") {
    rule += 20;
  } else if (answers.scene2.tablecloth === "old") {
    rule -= 15;
  }

  if (answers.scene2.stoolCount <= 1) {
    role -= 10;
  } else if (answers.scene2.stoolCount >= 4) {
    role += 15;
  }

  if (answers.scene3.wallHeight >= 70) {
    resilience += 20;
  }

  if (answers.scene3.wallMaterial >= 70) {
    resilience += 15;
  }

  if (answers.scene3.crossingMethod === "easy" || answers.scene3.crossingMethod === "detour") {
    resilience += 10;
  }

  switch (nlp.animal2Category) {
    case "herbivore_gentle":
      empathy += 20;
      break;
    case "predator_solitary":
      empathy -= 15;
      break;
  }

  if (nlp.animal1Category !== "unknown" && nlp.animal2Category !== "unknown" && nlp.animal1Category === nlp.animal2Category) {
    empathy += 10;
  }

  return {
    empathy: clamp(empathy),
    rule: clamp(rule),
    resilience: clamp(resilience),
    role: clamp(role),
  };
}

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
