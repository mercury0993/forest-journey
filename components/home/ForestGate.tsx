"use client";

import { motion } from "framer-motion";

export default function ForestGate() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-radial from-green-500/10 via-green-700/5 to-transparent blur-3xl" />

      <motion.div
        className="relative"
        animate={{ filter: ["drop-shadow(0 0 15px rgba(74,138,74,0.3))", "drop-shadow(0 0 30px rgba(74,138,74,0.6))", "drop-shadow(0 0 15px rgba(74,138,74,0.3))"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-8xl select-none">🌳</div>
      </motion.div>

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

      <motion.div
        className="w-20 h-px my-6 bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      />

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
