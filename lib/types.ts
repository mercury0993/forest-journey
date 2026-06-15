export type AnimalCategory = "herbivore_gentle" | "predator_solitary" | "social" | "unknown";

export interface Scene1Answer {
  animalName: string;
  description: string;
  followUp1: string;
  followUp2: string;
  skipped: boolean;
}

export interface Scene2Answer {
  tablecloth: "new" | "old" | "other";
  tableclothOther: string;
  stoolCount: number;
}

export interface Scene3Answer {
  wallHeight: number;
  wallMaterial: number;
  crossingMethod: "easy" | "climb" | "detour" | "door" | "other";
  crossingOther: string;
}

export type FirstFeeling = "warm_joy" | "care" | "equal_respect" | "nervous" | "curious";

export interface Scene4Answer {
  animalName: string;
  description: string;
  followUp1: string;
  followUp2: string;
  skipped: boolean;
  firstFeeling: FirstFeeling;
}

export interface AssessmentAnswers {
  scene1: Scene1Answer;
  scene2: Scene2Answer;
  scene3: Scene3Answer;
  scene4: Scene4Answer;
}

export interface DimensionScores {
  empathy: number;
  rule: number;
  resilience: number;
  role: number;
}

export interface NLPResult {
  animal1Name: string;
  animal1Category: AnimalCategory;
  animal2Name: string;
  animal2Category: AnimalCategory;
  animal1Sentiment: "positive" | "neutral" | "negative";
  animal2Sentiment: "positive" | "neutral" | "negative";
}

export interface ReportData {
  id: string;
  createdAt: string;
  answers: AssessmentAnswers;
  scores: DimensionScores;
  nlp: NLPResult | null;
  templateIndex: number;
  roleTitle: string;
  cardTitle: string;
  cardInterpretation: string;
  fullReport: {
    archetype: string;
    rules: string;
    encounter: string;
    prescription: string;
  };
  isPaid: boolean;
}

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
