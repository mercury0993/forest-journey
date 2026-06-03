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
      <div className="bg-gradient-to-b from-[#0d1f14] to-[#081208] border-2 border-green-800/50 rounded-2xl p-8 text-center shadow-2xl shadow-green-900/20">
        <motion.div
          className="text-7xl mb-4"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {illustration.emoji}
        </motion.div>

        <p className="text-green-400/50 text-xs tracking-[0.2em] uppercase mb-2">
          服务者原型
        </p>

        <h2 className="text-2xl font-bold text-green-100 mb-1">
          {cardTitle}
        </h2>

        <p className="text-amber-200/80 text-lg font-medium mb-4">
          {roleTitle}
        </p>

        <div className="w-12 h-px bg-green-700/50 mx-auto my-4" />

        <p className="text-white/60 text-sm leading-relaxed">
          {cardInterpretation}
        </p>
      </div>

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
