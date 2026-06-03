import { AssessmentAnswers, DimensionScores, NLPResult } from "./types";
import { getTemplateByIndex } from "./templates";

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
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < 6; i++) {
    const t = getTemplateByIndex(i);
    const d = Math.sqrt(
      Math.pow(scores.empathy - t.center.empathy, 2) +
      Math.pow(scores.rule - t.center.rule, 2) +
      Math.pow(scores.resilience - t.center.resilience, 2) +
      Math.pow(scores.role - t.center.role, 2)
    );
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = i;
    }
  }

  const matched = getTemplateByIndex(bestIndex);
  return {
    templateIndex: bestIndex,
    roleTitle: matched.roleTitle,
    cardTitle: matched.cardTitle,
    cardInterpretation: matched.cardInterpretation,
    fullReport: matched.fullReport,
  };
}
