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
