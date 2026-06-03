# Forest Journey MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Forest Journey MVP — a C-end psychological assessment web app where users go through 4 immersive scenes and receive a service-awareness report.

**Architecture:** Next.js App Router with route group `(public)` for C-end pages. Mapping engine runs client-side as pure TypeScript. Assessment data stored in localStorage. NLP extraction calls OpenAI via a single API route with regex fallback. Payment is mock — clicking "unlock" reveals the full report.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Supabase PostgreSQL, Prisma, NextAuth.js, OpenAI API

**Spec:** `docs/superpowers/specs/2026-06-02-forest-journey-mvp-design.md`

---

## File Structure

```
forest-journey/
├── app/
│   ├── layout.tsx                    # Root layout: AudioProvider + AssessmentProvider + ForestLayout
│   ├── globals.css                   # Tailwind directives + custom keyframes
│   ├── (public)/
│   │   ├── page.tsx                  # Homepage (forest gate)
│   │   ├── meditate/page.tsx         # Meditation guide
│   │   ├── assessment/page.tsx       # 4-scene assessment flow
│   │   ├── result/page.tsx           # Result: waiting → card → report
│   │   └── profile/page.tsx          # Personal center (localStorage)
│   └── api/
│       └── report/
│           └── route.ts             # POST: NLP entity extraction via OpenAI
├── components/
│   ├── layout/
│   │   ├── ForestLayout.tsx          # Wrapper: white noise <audio> + page transitions
│   │   └── BottomNav.tsx             # Bottom navigation bar
│   ├── home/
│   │   ├── ForestGate.tsx            # Glowing forest gate SVG/CSS animation
│   │   └── ParticleField.tsx         # Firefly/aurora particle animation
│   ├── meditate/
│   │   └── BreathGlow.tsx            # Breathing glow CSS scale animation
│   ├── assessment/
│   │   ├── AssessmentFlow.tsx        # State machine: 4 scenes + progress bar
│   │   ├── SceneAnimal.tsx           # Scene 1 & 4: animal input + tags + follow-ups
│   │   ├── SceneTable.tsx            # Scene 2: tablecloth choice + stool counter
│   │   └── SceneWall.tsx             # Scene 3: dual sliders + wall preview + crossing method
│   ├── result/
│   │   ├── WaitingAnimation.tsx      # Deer jumping + flowers blooming loading
│   │   ├── ServiceCard.tsx           # Free service identity card
│   │   └── FullReport.tsx            # Full paid report (4 sections, scrollable)
│   ├── profile/
│   │   └── HistoryList.tsx           # localStorage report history list
│   └── shared/
│       ├── AudioToggle.tsx           # White noise on/off toggle
│       └── FadeTransition.tsx        # Framer Motion AnimatePresence wrapper
├── context/
│   ├── AssessmentContext.tsx          # Assessment progress, answers, current step
│   └── AudioContext.tsx              # White noise on/off state
├── lib/
│   ├── types.ts                      # All TypeScript interfaces & types
│   ├── mapping-engine.ts             # Core mapping: answers → 4D scores
│   ├── mapping-engine.test.ts        # Unit tests for every mapping rule
│   ├── templates.ts                  # 6 report templates
│   ├── animals.ts                    # Animal name → illustration mapping
│   ├── storage.ts                    # localStorage read/write helpers
│   └── nlp-fallback.ts              # Keyword regex fallback when OpenAI fails
├── public/
│   └── audio/
│       └── forest-ambient.mp3        # White noise file (placeholder)
└── prisma/
    └── schema.prisma                 # DB schema (users, assessments, reports — minimal for MVP)
```

---

## Phase 1: Project Scaffold

### Task 1: Initialize Next.js project with dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`

- [ ] **Step 1: Create Next.js app**

```bash
npx create-next-app@latest forest-journey --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
cd forest-journey
```

- [ ] **Step 2: Install additional dependencies**

```bash
npm install framer-motion @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
npm install -D @types/node vitest @vitejs/plugin-react jsdom
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
# When prompted: default style, neutral base color, yes to CSS variables
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
# Open http://localhost:3000 — should see default Next.js page
```

- [ ] **Step 5: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + shadcn/ui + Framer Motion"
```

### Task 2: Create directory structure and base config files

**Files:**
- Create: `app/globals.css`, `lib/types.ts`, `context/AudioContext.tsx`, `context/AssessmentContext.tsx`

- [ ] **Step 1: Create all empty directories**

```bash
mkdir -p app/api/report app/"(public)"/meditate app/"(public)"/assessment app/"(public)"/result app/"(public)"/profile
mkdir -p components/layout components/home components/meditate components/assessment components/result components/profile components/shared
mkdir -p context lib public/audio prisma
```

- [ ] **Step 2: Write `lib/types.ts`**

```typescript
// Core assessment types

export type AnimalCategory = "herbivore_gentle" | "predator_solitary" | "social" | "unknown";

export interface Scene1Answer {
  animalName: string;
  description: string;
  followUp1: string;
  followUp2: string; // optional, may be empty
  skipped: boolean;
}

export interface Scene2Answer {
  tablecloth: "new" | "old" | "other";
  tableclothOther: string;
  stoolCount: number; // 0-8
}

export interface Scene3Answer {
  wallHeight: number;   // 0-100
  wallMaterial: number; // 0-100
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
    archetype: string;   // ~500 words
    rules: string;        // rules & boundaries interpretation
    encounter: string;    // animal1-animal2 relationship
    prescription: string; // 3 personalized suggestions
  };
  isPaid: boolean;
}
```

- [ ] **Step 3: Write base `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 120 15% 4%;
    --foreground: 120 10% 90%;
    --primary: 120 30% 35%;
    --primary-foreground: 120 10% 95%;
    --muted: 120 10% 12%;
    --muted-foreground: 120 5% 50%;
    --border: 120 10% 15%;
  }
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
  50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(74, 138, 74, 0.3); }
  50% { box-shadow: 0 0 60px rgba(74, 138, 74, 0.6); }
}
```

- [ ] **Step 4: Write `context/AudioContext.tsx`**

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AudioContextType {
  isPlaying: boolean;
  toggle: () => void;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  toggle: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fj_audio_on");
    if (stored !== null) {
      setIsPlaying(stored === "true");
    }
  }, []);

  const toggle = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      localStorage.setItem("fj_audio_on", String(next));
      return next;
    });
  };

  return (
    <AudioContext.Provider value={{ isPlaying, toggle }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
```

- [ ] **Step 5: Write `context/AssessmentContext.tsx`**

```typescript
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AssessmentAnswers, Scene1Answer, Scene2Answer, Scene3Answer, Scene4Answer } from "@/lib/types";
import { saveCurrentAssessment, loadCurrentAssessment, clearCurrentAssessment } from "@/lib/storage";

export type SceneIndex = 1 | 2 | 3 | 4;

interface AssessmentContextType {
  currentScene: SceneIndex;
  answers: AssessmentAnswers;
  setScene1: (answer: Scene1Answer) => void;
  setScene2: (answer: Scene2Answer) => void;
  setScene3: (answer: Scene3Answer) => void;
  setScene4: (answer: Scene4Answer) => void;
  goToScene: (scene: SceneIndex) => void;
  restoreFromStorage: () => boolean;
}

const defaultAnswers: AssessmentAnswers = {
  scene1: { animalName: "", description: "", followUp1: "", followUp2: "", skipped: false },
  scene2: { tablecloth: "new", tableclothOther: "", stoolCount: 2 },
  scene3: { wallHeight: 50, wallMaterial: 50, crossingMethod: "easy", crossingOther: "" },
  scene4: { animalName: "", description: "", followUp1: "", followUp2: "", skipped: false, firstFeeling: "curious" },
};

const AssessmentContext = createContext<AssessmentContextType | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [currentScene, setCurrentScene] = useState<SceneIndex>(1);
  const [answers, setAnswers] = useState<AssessmentAnswers>(defaultAnswers);

  const updateAndSave = (newAnswers: AssessmentAnswers) => {
    setAnswers(newAnswers);
    saveCurrentAssessment(newAnswers);
  };

  const setScene1 = (answer: Scene1Answer) => updateAndSave({ ...answers, scene1: answer });
  const setScene2 = (answer: Scene2Answer) => updateAndSave({ ...answers, scene2: answer });
  const setScene3 = (answer: Scene3Answer) => updateAndSave({ ...answers, scene3: answer });
  const setScene4 = (answer: Scene4Answer) => updateAndSave({ ...answers, scene4: answer });

  const goToScene = (scene: SceneIndex) => setCurrentScene(scene);

  const restoreFromStorage = useCallback((): boolean => {
    const saved = loadCurrentAssessment();
    if (saved) {
      setAnswers(saved);
      return true;
    }
    return false;
  }, []);

  return (
    <AssessmentContext.Provider value={{ currentScene, answers, setScene1, setScene2, setScene3, setScene4, goToScene, restoreFromStorage }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add types, globals.css, AudioContext, AssessmentContext"
```

---

## Phase 2: Core Library

### Task 3: Write localStorage helpers

**Files:**
- Create: `lib/storage.ts`

- [ ] **Step 1: Write `lib/storage.ts`**

```typescript
import { AssessmentAnswers, ReportData } from "./types";

const KEYS = {
  currentAssessment: "fj_current_assessment",
  reports: "fj_reports",
  audioOn: "fj_audio_on",
} as const;

const MAX_REPORTS = 5;

// --- Assessment (in progress) ---

export function saveCurrentAssessment(answers: AssessmentAnswers): void {
  try {
    localStorage.setItem(KEYS.currentAssessment, JSON.stringify(answers));
  } catch { /* storage full, silently ignore */ }
}

export function loadCurrentAssessment(): AssessmentAnswers | null {
  try {
    const raw = localStorage.getItem(KEYS.currentAssessment);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearCurrentAssessment(): void {
  localStorage.removeItem(KEYS.currentAssessment);
}

// --- Reports ---

export function getReports(): ReportData[] {
  try {
    const raw = localStorage.getItem(KEYS.reports);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReport(report: ReportData): void {
  const reports = getReports();
  reports.unshift(report); // newest first
  // Keep only last MAX_REPORTS
  const trimmed = reports.slice(0, MAX_REPORTS);
  try {
    localStorage.setItem(KEYS.reports, JSON.stringify(trimmed));
  } catch {
    // If still full, remove oldest and retry
    if (trimmed.length > 1) {
      localStorage.setItem(KEYS.reports, JSON.stringify(trimmed.slice(0, -1)));
    }
  }
}

export function getReportById(id: string): ReportData | undefined {
  return getReports().find((r) => r.id === id);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/storage.ts
git commit -m "feat: add localStorage storage helpers"
```

