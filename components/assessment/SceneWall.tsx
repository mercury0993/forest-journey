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
