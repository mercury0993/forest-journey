"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AssessmentAnswers, Scene1Answer, Scene2Answer, Scene3Answer, Scene4Answer } from "@/lib/types";

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
    try {
      localStorage.setItem("fj_current_assessment", JSON.stringify(newAnswers));
    } catch { /* storage full */ }
  };

  const setScene1 = (answer: Scene1Answer) => updateAndSave({ ...answers, scene1: answer });
  const setScene2 = (answer: Scene2Answer) => updateAndSave({ ...answers, scene2: answer });
  const setScene3 = (answer: Scene3Answer) => updateAndSave({ ...answers, scene3: answer });
  const setScene4 = (answer: Scene4Answer) => updateAndSave({ ...answers, scene4: answer });

  const goToScene = (scene: SceneIndex) => setCurrentScene(scene);

  const restoreFromStorage = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem("fj_current_assessment");
      if (raw) {
        setAnswers(JSON.parse(raw));
        return true;
      }
    } catch { /* ignore */ }
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