### Task 4: Write mapping engine with tests

**Files:**
- Create: `lib/mapping-engine.ts`, `lib/mapping-engine.test.ts`

- [ ] **Step 1: Write the test file `lib/mapping-engine.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { calculateScores, matchTemplate } from "./mapping-engine";
import { AssessmentAnswers, NLPResult } from "./types";

const baseAnswers: AssessmentAnswers = {
  scene1: { animalName: "", description: "", followUp1: "", followUp2: "", skipped: false },
  scene2: { tablecloth: "new", tableclothOther: "", stoolCount: 2 },
  scene3: { wallHeight: 50, wallMaterial: 50, crossingMethod: "easy", crossingOther: "" },
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
    expect(scores.rule).toBe(70); // 50 + 20
  });

  it("old tablecloth decreases rule", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene2: { ...baseAnswers.scene2, tablecloth: "old" as const } };
    const scores = calculateScores(answers, nlp);
    expect(scores.rule).toBe(35); // 50 - 15
  });

  it("stool count 0-1 decreases role", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene2: { ...baseAnswers.scene2, stoolCount: 0 } };
    const scores = calculateScores(answers, nlp);
    expect(scores.role).toBe(40); // 50 - 10
  });

  it("stool count >=4 increases role", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene2: { ...baseAnswers.scene2, stoolCount: 5 } };
    const scores = calculateScores(answers, nlp);
    expect(scores.role).toBe(65); // 50 + 15
  });

  it("high wall height increases resilience", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene3: { ...baseAnswers.scene3, wallHeight: 80 } };
    const scores = calculateScores(answers, nlp);
    expect(scores.resilience).toBe(70); // 50 + 20
  });

  it("high wall material increases resilience", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene3: { ...baseAnswers.scene3, wallMaterial: 80 } };
    const scores = calculateScores(answers, nlp);
    expect(scores.resilience).toBe(65); // 50 + 15
  });

  it("easy crossing method increases resilience moderately", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene3: { ...baseAnswers.scene3, crossingMethod: "easy" } };
    const scores = calculateScores(answers, nlp);
    expect(scores.resilience).toBe(60); // 50 + 10
  });

  it("detour crossing method increases resilience moderately", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "", animal2Category: "unknown", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const answers = { ...baseAnswers, scene3: { ...baseAnswers.scene3, crossingMethod: "detour" } };
    const scores = calculateScores(answers, nlp);
    expect(scores.resilience).toBe(60); // 50 + 10
  });

  it("vulnerable animal2 increases empathy significantly", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "baby bird", animal2Category: "herbivore_gentle", animal1Sentiment: "neutral", animal2Sentiment: "positive" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.empathy).toBeGreaterThan(60); // empathy should increase
  });

  it("threatening animal2 decreases empathy", () => {
    const nlp: NLPResult = { animal1Name: "", animal1Category: "unknown", animal2Name: "snake", animal2Category: "predator_solitary", animal1Sentiment: "neutral", animal2Sentiment: "negative" };
    const scores = calculateScores(baseAnswers, nlp);
    expect(scores.empathy).toBeLessThan(50);
  });

  it("same category animals increase empathy", () => {
    const nlp: NLPResult = { animal1Name: "rabbit", animal1Category: "herbivore_gentle", animal2Name: "deer", animal2Category: "herbivore_gentle", animal1Sentiment: "neutral", animal2Sentiment: "neutral" };
    const scores = calculateScores(baseAnswers, nlp);
    // empathy should increase from both animal1 herbivore + animal2 same category
    expect(scores.empathy).toBeGreaterThan(55);
  });

  it("clamps scores between 0 and 100", () => {
    // Stack many empathy-increasing rules to test clamping
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
    expect(result.templateIndex).toBeLessThan(6); // 6 templates (0-5)
    expect(result.roleTitle).toBeTruthy();
    expect(result.cardTitle).toBeTruthy();
  });
});
```

- [ ] **Step 2: Configure vitest — update `vite.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

- [ ] **Step 3: Add test script to `package.json` — add to scripts**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Run tests and verify they fail**

```bash
npm test
# Expected: all tests FAIL — calculateScores and matchTemplate not yet implemented
```

- [ ] **Step 5: Write `lib/mapping-engine.ts`**

```typescript
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

  // --- Scene 1: Animal 1 ---
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

  // --- Scene 2: Tablecloth ---
  if (answers.scene2.tablecloth === "new") {
    rule += 20;
  } else if (answers.scene2.tablecloth === "old") {
    rule -= 15;
  }
  // "other" — no change

  // --- Scene 2: Stool count ---
  if (answers.scene2.stoolCount <= 1) {
    role -= 10;
  } else if (answers.scene2.stoolCount >= 4) {
    role += 15;
  }

  // --- Scene 3: Wall height ---
  if (answers.scene3.wallHeight >= 70) {
    resilience += 20;
  }

  // --- Scene 3: Wall material ---
  if (answers.scene3.wallMaterial >= 70) {
    resilience += 15;
  }

  // --- Scene 3: Crossing method ---
  if (answers.scene3.crossingMethod === "easy" || answers.scene3.crossingMethod === "detour") {
    resilience += 10;
  }

  // --- Scene 4: Animal 2 ---
  switch (nlp.animal2Category) {
    case "herbivore_gentle":
      empathy += 20; // vulnerable, needs care
      break;
    case "predator_solitary":
      empathy -= 15; // threatening
      break;
  }

  // Animal2 same category as animal1
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
  // Euclidean distance to each template's center
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
```

- [ ] **Step 6: Run tests and verify they pass**

```bash
npm test
# Expected: all 13 tests PASS
```

- [ ] **Step 7: Commit**

```bash
git add lib/mapping-engine.ts lib/mapping-engine.test.ts vite.config.ts package.json
git commit -m "feat: add mapping engine with 13-rule coverage and template matching"
```

### Task 5: Write NLP fallback module and animal mappings

**Files:**
- Create: `lib/nlp-fallback.ts`, `lib/animals.ts`

- [ ] **Step 1: Write `lib/nlp-fallback.ts`**

```typescript
import { AnimalCategory, NLPResult } from "./types";

const HERBIVORE_KEYWORDS = ["rabbit", "bunny", "deer", "sheep", "goat", "lamb", "horse", "cow", "elephant", "giraffe", "squirrel", "mouse", "hamster", "bird", "sparrow", "dove", "butterfly", "rabbit", "turtle", "tortoise", "fish", "koala", "panda", "llama", "donkey", "pony", "fawn"];
const PREDATOR_KEYWORDS = ["tiger", "lion", "leopard", "panther", "wolf", "bear", "eagle", "hawk", "snake", "crocodile", "shark", "dragon", "scorpion", "spider", "vulture", "hyena", "cheetah", "jaguar"];
const SOCIAL_KEYWORDS = ["dog", "puppy", "horse", "dolphin", "elephant", "monkey", "chimp", "gorilla", "parrot", "bee", "ant", "wolf", "raven", "crow", "magpie"];

const POSITIVE_KEYWORDS = ["gentle", "warm", "friendly", "soft", "cute", "lovely", "beautiful", "kind", "sweet", "calm", "peaceful", "happy", "bright", "sparkling", "graceful", "elegant"];
const NEGATIVE_KEYWORDS = ["fierce", "scary", "angry", "dark", "sharp", "cold", "threatening", "aggressive", "dangerous", "frightening", "intense", "staring", "silent"];

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
  let pos = 0;
  let neg = 0;
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
  // Try to match known animals first
  const allKnown = [...HERBIVORE_KEYWORDS, ...PREDATOR_KEYWORDS, ...SOCIAL_KEYWORDS];
  const lower = text.toLowerCase();
  for (const kw of allKnown) {
    if (lower.includes(kw)) return kw;
  }
  // Return first word as fallback
  const words = text.trim().split(/\s+/);
  return words[0] || "unknown";
}

export function nlpFallback(animal1Text: string, animal2Text: string, animal2Feeling: string): NLPResult {
  return {
    animal1Name: extractAnimalName(animal1Text),
    animal1Category: classifyAnimal(animal1Text),
    animal2Name: extractAnimalName(animal2Text),
    animal2Category: classifyAnimal(animal2Text),
    animal1Sentiment: classifySentiment(animal1Text),
    animal2Sentiment: classifySentiment(animal2Text + " " + animal2Feeling),
  };
}
```

- [ ] **Step 2: Write `lib/animals.ts`**

```typescript
// Maps animal names to emoji fallback and descriptive labels
// SVG illustrations are the primary render target; emoji is fallback

export interface AnimalIllustration {
  emoji: string;
  label: string;
}

const animalMap: Record<string, AnimalIllustration> = {
  rabbit: { emoji: "🐰", label: "兔子" },
  bunny: { emoji: "🐰", label: "兔子" },
  deer: { emoji: "🦌", label: "鹿" },
  sheep: { emoji: "🐑", label: "羊" },
  goat: { emoji: "🐐", label: "山羊" },
  horse: { emoji: "🐴", label: "马" },
  cow: { emoji: "🐮", label: "牛" },
  elephant: { emoji: "🐘", label: "大象" },
  fox: { emoji: "🦊", label: "狐狸" },
  bear: { emoji: "🐻", label: "熊" },
  tiger: { emoji: "🐯", label: "老虎" },
  lion: { emoji: "🦁", label: "狮子" },
  wolf: { emoji: "🐺", label: "狼" },
  dog: { emoji: "🐕", label: "狗" },
  cat: { emoji: "🐈", label: "猫" },
  bird: { emoji: "🐦", label: "鸟" },
  owl: { emoji: "🦉", label: "猫头鹰" },
  snake: { emoji: "🐍", label: "蛇" },
  turtle: { emoji: "🐢", label: "乌龟" },
  fish: { emoji: "🐟", label: "鱼" },
  butterfly: { emoji: "🦋", label: "蝴蝶" },
  monkey: { emoji: "🐒", label: "猴子" },
  squirrel: { emoji: "🐿", label: "松鼠" },
  dolphin: { emoji: "🐬", label: "海豚" },
  panda: { emoji: "🐼", label: "熊猫" },
  eagle: { emoji: "🦅", label: "鹰" },
};

