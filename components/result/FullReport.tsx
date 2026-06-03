"use client";

import { motion } from "framer-motion";
import { DimensionScores } from "@/lib/types";

interface Props {
  report: {
    archetype: string;
    rules: string;
    encounter: string;
    prescription: string;
  };
  scores: DimensionScores;
  roleTitle: string;
  onSave: () => void;
}

function RadarChart({ scores }: { scores: DimensionScores }) {
  const dimensions = [
    { key: "empathy", label: "共情" },
    { key: "rule", label: "规则" },
    { key: "resilience", label: "韧性" },
    { key: "role", label: "角色" },
  ] as const;

  const cx = 140;
  const cy = 140;
  const r = 100;
  const centerAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / dimensions.length;

  const points = dimensions.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    const value = scores[dimensions[i].key] / 100;
    return {
      x: cx + r * value * Math.cos(angle),
      y: cy + r * value * Math.sin(angle),
    };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const axisPoints = dimensions.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[280px] mx-auto">
      {gridLevels.map((level) => {
        const gridPoints = dimensions.map((_, i) => {
          const angle = centerAngle + i * angleStep;
          return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={gridPoints}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}

      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}

      <path d={pathData} fill="rgba(74, 138, 74, 0.3)" stroke="rgba(132, 200, 132, 0.7)" strokeWidth="2" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#84c884" />
      ))}

      {axisPoints.map((p, i) => {
        const labelR = r + 25;
        const angle = centerAngle + i * angleStep;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.6)" fontSize="13">
            {dimensions[i].label} {scores[dimensions[i].key]}
          </text>
        );
      })}
    </svg>
  );
}

export default function FullReport({ report, scores, roleTitle, onSave }: Props) {
  return (
    <motion.div
      className="max-w-lg mx-auto px-6 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-green-100 mb-2">{roleTitle}</h1>
        <p className="text-green-400/40 text-sm">你的完整心灵图谱</p>
      </div>

      <div className="mb-10">
        <RadarChart scores={scores} />
      </div>

      <div className="space-y-8">
        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-green-300 font-semibold mb-3">Part 1 · 你的服务者原型</h3>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {report.archetype}
          </div>
        </section>

        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-green-300 font-semibold mb-3">Part 2 · 你的规则感与边界</h3>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {report.rules}
          </div>
        </section>

        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-green-300 font-semibold mb-3">Part 3 · 你与他人的相遇</h3>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {report.encounter}
          </div>
        </section>

        <section className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
          <h3 className="text-green-300 font-semibold mb-3">Part 4 · 你的心灵处方</h3>
          <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
            {report.prescription}
          </div>
        </section>
      </div>

      <div className="mt-10 text-center space-y-3">
        <button
          onClick={onSave}
          className="px-6 py-2.5 rounded-full border border-white/10 text-white/50 text-sm hover:border-white/20 hover:text-white/70 transition-colors"
        >
          📥 保存到我的
        </button>
        <p className="text-white/10 text-xs">
          我的团队也想探索（企业入口即将开放）
        </p>
      </div>
    </motion.div>
  );
}
