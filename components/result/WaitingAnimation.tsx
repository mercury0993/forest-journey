"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
  onComplete?: () => void;
}

export default function WaitingAnimation({ onComplete }: Props) {
  useEffect(() => {
    if (!onComplete) return;
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
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

      <motion.p
        className="text-green-200/60 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        你的心灵画卷正在展开……
      </motion.p>

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