export function getAnimalIllustration(name: string): AnimalIllustration {
  const lower = name.toLowerCase().trim();
  // Direct match
  if (animalMap[lower]) return animalMap[lower];
  // Partial match
  for (const [key, value] of Object.entries(animalMap)) {
    if (lower.includes(key)) return value;
  }
  // Fallback: generic leaf/nature emoji
  return { emoji: "🌿", label: name || "森林生灵" };
}

// Predefined auxiliary tag options for scene animal input
export const ANIMAL_TAGS = [
  { emoji: "🦊", label: "有灵性的", keyword: "fox" },
  { emoji: "🐻", label: "温厚的", keyword: "bear" },
  { emoji: "🦌", label: "警觉的", keyword: "deer" },
  { emoji: "🐰", label: "温柔的", keyword: "rabbit" },
  { emoji: "🦉", label: "智慧的", keyword: "owl" },
];
```

- [ ] **Step 3: Commit**

```bash
git add lib/nlp-fallback.ts lib/animals.ts
git commit -m "feat: add NLP fallback regex engine and animal illustration mappings"
```

### Task 6: Write report templates

**Files:**
- Create: `lib/templates.ts`

- [ ] **Step 1: Write `lib/templates.ts`**

```typescript
import { DimensionScores } from "./types";

export interface ReportTemplate {
  center: DimensionScores; // The "ideal" 4D center for this template
  roleTitle: string;       // e.g. "林间向导·灵狐型服务者"
  cardTitle: string;       // Short title for card
  cardInterpretation: string; // One-line core interpretation
  fullReport: {
    archetype: string;     // ~500 words
    rules: string;
    encounter: string;
    prescription: string;  // 3 suggestions
  };
}

const templates: ReportTemplate[] = [
  {
    center: { empathy: 80, rule: 40, resilience: 60, role: 70 },
    roleTitle: "林间向导·灵狐型服务者",
    cardTitle: "林间向导",
    cardInterpretation: "你拥有敏锐的洞察力与温柔的引导力，在服务中善于观察、擅长陪伴。像森林中的灵狐，你能在复杂的需求中找到最优路径。",
    fullReport: {
      archetype: `你属于"林间向导"原型——一位以共情为指南针的服务者。你在测评中展现出的敏锐感知力，使你能够在他人的言语与沉默之间捕捉到真实的需求。这种天赋让你在服务场景中不只是执行者，更是理解者。

你的服务风格温和而有力量。你不急于给出答案，而是先让对方的情绪着陆——这种方式往往能让被服务者感到"被真正看见了"。在团队中，你天然地成为那个"被大家找来倾诉"的人，因为你知道什么时候该倾听，什么时候该轻轻推一把。

然而，你的高共情倾向有时候也意味着你承担了过多他人的情绪重量。你需要记住：最好的向导也不会为每一位旅人走完所有的路。保持你那份温柔的同时，学会适时退后一步。`,
      rules: `你对规则的态度是灵活而实用的。对你来说，规则不是束缚而是参考——你会在理解规则背后的意图之后再决定如何行动。这种"有弹性的规则感"让你在面对灰色地带时比别人多一份从容，但也意味着你可能偶尔会被认为"不够规范"。

你的边界感来自内心的判断，而非外部的条框。这让你的服务既有温度又有方向——你不会因为盲从流程而冷落一个人，也不会因为过度迁就而迷失自己。`,
      encounter: `在你与两个动物的相遇中，我们看到了你与他人建立关系的方式。第一只动物代表你对自己的认知——你选择了一个温和而有洞察力的形象，说明你的内在自我是平和而敏锐的。第二只动物代表你在面对他人时的姿态——你的选择表明，你在关系中倾向于以一种温柔、好奇而非防御的方式去接触对方。

两只动物之间是否有相似之处？如果有，说明你倾向于寻找与自己共鸣的人；如果差异很大，说明你对差异有着健康的包容度。无论哪种，都很好——关键是你意识到自己与他人相遇时的第一反应是什么。`,
      prescription: `1. 保护你的共情天赋：每天留出10分钟的"情绪清空时间"，在安静的环境中让一天积累的感受自然流过，不评判、不分析。
2. 建立你的边界仪式：在开始服务他人之前，做一个简单的心理标记（比如深呼吸三次），告诉自己"我在这里，但我不是你"。
3. 培养决策直觉：当面临选择时，先问自己"什么能让对方感受到被尊重"，再问"什么能解决问题"。两个答案的交汇点，就是你的行动方向。`,
    },
  },
  {
    center: { empathy: 40, rule: 80, resilience: 60, role: 30 },
    roleTitle: "秩序守护者·苍鹰型服务者",
    cardTitle: "秩序守护者",
    cardInterpretation: "你以清晰的标准和坚定的原则守护服务质量。像森林上空的苍鹰，你看到全局，也看到每一个细节。",
    fullReport: {
      archetype: `你属于"秩序守护者"原型——一位以标准和原则为导向的服务者。在测评中，你展现出了对规则的深度认同和对边界的清晰认知。对你来说，好的服务不是随意的善意，而是可预期、可衡量、可持续的高标准。

你关注细节，重视流程。当别人看到混乱时，你已经在大脑中排列好了优先级。这种"结构感"让你在服务团队中天然的成为定海神针——客户知道找你能得到确定的答案，同事知道按你的流程走不会出错。

你的挑战在于：过度依赖规则可能让你在需要灵活应变的时刻显得"不够暖"。记住，规则是手段不是目的。最坚固的桥也需要一定的柔韧性才能抗风。`,
      rules: `规则是你世界的骨架。你对"崭新桌布"的偏好，映射出你对清晰边界的欣赏——你知道没有边界的服务最终会耗尽双方。在团队中，你是那个会被委托起草 SOP 的人，因为你天然地知道一个流程的每个节点应该是什么样子。

但这种偏好也有另一面：你需要警惕"规则完美主义"。有时候，最好的服务发生在规则允许的灰色地带——一次额外的等待、一个超出标准的让步、一个流程之外的关心。`,
      encounter: `你与两个动物的相遇揭示了你对关系的边界感。第一只动物代表你的自我认知——它可能是独立而警觉的，这与你在关系中需要"安全距离"的倾向一致。第二只动物代表你面对他人时的姿态——你可能倾向于保持观察者的视角，在确认安全之后才靠近。

这种谨慎不是冷漠，而是尊重。你在用行动说："在我不确定是否能给你最好的之前，我不会轻易承诺。"这是一种成熟的关系姿态。`,
      prescription: `1. 练习"柔软的边界"：每周选一件小事，主动打破自己设定的规则。比如在非工作时间回复一条消息，或者在没有准备的情况下接受一个邀约。
2. 开发你的"温暖信号"：在每次服务交互中，除了解答问题，多说一句有人情味的话——不是流程要求的，而是你真心想表达的。
3. 建立反馈循环：定期问你的服务对象一个简单的问题："今天的体验，你觉得还有什么可以更好的？"你可能会在答案里发现规则之外的改进方向。`,
    },
  },
  {
    center: { empathy: 70, rule: 40, resilience: 80, role: 60 },
    roleTitle: "破壁行者·驯鹿型服务者",
    cardTitle: "破壁行者",
    cardInterpretation: "你不畏惧困难，总是能找到穿越阻碍的方法。像在岩石间跳跃的驯鹿，你的韧性本身就是他人力量的来源。",
    fullReport: {
      archetype: `你属于"破壁行者"原型——一位用韧性定义自己的服务者。在测评中，你面对"墙"的姿态告诉我们：在你眼中，没有过不去的阻碍，只有还没找到的角度。你不对困难做情绪反应，而是直接思考解决方案。

这种稳健的韧性是你服务风格的核心。当客户投诉、当系统崩溃、当一切都偏离剧本时，你是那个让团队不慌的人。你身上有一种令人安心的"我能处理"的气场——这不是盲目的乐观，而是过往经验的沉淀。

同时，你在高韧性之外还有着不低的共情。这意味着你解决问题的方式往往既有效又有人情味——你不会为了效率碾压他人，也不会为了安抚他人放弃效率。这是一种珍贵的能力组合。`,
      rules: `你对规则的态度是务实的。"翻越"或"绕路"的选择说明，规则在你这里是达成目标的工具而非约束。你不会被一堵"流程的墙"挡住，但你也知道有些墙不应该拆——它们可能保护着什么。

这种灵活让你在需要创新和变通的工作中出类拔萃。你适合处理那些"没有标准流程"的案例——因为你会自己找到路。`,
      encounter: `你与两只动物的相遇充满了动态的张力。第一只动物代表你的自我认知——它活跃而有力量，与你面对困难时的姿态一致。第二只动物代表你面对他人时的态度——你的反应模式偏向于"我能为它做什么"而非"它会对我做什么"，这是一种服务者天生的外向视角。

如果你感到两只动物之间有些距离，这可能反映你对"自我"和"他人"有清晰的区分——你能在帮助他人的同时保持自己的内心完整，不轻易被对方的情绪裹挟。这是一个成熟服务者的标志。`,
      prescription: `1. 记录你的"翻越日记"：每次解决一个棘手问题后，用2分钟记下你当时的思路和感觉。一个月后回看，你会发现自己的韧性来源。
2. 分享你的方法论：你不只是一个"能搞定的人"，你已经形成了独特的问题解决模式。尝试把它写下来或讲给同事听——这个过程会让你更清楚自己的价值。
3. 照顾你的身体：高韧性的人往往在用身体扛着心理的消耗。确保你有规律的身体活动——不是健身房打卡，而是你真正享受的运动。身体是你最重要的服务工具。`,
    },
  },
  {
    center: { empathy: 40, rule: 70, resilience: 80, role: 20 },
    roleTitle: "独立工匠·雪豹型服务者",
    cardTitle: "独立工匠",
    cardInterpretation: "你用精湛的专业能力和独立判断力提供高品质服务。像高山上的雪豹，你独行但从不迷失。",
    fullReport: {
      archetype: `你属于"独立工匠"原型——一位以专业深度为信仰的服务者。在测评中，你的选择描绘了一个独立、自信、有扎实判断力的服务者形象。你相信真正的服务来自于专业，而非热情。

你的稀少凳子数量暗示着你对"深度大于广度"的认同。与其在一大群人中周旋，你更愿意和少数人进行有质量的对话。这种"少而精"的风格在需要专业判断的服务领域——比如咨询、医疗、法律、技术——往往是最有效的方式。

你需要警惕的是：过度的独立可能让你低估了协作的价值。最锋利的刀也需要刀鞘的保护，最精湛的专业也需要团队的支撑。`,
      rules: `你对规则的态度成熟而务实的。你的选择反映了"规则有价值，但规则应该服务于人而非反过来"的立场。你不会为了遵守规则而遵守规则，但你也认可规则存在的合理性。

这种态度让你在需要"原则性灵活"的场合格外出色——你懂得在什么情况下应该坚持标准，在什么情况下应该做出调整。这不是"看心情"，而是一种基于经验的判断力。`,
      encounter: `你与两只动物的关系映射了你对"自我"和"他人"的平衡。第一只动物倾向于独立和有边界感——你的专业自我需要空间和自主。第二只动物的选择显示了你在面对客户/他人时的姿态——你保持专业距离，但认真对待每一次相遇。

这种平衡使你能够在服务中既不失去自己，也不怠慢他人。你有一种"高手气度"——不需要证明什么，但每一件事都做得恰到好处。`,
      prescription: `1. 尝试"有结构的合作"：每月选一件你原本独立完成的工作，邀请一个同事参与。不是为了效率，而是为了体验被另一个人看到工作过程的感觉。
2. 丰富你的反馈词典：除了"好的/不行"，添加更多描述性的反馈词汇。作为深度专业者，你的洞察本身就是一种服务。
3. 给自己留出"不专业"的时间：刻意安排一些你不擅长、也不需要擅长的活动。在不完美的环境下保持舒适，是一种心理柔韧性的训练。`,
    },
  },
  {
    center: { empathy: 70, rule: 70, resilience: 50, role: 70 },
    roleTitle: "平衡守护者·牧羊犬型服务者",
    cardTitle: "平衡守护者",
    cardInterpretation: "你在规则和关怀之间找到了自己的平衡点。像尽责的牧羊犬，你既守护边界也温暖群羊。",
    fullReport: {
      archetype: `你属于"平衡守护者"原型——一位兼顾了共情与规则的服务者。你的测评结果展现了一个高度整合的服务人格：你不会因为关照个体而牺牲公平，也不会因为坚持原则而失去温度。这种平衡感本身就是一种罕见的服务天赋。

在服务场景中，你天然地扮演着"桥梁"的角色——你需要同时理解客户的情绪需求和组织的规则约束，并在两个世界之间找到可行的路径。你擅长的事情不是"二选一"，而是"怎么都兼顾"。

你的挑战在于持续的能量管理。保持平衡比走极端更消耗心力——要在每一刻同时考量他人的感受和规则的边界，你的大脑比单维度服务者在工作中多跑了很多路。`,
      rules: `你对规则的态度是"尊重但不盲从"。新的桌布暗示你对清晰标准有一定偏好，但适中的凳子数量说明你知道一个人做不了所有事。你理想的团队规模是"够用但不拥挤"——每个人都有明确的角色，彼此之间有交流和协作的空间。

这种"适中的规则感+适中的团队感"让你成为团队中真正的修复者。当团队在"过度规范"和"完全松散"之间摇摆时，你往往是那个找到平衡点的人。`,
      encounter: `你与两只动物的相遇展现了你对自我的认知和对他人关系的双重智慧。第一只动物既有独立的能力又有温暖的倾向——这反映了你对自己"既要强也要暖"的期待。第二只动物的选择进一步印证了你对他人的态度：你好奇、愿意接触，但不轻易被对方左右。

这种关系模式意味着你在服务中能同时做到"在场"和"觉察"——你在用心参与互动的同时，也保留了一部分注意力在观察和分析上。这是最难练的功夫：全身心投入但不过度卷入。`,
      prescription: `1. 正视你的能量消耗：每天结束时，用1-10分给自己的"心力剩余"打分。如果连续一周低于6分，说明你在平衡他人和规则之间付出了超出可持续水平的努力——需要调整。
2. 把平衡方法"产品化"：你解决两难问题的方式是宝贵的隐性知识。尝试把它提炼成可分享的框架（比如"3步骤平衡法"），这将帮助你的团队也提升处理复杂服务情境的能力。
3. 为你的"平衡木"做减法：有时候平衡不了的人和事，最好的选择是优雅地退出。不是每件事都需要你来平衡。学会说"这次我选择不介入"。`,
    },
  },
  {
    center: { empathy: 50, rule: 50, resilience: 50, role: 50 },
    roleTitle: "探索旅人·幼鹿型服务者",
    cardTitle: "探索旅人",
    cardInterpretation: "你正走在自我发现的路上，对服务与关系的理解还在形成中。像初入森林的幼鹿，你的可能性无限。",
    fullReport: {
      archetype: `你属于"探索旅人"原型——一位正在形成自己服务风格的新生力量。在所有原型中，这可能是最有潜力的一个：你没有固定的模式，每条路都向你敞开。在测评中，你的答案分布在各个维度的中间区域，暗示着一个正在"收集数据"的服务者。

这不代表"不够好"——恰恰相反，这说明你对不同的服务场景保持着开放和好奇。你不会被一个固定的标签定义，而是在不同的情境中自然地调整自己的方式。这种适应力在快速变化的工作环境中是巨大的优势。

随着你在真实服务场景中积累更多体验，你的四维分布可能会向某个方向偏移——但不用担心，那不是"定型"，而是"成长"。每一个阶段都有其独特的美。`,
      rules: `你对规则的态度正处在一个探索期。"适中"的选择说明你既没有强烈的规则偏好，也没有明确的反规则倾向——你在观察，在感受不同的规则密度对你和他人产生的影响。

这个阶段最重要的是对自己的诚实：在哪些时刻，你感到"有规则真好"？在哪些时刻，你感到"这个规则让我不舒服"？这些微小的感受是你形成自己规则观的建筑材料。`,
      encounter: `你与两只动物的相遇方式，揭示了你对自我和他人的平衡探索。两个动物的特质可能比较相似——这反映了你对"一致性"的重视，你在关系中寻求的是一种和谐的、可预测的互动模式。

另一种可能是两个动物差异很大——这说明你对"差异"有天然的包容，甚至好奇。你不需要所有人像你一样，这种开放性是你最宝贵的服务资产。`,
      prescription: `1. 开始你的"服务日志"：每周记录一次让你印象深刻的互动——可以是你服务他人的时刻，也可以是你被服务的时刻。写下：发生了什么、你当时的感受、你学到了什么。
2. 尝试不同风格的服务场景：如果你习惯了独立工作，试试团队协作；如果你一直面对团体，试试一对一的深度对话。你的"均衡"意味着你具备适应多种场景的潜力。
3. 找到至少一位你欣赏的服务者（可以是同事、导师、甚至一位让你印象深刻的客服），观察并拆解他们的服务方式中有哪些你想学习的元素。模仿是成长的最快路径。`,
    },
  },
];

