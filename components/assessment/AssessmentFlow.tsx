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

  if (!hasRestored) {
    setHasRestored(true);
    restoreFromStorage();
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
    localStorage.setItem("fj_latest_answers", JSON.stringify({ ...answers, scene4: data }));
    router.push("/result");
  }, [setScene4, answers, router]);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <div className="fixed top-0 left-0 right-0 z-30 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-green-600 to-green-400"
          animate={{ width: `${((scene - 1) / 4) * 100}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

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
