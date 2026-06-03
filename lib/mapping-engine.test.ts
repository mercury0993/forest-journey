import { describe, it, expect } from "vitest";
import { calculateScores, matchTemplate } from "./mapping-engine";
import { AssessmentAnswers, NLPResult } from "./types";

const baseAnswers: AssessmentAnswers = {
  scene1: { animalName: "", description: "", followUp1: "", followUp2: "", skipped: false },
  scene2: { tablecloth: "other", tableclothOther: "", stoolCount: 2 },
  scene3: { wallHeight: 50, wallMaterial: 50, crossingMethod: "climb", crossingOther: "" },
  scene4: { animalName: "", description: "", followUp1: "", followUp2: "", skipped: false, firstFeeling: "curious" },
};

describe("calculateScores", () => {
  it("starts all dimensions at 50", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.empathy).toBe(50);
    expect(scores.rule).toBe(50);
    expect(scores.resilience).toBe(50);
    expect(scores.role).toBe(50);
  });

  it("herbivore_gentle animal1 increases role and empathy", () => {
    const nlp: NLPResult = { animal1Name: "rabbit", animal1Category: "herbivore_gentle", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.role).toBeGreaterThan(50);
    expect(scores.empathy).toBeGreaterThan(50);
  });

  it("predator_solitary animal1 decreases role and empathy", () => {
    const nlp: NLPResult = { animal1Name: "tiger", animal1Category: "predator_solitary", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.role).toBeLessThan(50);
    expect(scores.empathy).toBeLessThan(50);
  });

  it("social animal1 increases empathy and role", () => {
    const nlp: NLPResult = { animal1Name: "dog", animal1Category: "social", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.empathy).toBeGreaterThan(50);
    expect(scores.role).toBeGreaterThan(50);
  });

  it("new tablecloth increases rule", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene2: { ...baseAnswers.scene2, tablecloth: "new" as const } };
    const scores = calculateScores(answers, nlp);
    expect(scores.rule).toBe(70);
  });

  it("old tablecloth decreases rule", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene2: { ...baseAnswers.scene2, tablecloth: "old" as const } };
    const scores = calculateScores(answers, nlp);
    expect(scores.rule).toBe(35);
  });

  it("stool count 0-1 decreases role", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene2: { ...baseAnswers.scene2, stoolCount: 0 } };
    const scores = calculateScores(answers, nlp);
    expect(scores.role).toBe(40);
  });

  it("stool count >=4 increases role", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene2: { ...baseAnswers.scene2, stoolCount: 5 } };
    const scores = calculateScores(answers, nlp);
    expect(scores.role).toBe(65);
  });

  it("high wall height increases resilience", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene3: { ...baseAnswers.scene3, wallHeight: 80 } };
    const scores = calculateScores(answers, nlp);
    expect(scores.resilience).toBe(70);
  });

  it("high wall material increases resilience", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene3: { ...baseAnswers.scene3, wallMaterial: 80 } };
    const scores = calculateScores(answers, nlp);
    expect(scores.resilience).toBe(65);
  });

  it("easy crossing method increases resilience moderately", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene3: { ...baseAnswers.scene3, crossingMethod: "easy" as const } };
    const scores = calculateScores(answers, nlp);
    expect(scores.resilience).toBe(60);
  });

  it("detour crossing method increases resilience moderately", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene3: { ...baseAnswers.scene3, crossingMethod: "detour" as const } };
    const scores = calculateScores(answers, nlp);
    expect(scores.resilience).toBe(60);
  });

  it("vulnerable animal2 increases empathy significantly", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "baby bird", animal2Category: "herbivore_gentle", animal1Sentiment: "neutral", animal2Sentiment: "positive" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.empathy).toBeGreaterThan(60);
  });

  it("threatening animal2 decreases empathy", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "snake", animal2Category: "predator_solitary", animal1Sentiment: "neutral", animal2Sentiment: "negative" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.empathy).toBeLessThan(50);
  });

  it("same category animals increase empathy", () => {
    const nlp: NLPResult = { animal1Name: "rabbit", animal1Category: "herbivore_gentle", animal2Name: "deer", animal2Category: "herbivore_gentle", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.empathy).toBeGreaterThan(55);
  });

  it("clamps scores between 0 and 100", () => {
    const nlp: NLPResult = { animal1Name: "rabbit", animal1Category: "herbivore_gentle", animal2Name: "baby deer", animal2Category: "herbivore_gentle", animal1Sentiment: "positive", animal2Sentiment: "positive" };
    let answers = { ...baseAnswers };
    answers = { ...answers, scene2: { ...answers.scene2, stoolCount: 5 } };
    answers = { ...answers, scene3: { ...answers.scene3, wallHeight: 90, wallMaterial: 90, crossingMethod: "easy" as const } };
    const scores = calculateScores(answers, nlp);
    expect(scores.empathy).toBeLessThanOrEqual(100);
    expect(scores.rule).toBeLessThanOrEqual(100);
    expect(scores.resilience).toBeLessThanOrEqual(100);
    expect(scores.role).toBeLessThanOrEqual(100);
    expect(scores.empathy).toBeGreaterThanOrEqual(0);
    expect(scores.rule).toBeGreaterThanOrEqual(0);
    expect(scores.resilience).toBeGreaterThanOrEqual(0);
    expect(scores.role).toBeGreaterThanOrEqual(0);
  });
});

describe("matchTemplate", () => {
  it("returns the closest template by Euclidean distance", () => {
    const scores = { empathy: 80, rule: 60, resilience: 70, role: 30 };
    const result = matchTemplate(scores);
    expect(result.templateIndex).toBeGreaterThanOrEqual(0);
    expect(result.templateIndex).toBeLessThan(6);
    expect(result.roleTitle).toBeTruthy();
    expect(result.cardTitle).toBeTruthy();
  });
});