export function getTemplateByIndex(index: number): ReportTemplate {
  return templates[index % templates.length];
}

export function getAllTemplates(): ReportTemplate[] {
  return templates;
}
```

- [ ] **Step 2: Run tests to verify template matching still works**

```bash
npm test
# Expected: all tests PASS (including matchTemplate test from Task 4)
```

- [ ] **Step 3: Commit**

```bash
git add lib/templates.ts
git commit -m "feat: add 6 report templates with full content"
```

---

## Phase 3: Layout & Shared Components

### Task 7: Create shared components (FadeTransition, AudioToggle, BottomNav)

**Files:**
- Create: `components/shared/FadeTransition.tsx`, `components/shared/AudioToggle.tsx`, `components/layout/BottomNav.tsx`

- [ ] **Step 1: Write `components/shared/FadeTransition.tsx`**

```typescript
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  id: string; // unique key for AnimatePresence
}

export default function FadeTransition({ children, id }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Write `components/shared/AudioToggle.tsx`**

```typescript
"use client";

import { useAudio } from "@/context/AudioContext";

export default function AudioToggle() {
  const { isPlaying, toggle } = useAudio();

  return (
    <button
      onClick={toggle}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-lg hover:bg-black/50 transition-colors"
      aria-label={isPlaying ? "关闭白噪音" : "开启白噪音"}
    >
      {isPlaying ? "🔊" : "🔇"}
    </button>
  );
}
```

- [ ] **Step 3: Write `components/layout/BottomNav.tsx`**

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "探索", icon: "🗺️" },
  { href: "#", label: "发现", icon: "🧭", disabled: true },
  { href: "/profile", label: "我的", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center py-3 px-4 bg-black/80 backdrop-blur-md border-t border-white/5">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        if (item.disabled) {
          return (
            <div key={item.label} className="flex flex-col items-center gap-1 opacity-30 cursor-not-allowed">
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] text-white/30">{item.label}</span>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-green-400" : "text-white/50 hover:text-white/70"}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/shared/FadeTransition.tsx components/shared/AudioToggle.tsx components/layout/BottomNav.tsx
git commit -m "feat: add shared components (FadeTransition, AudioToggle, BottomNav)"
```

### Task 8: Create ForestLayout and root layout

**Files:**
- Create: `components/layout/ForestLayout.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write `components/layout/ForestLayout.tsx`**

```typescript
"use client";

import { useAudio } from "@/context/AudioContext";
import { useRef, useEffect } from "react";

export default function ForestLayout({ children }: { children: React.ReactNode }) {
  const { isPlaying } = useAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/forest-ambient.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked or file missing — silently ignore
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-[#061206] text-white relative">
      {/* Gradient overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/50" />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Read existing `app/layout.tsx` then rewrite it**

```typescript
import type { Metadata } from "next";
import { AudioProvider } from "@/context/AudioContext";
import { AssessmentProvider } from "@/context/AssessmentContext";
import ForestLayout from "@/components/layout/ForestLayout";
import BottomNav from "@/components/layout/BottomNav";
import AudioToggle from "@/components/shared/AudioToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forest Journey — 森林之旅",
  description: "一次深入心灵的森林探索，发现你的服务者原型",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <AudioProvider>
          <AssessmentProvider>
            <ForestLayout>
              {children}
              <AudioToggle />
              <BottomNav />
            </ForestLayout>
          </AssessmentProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create a placeholder audio file**

```bash
# Create a minimal silent MP3 placeholder (or download a free forest ambient)
# For MVP, we can use a data URI or skip the actual file — the UI handles missing file gracefully
touch public/audio/forest-ambient.mp3
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/ForestLayout.tsx app/layout.tsx public/audio/forest-ambient.mp3
git commit -m "feat: add ForestLayout with white noise and root layout wiring"
```

