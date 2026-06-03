"use client";

import { useState, useEffect } from "react";
import { getReports } from "@/lib/storage";
import { ReportData } from "@/lib/types";
import { getAnimalIllustration } from "@/lib/animals";
import FullReport from "@/components/result/FullReport";

export default function HistoryList() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

  useEffect(() => {
    setReports(getReports());
  }, []);

  const handleSave = () => {
    // already saved when unlocked
  };

  if (selectedReport) {
    return (
      <div>
        <button
          onClick={() => setSelectedReport(null)}
          className="mb-6 text-green-400/60 hover:text-green-400 text-sm transition-colors"
        >
          ← 返回列表
        </button>
        <FullReport
          report={selectedReport.fullReport}
          scores={selectedReport.scores}
          roleTitle={selectedReport.roleTitle}
          onSave={handleSave}
        />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🌿</div>
        <p className="text-white/40">还没有测评记录</p>
        <p className="text-white/20 text-sm mt-2">完成一次测评后，报告会保存在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-green-200/70 text-sm font-medium mb-4">
        历史测评（本设备 · 最多5条）
      </h2>

      {reports.map((report) => (
        <button
          key={report.id}
          onClick={() => setSelectedReport(report)}
          className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-green-500/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {report.answers.scene1.animalName
                ? getAnimalIllustration(report.answers.scene1.animalName).emoji
                : "🌿"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-white/80 font-medium truncate">
                {report.cardTitle}
              </div>
              <div className="text-white/30 text-xs mt-0.5">
                {new Date(report.createdAt).toLocaleDateString("zh-CN")}
                {report.isPaid ? " · 已解锁" : " · 未解锁"}
              </div>
            </div>
            <span className="text-white/20 text-sm">→</span>
          </div>
        </button>
      ))}

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <h3 className="text-green-200/70 text-sm font-medium mb-3">设置</h3>
        <div className="space-y-1 text-sm text-white/40">
          <div className="py-2">🔊 白噪音（右上角开关）</div>
          <button
            onClick={() => {
              localStorage.clear();
              setReports([]);
            }}
            className="py-2 hover:text-white/60 transition-colors block w-full text-left"
          >
            🗑 清除本地缓存
          </button>
          <div className="py-2">ℹ️ 关于 Forest Journey</div>
          <div className="py-2">🔒 隐私政策</div>
        </div>
      </div>
    </div>
  );
}
