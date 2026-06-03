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