---

## Phase 4: Home Page

### Task 9: Create ParticleField and ForestGate components

**Files:**
- Create: `components/home/ParticleField.tsx`, `components/home/ForestGate.tsx`

- [ ] **Step 1: Write `components/home/ParticleField.tsx`**

```typescript
"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  phase: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    const particles: Particle[] = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.1,
      opacity: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.phase += 0.02;

        // Wrap around edges
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        const alpha = p.opacity + Math.sin(p.phase) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 220, 160, ${alpha})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 180, 100, ${alpha * 0.3})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
}
```

- [ ] **Step 2: Write `components/home/ForestGate.tsx`**

```typescript
"use client";

import { motion } from "framer-motion";

export default function ForestGate() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Aurora glow behind the gate */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-radial from-green-500/10 via-green-700/5 to-transparent blur-3xl" />

      {/* Gate arch */}
      <motion.div
        className="relative"
        animate={{ filter: ["drop-shadow(0 0 15px rgba(74,138,74,0.3))", "drop-shadow(0 0 30px rgba(74,138,74,0.6))", "drop-shadow(0 0 15px rgba(74,138,74,0.3))"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-8xl select-none">🌳</div>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-4xl font-bold mt-6 tracking-[0.3em] text-green-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        森林之旅
      </motion.h1>

      <motion.p
        className="text-sm text-green-300/60 mt-2 tracking-[0.15em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        Forest Journey
      </motion.p>

      {/* Divider */}
      <motion.div
        className="w-20 h-px my-6 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      />

      {/* Subtitle */}
      <motion.p
        className="text-sm text-white/40 text-center max-w-xs leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        一次深入心灵的森林探索
        <br />
        发现你的服务者原型
      </motion.p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/home/ParticleField.tsx components/home/ForestGate.tsx
git commit -m "feat: add ParticleField (fireflies) and ForestGate (animated title card)"
```

### Task 10: Create homepage

**Files:**
- Create: `app/(public)/page.tsx`

- [ ] **Step 1: Write `app/(public)/page.tsx`**

```typescript
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ParticleField from "@/components/home/ParticleField";
import ForestGate from "@/components/home/ForestGate";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-20">
      <ParticleField />

      <div className="relative z-10 flex flex-col items-center">
        <ForestGate />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <Link
            href="/meditate"
            className="mt-10 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-green-700 to-green-600 text-white font-medium text-lg shadow-lg shadow-green-900/30 hover:shadow-green-800/40 hover:scale-105 transition-all duration-300"
          >
            开启心灵之旅
            <span className="text-xl">✦</span>
          </Link>
        </motion.div>

        {/* Enterprise entry — subdued, at bottom */}
        <motion.p
          className="mt-16 text-xs text-white/20 hover:text-white/40 transition-colors cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          企业测评入口
        </motion.p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Start dev server and verify homepage renders**

```bash
npm run dev
# Open http://localhost:3000 — should see forest gate with particles, title, CTA button
```

- [ ] **Step 3: Commit**

```bash
git add app/"(public)"/page.tsx
git commit -m "feat: add homepage with forest gate, particles, and CTA"
```

---

## Phase 5: Meditation Page

### Task 11: Create BreathGlow component and meditation page

**Files:**
- Create: `components/meditate/BreathGlow.tsx`, `app/(public)/meditate/page.tsx`

- [ ] **Step 1: Write `components/meditate/BreathGlow.tsx`**

```typescript
"use client";

import { motion } from "framer-motion";

export default function BreathGlow() {
  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      {/* Outer glow ring */}
      <motion.div
        className="absolute w-full h-full rounded-full bg-green-500/10"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute w-3/4 h-3/4 rounded-full bg-green-400/20"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
      />
      {/* Core */}
      <motion.div
        className="absolute w-1/2 h-1/2 rounded-full bg-green-300/40"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Write `app/(public)/meditate/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import BreathGlow from "@/components/meditate/BreathGlow";

const TOTAL_SECONDS = 45;

const guideLines = [
  "闭上眼睛，深呼吸……",
  "想象自己站在一片古老森林的边缘……",
  "脚下的落叶柔软而温暖……",
  "空气中有松针和泥土的气息……",
  "阳光从树冠的缝隙中洒落……",
  "你感到平静、安全、好奇……",
];

export default function MeditatePage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) {
      router.push("/assessment");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router]);

  // Cycle guide lines every 7.5 seconds
  useEffect(() => {
    if (timeLeft <= 0) return;
    const lineInterval = setInterval(() => {
      setLineIndex((i) => (i + 1) % guideLines.length);
    }, 7500);
    return () => clearInterval(lineInterval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-20 bg-gradient-to-b from-[#020602] to-[#061206]">
      {/* Screen dimmed relative to homepage */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        <BreathGlow />

        <motion.p
          key={lineIndex}
          className="text-green-200/70 text-lg text-center max-w-xs leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 1 }}
        >
          {guideLines[lineIndex]}
        </motion.p>

        <div className="flex items-center gap-6">
          <span className="text-white/30 font-mono text-sm">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
          <button
            onClick={() => router.push("/assessment")}
            className="text-white/20 hover:text-white/40 text-sm transition-colors"
          >
            跳过 ›
          </button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify navigation flow**

```bash
# Open http://localhost:3000 → click "开启心灵之旅" → should see meditation page
# → after 45s countdown or clicking "跳过" → should navigate to /assessment (currently 404)
```

- [ ] **Step 4: Commit**

```bash
git add components/meditate/BreathGlow.tsx app/"(public)"/meditate/page.tsx
git commit -m "feat: add meditation page with breath glow animation and guided text"
```

---

## Phase 6: Assessment Scenes

### Task 12: Create SceneAnimal component

**Files:**
- Create: `components/assessment/SceneAnimal.tsx`

- [ ] **Step 1: Write `components/assessment/SceneAnimal.tsx`**

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ANIMAL_TAGS } from "@/lib/animals";

interface Props {
  sceneNumber: 1 | 4;
  isScene4?: boolean;
  onComplete: (data: {
    animalName: string;
    description: string;
    followUp1: string;
    followUp2: string;
    skipped: boolean;
    firstFeeling?: string;
  }) => void;
}

export default function SceneAnimal({ sceneNumber, isScene4, onComplete }: Props) {
  const [step, setStep] = useState<"name" | "followUp1" | "followUp2" | "feeling">("name");
  const [animalName, setAnimalName] = useState("");
  const [description, setDescription] = useState("");
  const [followUp1, setFollowUp1] = useState("");
  const [followUp2, setFollowUp2] = useState("");
  const [firstFeeling, setFirstFeeling] = useState("");

  const guideText = sceneNumber === 1
    ? "你走进一片森林，看见了一只动物……"
    : "你继续往前走，遇到了另一只动物……";

  const handleTagClick = (tag: { label: string; emoji: string }) => {
    setAnimalName((prev) => (prev ? `${prev}，${tag.emoji} ${tag.label}` : `${tag.emoji} ${tag.label}`));
  };

  const handleSkip = () => {
    onComplete({ animalName: "", description: "", followUp1: "", followUp2: "", skipped: true, firstFeeling: "" });
  };

  const handleNext = () => {
    if (step === "name") {
      setStep("followUp1");
    } else if (step === "followUp1") {
      setStep("followUp2");
    } else if (step === "followUp2") {
      if (isScene4) {
        setStep("feeling");
      } else {
        onComplete({ animalName, description, followUp1, followUp2, skipped: false });
      }
    } else if (step === "feeling") {
      onComplete({ animalName, description, followUp1, followUp2, skipped: false, firstFeeling });
    }
  };

  const feelingOptions = [
    { value: "warm_joy", label: "温暖喜悦", emoji: "🥰" },
    { value: "care", label: "想去呵护", emoji: "🤲" },
    { value: "equal_respect", label: "平等尊重", emoji: "🤝" },
    { value: "nervous", label: "有些紧张", emoji: "😰" },
    { value: "curious", label: "好奇观察", emoji: "🔍" },
  ];

  return (
    <motion.div
      className="max-w-lg mx-auto px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Guide text */}
      <p className="text-green-200/70 text-sm mb-8 text-center italic">{guideText}</p>

      {step === "name" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">这是什么动物？</label>
          <input
            type="text"
            value={animalName}
            onChange={(e) => setAnimalName(e.target.value)}
            placeholder="例如：一只白色的兔子……"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors"
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            {ANIMAL_TAGS.map((tag) => (
              <button
                key={tag.keyword}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-green-900/20 hover:border-green-500/30 hover:text-white/80 transition-colors"
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "followUp1" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">它正在做什么？眼神是怎样的？</label>
          <textarea
            value={followUp1}
            onChange={(e) => setFollowUp1(e.target.value)}
            placeholder="描述一下它的状态……"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors resize-none"
            autoFocus
          />
        </div>
      )}

      {step === "followUp2" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">它看到你了吗？你们有交流吗？</label>
          <input
            type="text"
            value={followUp2}
            onChange={(e) => setFollowUp2(e.target.value)}
            placeholder="（选填，按 Enter 跳过）"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNext();
            }}
          />
        </div>
      )}

      {step === "feeling" && (
        <div className="space-y-4">
          <label className="block text-green-100 font-medium text-lg">你的第一感觉是什么？</label>
          <div className="grid grid-cols-2 gap-3">
            {feelingOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setFirstFeeling(opt.value);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  firstFeeling === opt.value
                    ? "border-green-500 bg-green-900/20 text-green-100"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="ml-2">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between items-center mt-8">
        <button onClick={handleSkip} className="text-white/20 hover:text-white/40 text-sm transition-colors">
          没看清 / 跳过
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition-colors disabled:opacity-30"
          disabled={step === "name" && !animalName.trim()}
        >
          继续 →
        </button>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/assessment/SceneAnimal.tsx
git commit -m "feat: add SceneAnimal component for scenes 1 and 4"
```

### Task 13: Create SceneTable component

**Files:**
- Create: `components/assessment/SceneTable.tsx`

- [ ] **Step 1: Write `components/assessment/SceneTable.tsx`**

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: (data: { tablecloth: "new" | "old" | "other"; tableclothOther: string; stoolCount: number }) => void;
}

