"use client";

import { motion } from "framer-motion";

export default function BreathGlow() {
  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <motion.div
        className="absolute w-full h-full rounded-full bg-green-500/10"
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-3/4 h-3/4 rounded-full bg-green-400/20"
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
      />
      <motion.div
        className="absolute w-1/2 h-1/2 rounded-full bg-green-300/40"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
    </div>
  );
}
