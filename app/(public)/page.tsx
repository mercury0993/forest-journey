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