export default function SceneTable({ onComplete }: Props) {
  const [tablecloth, setTablecloth] = useState<"new" | "old" | "other" | null>(null);
  const [tableclothOther, setTableclothOther] = useState("");
  const [stoolCount, setStoolCount] = useState(2);
  const [step, setStep] = useState<"cloth" | "stools">("cloth");

  const handleClothConfirm = () => {
    if (tablecloth) setStep("stools");
  };

  const handleComplete = () => {
    if (!tablecloth) return;
    onComplete({ tablecloth, tableclothOther, stoolCount });
  };

  return (
    <motion.div
      className="max-w-lg mx-auto px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-green-200/70 text-sm mb-8 text-center italic">
        "你走进一座林中小屋，中央有一张朴素的木桌……"
      </p>

      {step === "cloth" && (
        <div className="space-y-6">
          <label className="block text-green-100 font-medium text-lg text-center">桌上铺着什么桌布？</label>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTablecloth("new")}
              className={`p-6 rounded-xl border-2 text-center transition-all ${
                tablecloth === "new"
                  ? "border-green-500 bg-green-900/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-3xl mb-2">🧶</div>
              <div className="text-green-100 font-medium">崭新的，有花纹</div>
              <div className="text-white/30 text-xs mt-1">格子图案</div>
            </button>

            <button
              onClick={() => setTablecloth("old")}
              className={`p-6 rounded-xl border-2 text-center transition-all ${
                tablecloth === "old"
                  ? "border-green-500 bg-green-900/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-3xl mb-2">🧵</div>
              <div className="text-green-100 font-medium">旧的，有使用痕迹</div>
              <div className="text-white/30 text-xs mt-1">素色</div>
            </button>
          </div>

          {/* Other option */}
          <div
            onClick={() => setTablecloth("other")}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
              tablecloth === "other" ? "border-green-500 bg-green-900/20" : "border-white/5 bg-white/[0.02] hover:border-white/10"
            }`}
          >
            <span className="text-white/40 text-sm">其他（自定义描述）</span>
          </div>

          {tablecloth === "other" && (
            <input
              type="text"
              value={tableclothOther}
              onChange={(e) => setTableclothOther(e.target.value)}
              placeholder="描述你看到的桌布……"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors"
              autoFocus
            />
          )}

          <div className="text-center">
            <button
              onClick={handleClothConfirm}
              disabled={!tablecloth}
              className="px-8 py-2.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition-colors disabled:opacity-30"
            >
              确认 →
            </button>
          </div>
        </div>
      )}

      {step === "stools" && (
        <div className="space-y-8">
          <label className="block text-green-100 font-medium text-lg text-center">
            桌子周围有几把椅子？
          </label>

          {/* Stool counter */}
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => setStoolCount((c) => Math.max(0, c - 1))}
              disabled={stoolCount <= 0}
              className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-2xl text-white/60 hover:border-green-500/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              −
            </button>

            <span className="text-5xl font-bold text-green-100 min-w-[60px] text-center">
              {stoolCount}
            </span>

            <button
              onClick={() => setStoolCount((c) => Math.min(8, c + 1))}
              disabled={stoolCount >= 8}
              className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center text-2xl text-white/60 hover:border-green-500/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              +
            </button>
          </div>

          {/* Stool visualization */}
          <div className="flex justify-center gap-2 flex-wrap">
            <AnimatePresence>
              {Array.from({ length: stoolCount }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-2xl"
                >
                  🪑
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {stoolCount === 0 && (
            <p className="text-white/20 text-sm text-center">没有椅子，你独自站着</p>
          )}

          <div className="text-center">
            <button
              onClick={handleComplete}
              className="px-8 py-2.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition-colors"
            >
              这样就好 ✓
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/assessment/SceneTable.tsx
git commit -m "feat: add SceneTable component with cloth choice and stool counter"
```

### Task 14: Create SceneWall component

**Files:**
- Create: `components/assessment/SceneWall.tsx`

- [ ] **Step 1: Write `components/assessment/SceneWall.tsx`**

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: (data: {
    wallHeight: number;
    wallMaterial: number;
    crossingMethod: "easy" | "climb" | "detour" | "door" | "other";
    crossingOther: string;
  }) => void;
}

const crossingOptions = [
  { value: "easy", label: "轻松翻越", emoji: "🏃" },
  { value: "climb", label: "费点劲爬过去", emoji: "🧗" },
  { value: "detour", label: "绕路走", emoji: "↪" },
  { value: "door", label: "找找有没有门", emoji: "🚪" },
] as const;

export default function SceneWall({ onComplete }: Props) {
  const [step, setStep] = useState<"wall" | "crossing">("wall");
  const [wallHeight, setWallHeight] = useState(50);
  const [wallMaterial, setWallMaterial] = useState(50);
  const [crossingMethod, setCrossingMethod] = useState<"easy" | "climb" | "detour" | "door" | "other" | null>(null);
  const [crossingOther, setCrossingOther] = useState("");

  const wallStyle = {
    height: `${40 + wallHeight * 0.6}%`,
    background: `linear-gradient(180deg,
      hsl(${30 - wallMaterial * 0.2}, ${20 + wallMaterial * 0.3}%, ${15 + wallMaterial * 0.2}%),
      hsl(${25 - wallMaterial * 0.15}, ${15 + wallMaterial * 0.2}%, ${10 + wallMaterial * 0.15}%)
    )`,
    borderRadius: wallMaterial > 60 ? "4px" : "12px",
    transition: "all 0.3s ease",
  };

  const handleComplete = () => {
    if (!crossingMethod) return;
    onComplete({ wallHeight, wallMaterial, crossingMethod, crossingOther });
  };

  return (
    <motion.div
      className="max-w-lg mx-auto px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-green-200/70 text-sm mb-8 text-center italic">
        "你面前出现了一堵墙……"
      </p>

      {/* Wall preview */}
      <div className="h-48 bg-[#0a0a0a] rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
        <motion.div
          className="w-3/4 rounded-lg"
          animate={{ height: `${40 + wallHeight * 0.6}%` }}
          style={{
            background: `linear-gradient(180deg, hsl(${30 - wallMaterial * 0.2}, ${20 + wallMaterial * 0.3}%, ${15 + wallMaterial * 0.2}%), hsl(${25 - wallMaterial * 0.15}, ${15 + wallMaterial * 0.2}%, ${10 + wallMaterial * 0.15}%))`,
            borderRadius: wallMaterial > 60 ? "4px" : "12px",
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {step === "wall" && (
        <div className="space-y-8">
          {/* Height slider */}
          <div>
            <label className="flex justify-between text-sm mb-2">
              <span className="text-white/40">及腰低矮</span>
              <span className="text-green-200/70 font-medium">高度</span>
              <span className="text-white/40">高耸入云</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={wallHeight}
              onChange={(e) => setWallHeight(Number(e.target.value))}
              className="w-full accent-green-600 h-2 rounded-full"
            />
          </div>

          {/* Material slider */}
          <div>
            <label className="flex justify-between text-sm mb-2">
              <span className="text-white/40">柔软灌木</span>
              <span className="text-green-200/70 font-medium">材质</span>
              <span className="text-white/40">坚硬石砖</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={wallMaterial}
              onChange={(e) => setWallMaterial(Number(e.target.value))}
              className="w-full accent-green-600 h-2 rounded-full"
            />
          </div>

          <div className="text-center">
            <button
              onClick={() => setStep("crossing")}
              className="px-8 py-2.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition-colors"
            >
              这就是那堵墙
            </button>
          </div>
        </div>
      )}

      {step === "crossing" && (
        <div className="space-y-6">
          <label className="block text-green-100 font-medium text-lg text-center">你如何过去？</label>

          <div className="space-y-3">
            {crossingOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCrossingMethod(opt.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  crossingMethod === opt.value
                    ? "border-green-500 bg-green-900/20 text-green-100"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                }`}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}

            {/* Other */}
            <div
              onClick={() => setCrossingMethod("other")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                crossingMethod === "other"
                  ? "border-green-500 bg-green-900/20"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              }`}
            >
              <span className="text-white/40 text-sm">其他方式……</span>
            </div>
          </div>

          {crossingMethod === "other" && (
            <input
              type="text"
              value={crossingOther}
              onChange={(e) => setCrossingOther(e.target.value)}
              placeholder="描述你过墙的方式……"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors"
              autoFocus
            />
          )}

          <div className="text-center">
            <button
              onClick={handleComplete}
              disabled={!crossingMethod}
              className="px-8 py-2.5 rounded-full bg-green-700 text-white hover:bg-green-600 transition-colors disabled:opacity-30"
            >
              确认 →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/assessment/SceneWall.tsx
git commit -m "feat: add SceneWall component with dual sliders and crossing method"
```

### Task 15: Create AssessmentFlow and assessment page

**Files:**
- Create: `components/assessment/AssessmentFlow.tsx`, `app/(public)/assessment/page.tsx`

- [ ] **Step 1: Write `components/assessment/AssessmentFlow.tsx`**

```typescript
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import SceneAnimal from "./SceneAnimal";
import SceneTable from "./SceneTable";
import SceneWall from "./SceneWall";
import { useAssessment } from "@/context/AssessmentContext";
import { clearCurrentAssessment } from "@/lib/storage";

type SceneId = 1 | 2 | 3 | 4;

const sceneLabels = ["第一幕", "第二幕", "第三幕", "第四幕"];
const sceneSubtitles = ["遇见", "小屋", "墙", "相遇"];

export default function AssessmentFlow() {
  const router = useRouter();
  const { answers, setScene1, setScene2, setScene3, setScene4, restoreFromStorage } = useAssessment();
  const [scene, setScene] = useState<SceneId>(1);
  const [hasRestored, setHasRestored] = useState(false);

  // Try to restore on first mount
  if (!hasRestored) {
    setHasRestored(true);
    const restored = restoreFromStorage();
    if (restored) {
      // User has in-progress assessment — start from scene 1 but with restored answers
    }
  }

  const handleScene1Complete = useCallback((data: Parameters<typeof setScene1>[0]) => {
    setScene1(data);
    setScene(2);
  }, [setScene1]);

  const handleScene2Complete = useCallback((data: Parameters<typeof setScene2>[0]) => {
    setScene2(data);
    setScene(3);
  }, [setScene2]);

  const handleScene3Complete = useCallback((data: Parameters<typeof setScene3>[0]) => {
    setScene3(data);
    setScene(4);
  }, [setScene3]);

  const handleScene4Complete = useCallback((data: Parameters<typeof setScene4>[0]) => {
    setScene4(data);
    clearCurrentAssessment();
    // Navigate to result with answers in URL or session — for MVP, store in localStorage
    localStorage.setItem("fj_latest_answers", JSON.stringify({ ...answers, scene4: data }));
    router.push("/result");
  }, [setScene4, answers, router]);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-30 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-green-600 to-green-400"
          animate={{ width: `${((scene - 1) / 4) * 100}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Scene header */}
      <div className="pt-8 pb-4 text-center">
        <motion.p
          key={scene}
          className="text-green-300/40 text-xs tracking-[0.2em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {sceneLabels[scene - 1]} · {sceneSubtitles[scene - 1]}
        </motion.p>
      </div>

      {/* Scene content */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {scene === 1 && (
            <SceneAnimal key="scene1" sceneNumber={1} onComplete={handleScene1Complete} />
          )}
          {scene === 2 && (
            <SceneTable key="scene2" onComplete={handleScene2Complete} />
          )}
          {scene === 3 && (
            <SceneWall key="scene3" onComplete={handleScene3Complete} />
          )}
          {scene === 4 && (
            <SceneAnimal key="scene4" sceneNumber={4} isScene4 onComplete={handleScene4Complete} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/(public)/assessment/page.tsx`**

```typescript
"use client";

import AssessmentFlow from "@/components/assessment/AssessmentFlow";

export default function AssessmentPage() {
  return <AssessmentFlow />;
}
```

- [ ] **Step 3: Commit**

```bash
git add components/assessment/AssessmentFlow.tsx app/"(public)"/assessment/page.tsx
git commit -m "feat: add AssessmentFlow state machine and assessment page"
```

---

## Phase 7: Result Pages

### Task 16: Create WaitingAnimation and ServiceCard

**Files:**
- Create: `components/result/WaitingAnimation.tsx`, `components/result/ServiceCard.tsx`

- [ ] **Step 1: Write `components/result/WaitingAnimation.tsx`**

```typescript
"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
  onComplete: () => void;
}

export default function WaitingAnimation({ onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Deer jumping */}
      <motion.div
        className="text-6xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        🦌
      </motion.div>

      {/* Flowers blooming path */}
      <div className="flex gap-2">
        {["🌱", "🌿", "🌸", "🌼", "🌺"].map((emoji, i) => (
          <motion.span
            key={i}
            className="text-lg"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.5, duration: 0.4 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* Loading text */}
      <motion.p
        className="text-green-200/60 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        你的心灵画卷正在展开……
      </motion.p>

      {/* Dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-green-500/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `components/result/ServiceCard.tsx`**

```typescript
"use client";

import { motion } from "framer-motion";
import { getAnimalIllustration } from "@/lib/animals";

interface Props {
  animalName: string;
  roleTitle: string;
  cardTitle: string;
  cardInterpretation: string;
  onUnlock: () => void;
}

export default function ServiceCard({ animalName, roleTitle, cardTitle, cardInterpretation, onUnlock }: Props) {
  const illustration = getAnimalIllustration(animalName);

  return (
    <motion.div
      className="max-w-sm mx-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Card */}
      <div className="bg-gradient-to-b from-[#0d1f14] to-[#081208] border-2 border-green-800/50 rounded-2xl p-8 text-center shadow-2xl shadow-green-900/20">
        {/* Animal illustration */}
        <motion.div
          className="text-7xl mb-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {illustration.emoji}
        </motion.div>

        {/* Label */}
        <p className="text-green-400/50 text-xs tracking-[0.2em] uppercase mb-2">
          服务者原型
        </p>

        {/* Title */}
        <h2 className="text-2xl font-bold text-green-100 mb-1">
          {cardTitle}
        </h2>

        {/* Subtitle */}
        <p className="text-amber-200/80 text-lg font-medium mb-4">
          {roleTitle}
        </p>

        {/* Divider */}
        <div className="w-12 h-px bg-green-700/50 mx-auto my-4" />

        {/* Core interpretation */}
        <p className="text-white/60 text-sm leading-relaxed">
          {cardInterpretation}
        </p>
      </div>

      {/* Unlock button */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={onUnlock}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium shadow-lg shadow-amber-900/20 hover:shadow-amber-800/30 hover:scale-105 transition-all duration-300"
        >
          ✨ 查看完整心灵图谱 →
        </button>
        <p className="text-white/20 text-xs mt-2">¥9.99 解锁完整报告</p>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/result/WaitingAnimation.tsx components/result/ServiceCard.tsx
git commit -m "feat: add WaitingAnimation and ServiceCard components"
```

### Task 17: Create FullReport component

**Files:**
- Create: `components/result/FullReport.tsx`

- [ ] **Step 1: Write `components/result/FullReport.tsx`**

```typescript
"use client";

import { motion } from "framer-motion";
import { DimensionScores } from "@/lib/types";

interface Props {
  report: {
    archetype: string;
    rules: string;
    encounter: string;
    prescription: string;
  };
  scores: DimensionScores;
  roleTitle: string;
}

function RadarChart({ scores }: { scores: DimensionScores }) {
  const dimensions = [
    { key: "empathy", label: "共情" },
    { key: "rule", label: "规则" },
    { key: "resilience", label: "韧性" },
    { key: "role", label: "角色" },
  ] as const;

  const cx = 140;
  const cy = 140;
  const r = 100;
  const centerAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / dimensions.length;

  const points = dimensions.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    const value = scores[dimensions[i].key] / 100;
    return {
      x: cx + r * value * Math.cos(angle),
      y: cy + r * value * Math.sin(angle),
    };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const axisPoints = dimensions.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[280px] mx-auto">
      {/* Grid */}
      {gridLevels.map((level) => {
        const gridPoints = dimensions.map((_, i) => {
          const angle = centerAngle + i * angleStep;
          return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={gridPoints}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}

      {/* Axes */}
      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}

      {/* Data polygon */}
      <path d={pathData} fill="rgba(74, 138, 74, 0.3)" stroke="rgba(132, 200, 132, 0.7)" strokeWidth="2" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#84c884" />
      ))}

      {/* Labels */}
      {axisPoints.map((p, i) => {
        const labelR = r + 25;
        const angle = centerAngle + i * angleStep;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="13">
            {dimensions[i].label} {scores[dimensions[i].key]}
          </text>
        );
      })}
    </svg>
  );
}

export default function FullReport({ report, scores, roleTitle }: Props) {
  return (
    <motion.div
      className="max-w-lg mx-auto px-6 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-green-100 mb-2">{roleTitle}</h1>
        <p className="text-green-400/40 text-sm">你的完整心灵图谱</p>
      </div>

      {/* Radar chart */}
      <div className="mb-10">
        <RadarChart scores={scores} />
      </div>

      {/* Report sections */}
      <div className="space-y-8">
        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-green-300 font-semibold mb-3">Part 1 · 你的服务者原型</h3>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {report.archetype}
          </div>
        </section>

        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-green-300 font-semibold mb-3">Part 2 · 你的规则感与边界</h3>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {report.rules}
          </div>
        </section>

        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-green-300 font-semibold mb-3">Part 3 · 你与他人的相遇</h3>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {report.encounter}
          </div>
        </section>

        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-green-300 font-semibold mb-3">Part 4 · 你的心灵处方</h3>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {report.prescription}
          </div>
        </section>
      </div>

      {/* Bottom actions */}
      <div className="mt-10 text-center space-y-3">
        <button
          onClick={() => {
            // Save to localStorage is handled in result page
          }}
          className="px-6 py-2.5 rounded-full border border-white/10 text-white/50 text-sm hover:border-white/20 hover:text-white/70 transition-colors"
        >
          📥 保存到我的
        </button>
        <p className="text-white/10 text-xs">
          我的团队也想探索（企业入口即将开放）
        </p>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/result/FullReport.tsx
git commit -m "feat: add FullReport component with radar chart and 4 sections"
```

### Task 18: Create result page that wires everything together

**Files:**
- Create: `app/(public)/result/page.tsx`

- [ ] **Step 1: Write `app/(public)/result/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WaitingAnimation from "@/components/result/WaitingAnimation";
import ServiceCard from "@/components/result/ServiceCard";
import FullReport from "@/components/result/FullReport";
import { calculateScores, matchTemplate } from "@/lib/mapping-engine";
import { nlpFallback } from "@/lib/nlp-fallback";
import { saveReport } from "@/lib/storage";
import { AssessmentAnswers, ReportData } from "@/lib/types";

type Stage = "waiting" | "card" | "report";

export default function ResultPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("waiting");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Load answers from localStorage
    const raw = localStorage.getItem("fj_latest_answers");
    if (!raw) {
      router.push("/");
      return;
    }

    try {
      const answers: AssessmentAnswers = JSON.parse(raw);

      // Try NLP extraction via API, fallback to regex
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
            nlpResult = await res.json();
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
          isPaid: false,
        };

        setReportData(report);
        localStorage.removeItem("fj_latest_answers"); // Clean up
      };

      runNLP();
    } catch {
      setError(true);
    }
  }, [router]);

  const handleUnlock = () => {
    if (!reportData) return;
    // Mock payment — mark as paid and save
    const updated = { ...reportData, isPaid: true };
    setReportData(updated);
    saveReport(updated);
    setStage("report");
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">出了点问题，请返回重试</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center pb-20">
      {stage === "waiting" && (
        <WaitingAnimation onComplete={() => setStage("card")} />
      )}

      {stage === "card" && reportData && (
        <ServiceCard
          animalName={reportData.answers.scene1.animalName}
          roleTitle={reportData.roleTitle}
          cardTitle={reportData.cardTitle}
          cardInterpretation={reportData.cardInterpretation}
          onUnlock={handleUnlock}
        />
      )}

      {stage === "report" && reportData && (
        <FullReport
          report={reportData.fullReport}
          scores={reportData.scores}
          roleTitle={reportData.roleTitle}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify full flow**

```bash
# Start from homepage → enter assessment → complete all 4 scenes → should see waiting → card → unlock → full report
```

- [ ] **Step 3: Commit**

```bash
git add app/"(public)"/result/page.tsx
git commit -m "feat: add result page with waiting animation, card, mock payment, and full report"
```

---

## Phase 8: Profile Page

### Task 19: Create HistoryList and profile page

**Files:**
- Create: `components/profile/HistoryList.tsx`, `app/(public)/profile/page.tsx`

- [ ] **Step 1: Write `components/profile/HistoryList.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { getReports, getReportById } from "@/lib/storage";
import { ReportData } from "@/lib/types";
import FullReport from "@/components/result/FullReport";

export default function HistoryList() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  useEffect(() => {
    setReports(getReports());
  }, []);

  if (selectedReport) {
    return (
      <div>
        <button
          onClick={() => setSelectedReport(null)}
          className="mb-6 text-green-400/60 hover:text-green-400 text-sm transition-colors"
        >
          ← 返回列表
        </button>
        <FullReport
          report={selectedReport.fullReport}
          scores={selectedReport.scores}
          roleTitle={selectedReport.roleTitle}
        />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🌿</div>
        <p className="text-white/40">还没有测评记录</p>
        <p className="text-white/20 text-sm mt-2">完成一次测评后，报告会保存在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-green-200/70 text-sm font-medium mb-4">
        历史测评（本设备 · 最多5条）
      </h2>

      {reports.map((report) => (
        <button
          key={report.id}
          onClick={() => setSelectedReport(report)}
          className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-green-500/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {report.answers.scene1.animalName
                ? (() => {
                    const { getAnimalIllustration } = require("@/lib/animals");
                    return getAnimalIllustration(report.answers.scene1.animalName).emoji;
                  })()
                : "🌿"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-white/80 font-medium truncate">
                {report.cardTitle}
              </div>
              <div className="text-white/30 text-xs mt-0.5">
                {new Date(report.createdAt).toLocaleDateString("zh-CN")}
                {report.isPaid ? " · 已解锁" : " · 未解锁"}
              </div>
            </div>
            <span className="text-white/20 text-sm">→</span>
          </div>
        </button>
      ))}

      {/* Settings */}
      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <h3 className="text-green-200/70 text-sm font-medium mb-3">设置</h3>
        <div className="space-y-1 text-sm text-white/40">
          <div className="py-2">🔊 白噪音（右上角开关）</div>
          <button
            onClick={() => {
              localStorage.clear();
              setReports([]);
            }}
            className="py-2 hover:text-white/60 transition-colors block w-full text-left"
          >
            🗑 清除本地缓存
          </button>
          <div className="py-2">ℹ️ 关于 Forest Journey</div>
          <div className="py-2">🔒 隐私政策</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `app/(public)/profile/page.tsx`**

```typescript
"use client";

import HistoryList from "@/components/profile/HistoryList";

export default function ProfilePage() {
  return (
    <main className="min-h-screen px-6 pt-12 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
          🌿
        </div>
        <div>
          <h1 className="text-white/70 font-medium">未登录</h1>
          <p className="text-white/20 text-xs mt-0.5">注册以永久保存报告</p>
        </div>
      </div>

      <HistoryList />
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/profile/HistoryList.tsx app/"(public)"/profile/page.tsx
git commit -m "feat: add profile page with localStorage history list and settings"
```

---

## Phase 9: API Route

### Task 20: Create /api/report route

**Files:**
- Create: `app/api/report/route.ts`

- [ ] **Step 1: Write `app/api/report/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { nlpFallback } from "@/lib/nlp-fallback";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { animal1Text, animal2Text, animal2Feeling } = body;

    if (!animal1Text || !animal2Text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      // No API key configured — use fallback directly
      return NextResponse.json(nlpFallback(animal1Text, animal2Text, animal2Feeling || ""));
    }

    // Try OpenAI
    try {
      const prompt = `Analyze the following descriptions of two animals encountered in a forest. Return a JSON object with these fields:
- animal1Name: the name of the first animal
- animal1Category: one of "herbivore_gentle", "predator_solitary", "social", or "unknown"
- animal2Name: the name of the second animal
- animal2Category: one of "herbivore_gentle", "predator_solitary", "social", or "unknown"
- animal1Sentiment: one of "positive", "neutral", or "negative" (tone of the description)
- animal2Sentiment: one of "positive", "neutral", or "negative"

Animal 1 description: "${animal1Text}"
Animal 2 description: "${animal2Text}"
First feeling toward animal 2: "${animal2Feeling || "not specified"}"

Return ONLY valid JSON, no other text.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          // Try to parse JSON from response
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            return NextResponse.json(parsed);
          }
        }
      }
    } catch {
      // OpenAI failed — fall through to regex fallback
    }

    // Fallback to regex
    return NextResponse.json(nlpFallback(animal1Text, animal2Text, animal2Feeling || ""));
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `.env.local` with placeholder**

```bash
echo "OPENAI_API_KEY=" > .env.local
```

- [ ] **Step 3: Commit**

```bash
git add app/api/report/route.ts .env.local
git commit -m "feat: add /api/report route with OpenAI NLP and regex fallback"
```

---

## Phase 10: Prisma Schema & Database Setup

### Task 21: Write Prisma schema

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatarUrl String?  @map("avatar_url")
  createdAt DateTime @default(now()) @map("created_at")

  assessments Assessment[]
  reports     Report[]

  @@map("users")
}

model Assessment {
  id         String   @id @default(cuid())
  userId     String?  @map("user_id")
  status     String   @default("in_progress") // in_progress | completed
  startedAt  DateTime @default(now()) @map("started_at")
  finishedAt DateTime? @map("finished_at")

  user    User?    @relation(fields: [userId], references: [id])
  answers Answer[]
  reports Report[]

  @@map("assessments")
}

model Answer {
  id           String @id @default(cuid())
  assessmentId String @map("assessment_id")
  sceneCode    String @map("scene_code") // S1, S2A, S2B, S3, S4
  answerType   String @map("answer_type") // text, choice, slider
  content      Json

  assessment Assessment @relation(fields: [assessmentId], references: [id])

  @@map("answers")
}

model Report {
  id           String @id @default(cuid())
  assessmentId String @map("assessment_id")
  userId       String? @map("user_id")
  roleTitle    String @map("role_title")
  cardImageUrl String? @map("card_image_url")
  fullReport   Json   @map("full_report_content")
  dimensions   Json   @map("dimensions_score")
  isPaid       Boolean @default(false) @map("is_paid")
  createdAt    DateTime @default(now()) @map("created_at")

  assessment Assessment @relation(fields: [assessmentId], references: [id])
  user       User?      @relation(fields: [userId], references: [id])

  @@map("reports")
}
```

- [ ] **Step 2: Install Prisma and generate client**

```bash
npm install prisma @prisma/client
npx prisma generate
```

- [ ] **Step 3: Add DATABASE_URL to `.env.local`**

```bash
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/forest_journey" >> .env.local
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Prisma schema for users, assessments, answers, reports"
```

---

## Phase 11: Integration & Polish

### Task 22: End-to-end flow verification and responsive testing

- [ ] **Step 1: Test complete user flow**

```bash
npm run dev
# Manually test:
# 1. Homepage loads with particles + gate
# 2. Click "开启心灵之旅" → meditation page with breath glow
# 3. Wait or skip → assessment scene 1
# 4. Complete scene 1 (animal input + tags)
# 5. Complete scene 2 (tablecloth + stools)
# 6. Complete scene 3 (wall sliders + crossing)
# 7. Complete scene 4 (animal 2 + feeling)
# 8. See waiting animation → service card → click unlock → full report
# 9. Navigate to profile → see report in history
```

- [ ] **Step 2: Test responsive layout at mobile (375px) and desktop (1280px)**

```bash
# Use Chrome DevTools responsive mode to verify all pages render correctly
```

- [ ] **Step 3: Test error states**
  - Delete all localStorage → reload → profile should show empty state
  - Go directly to /result → should redirect to /
  - Go directly to /assessment → should load fresh assessment
  - Toggle audio on/off → verify button updates

- [ ] **Step 4: Commit any fixes and finalize**

```bash
git add -A
git commit -m "chore: final integration fixes and responsive polish"
```

### Task 23: Update PROJECT_STATUS.md

- [ ] **Step 1: Update `PROJECT_STATUS.md`**

```markdown
# Forest Journey — 项目状态

> 最后更新：2026-06-02

## 当前阶段

**MVP 开发完成 ✓**

## 整体进度

| 阶段 | 状态 |
|---|---|
| Brainstorming / 需求对齐 | ✅ 完成 |
| 设计文档 | ✅ 完成 |
| 实现计划 | ✅ 完成 |
| Phase 1 MVP 开发 | ✅ 完成 |

## 已完成功能

- 首页（森林之门 + 粒子动画 + 白噪音）
- 冥想引导页（呼吸光晕 + 引导文字 + 倒计时）
- 4场景测评（动物1 → 桌子 → 墙 → 动物2）
- 映射引擎（13条规则，纯前端）
- NLP 实体抽取（OpenAI + 正则降级）
- 结果页（等待动画 → 免费卡片 → mock支付 → 完整报告）
- 个人中心（localStorage 历史报告）
- 6种报告模板

## 待做（后续迭代）

- 真实 Stripe 支付接入
- 语音输入 / TTS 引导语音
- 卡片图片下载与分享
- B端管理后台
- 用户注册/登录（NextAuth）
- Supabase 数据库接入
```

- [ ] **Step 2: Commit status update**

```bash
git add PROJECT_STATUS.md
git commit -m "docs: update PROJECT_STATUS with MVP completion status"
```

---

## Plan Self-Review

**1. Spec coverage check:**
- Route structure → Tasks 2, 8, 10, 11, 15, 18, 19
- 4 assessment scenes → Tasks 12, 13, 14, 15
- Mapping engine → Task 4 (with 14 test cases covering all 13 rules)
- NLP/API → Tasks 5, 20
- Report templates → Task 6 (6 templates)
- Result pages → Tasks 16, 17, 18
- Profile → Task 19
- State management → Task 2 (AssessmentContext, AudioContext)
- localStorage → Task 3
- Error handling → Embedded in each relevant component
- White noise → Task 8 (ForestLayout)
- Animations → Used throughout (Framer Motion)

**2. Placeholder scan:**
- All steps have concrete code, no TBD/TODO
- `public/audio/forest-ambient.mp3` is a placeholder file — acceptable since audio is optional and handled gracefully
- `.env.local` contains placeholder values — acceptable, real values are user-provided

**3. Type consistency:**
- `AssessmentAnswers` defined in Task 2 types.ts, used consistently across all scene components
- `DimensionScores` used in mapping-engine (Task 4), templates (Task 6), FullReport (Task 17)
- `NLPResult` used in mapping-engine (Task 4), nlp-fallback (Task 5), and API route (Task 20)
- `ReportData` used in storage (Task 3) and result page (Task 18)
- All imports reference `@/lib/types` consistently
- `getAnimalIllustration` imported from `@/lib/animals` consistently
