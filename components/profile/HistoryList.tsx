"use client";

import { useState, useEffect } from "react";
import { getReports } from "@/lib/storage";
import { ReportData } from "@/lib/types";
import { getAnimalIllustration } from "@/lib/animals";
import FullReport from "@/components/result/FullReport";
import { useUser } from "@/context/UserContext";

interface CloudReport {
  id: string;
  roleTitle: string;
  fullReport: Record<string, unknown>;
  dimensions: Record<string, number>;
  isPaid: boolean;
  createdAt: string;
}

interface Props {
  cloudReports: CloudReport[];
  cloudLoading: boolean;
}

export default function HistoryList({ cloudReports, cloudLoading }: Props) {
  const { user } = useUser();
  const [localReports, setLocalReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [selectedCloudReport, setSelectedCloudReport] = useState<CloudReport | null>(null);

  useEffect(() => {
    setLocalReports(getReports());
  }, []);

  const handleSave = () => {};

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

  if (selectedCloudReport) {
    return (
      <div>
        <button
          onClick={() => setSelectedCloudReport(null)}
          className="mb-6 text-green-400/60 hover:text-green-400 text-sm transition-colors"
        >
          ← 返回列表
        </button>
        <FullReport
          report={selectedCloudReport.fullReport as {
            archetype: string;
            rules: string;
            encounter: string;
            prescription: string;
          }}
          scores={selectedCloudReport.dimensions as {
            empathy: number;
            rule: number;
            resilience: number;
            role: number;
          }}
          roleTitle={selectedCloudReport.roleTitle}
          onSave={handleSave}
        />
      </div>
    );
  }

  const hasCloudReports = cloudReports.length > 0;
  const hasLocalReports = localReports.length > 0;

  if (!hasCloudReports && !hasLocalReports) {
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
      {user && (
        <div className="mb-6">
          <h2 className="text-green-200/70 text-sm font-medium mb-3">云端报告</h2>
          {cloudLoading ? (
            <p className="text-white/20 text-sm">加载中...</p>
          ) : cloudReports.length === 0 ? (
            <p className="text-white/20 text-sm">暂无云端报告</p>
          ) : (
            <div className="space-y-3">
              {cloudReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedCloudReport(report)}
                  className="w-full text-left p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-green-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌿</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/80 font-medium truncate">{report.roleTitle}</div>
                      <div className="text-white/30 text-xs mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString("zh-CN")}
                        {report.isPaid ? " · 已解锁" : " · 未解锁"}
                      </div>
                    </div>
                    <span className="text-white/20 text-sm">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {hasLocalReports && (
        <div>
          <h2 className="text-green-200/70 text-sm font-medium mb-3">本地记录（本设备 · 最多5条）</h2>
          <div className="space-y-3">
            {localReports.map((report) => (
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
                    <div className="text-white/80 font-medium truncate">{report.cardTitle}</div>
                    <div className="text-white/30 text-xs mt-0.5">
                      {new Date(report.createdAt).toLocaleDateString("zh-CN")}
                      {report.isPaid ? " · 已解锁" : " · 未解锁"}
                    </div>
                  </div>
                  <span className="text-white/20 text-sm">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <h3 className="text-green-200/70 text-sm font-medium mb-3">设置</h3>
        <div className="space-y-1 text-sm text-white/40">
          <div className="py-2">🔊 白噪音（右上角开关）</div>
          <button
            onClick={() => {
              localStorage.clear();
              setLocalReports([]);
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
