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
