"use client";

import { useState, useEffect } from "react";

interface ExportPreview {
  totalReports: number;
  totalMembers: number;
  columns: string[];
}

export default function ExportPage() {
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((d) => {
        setPreview({
          totalReports: d.totalReports || 0,
          totalMembers: d.totalMembers || 0,
          columns: ["原型", "共情", "规则", "韧性", "角色", "测评时间", "批次"],
        });
      });
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    const res = await fetch("/api/admin/export");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `team-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setDownloading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-green-100">报告导出</h1>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/30 text-xs mb-1">格式</p>
            <p className="text-white text-sm">CSV（Excel 兼容）</p>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-1">包含列</p>
            <div className="flex flex-wrap gap-1">
              {preview?.columns.map((c) => (
                <span key={c} className="px-2 py-0.5 rounded-full bg-white/[0.04] text-white/50 text-xs">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-1">记录数</p>
            <p className="text-white text-sm">{preview?.totalReports ?? "-"} 条测评</p>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-1">成员</p>
            <p className="text-white text-sm">{preview?.totalMembers ?? "-"} 人</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading || !preview || preview.totalReports === 0}
          className="px-5 py-2.5 rounded-lg bg-green-700 text-white text-sm hover:bg-green-600 disabled:opacity-30 transition-colors"
        >
          {downloading ? "下载中..." : "下载 CSV"}
        </button>

        {preview && preview.totalReports === 0 && (
          <p className="text-white/20 text-xs">暂无数据可导出</p>
        )}
      </div>
    </div>
  );
}
