"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface InviteCode {
  id: string;
  code: string;
  label: string | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function InviteCodesPage() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  const fetchCodes = useCallback(async () => {
    const res = await fetch("/api/admin/invite-codes");
    if (res.ok) {
      const data = await res.json();
      setCodes(data.codes);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch("/api/admin/invite-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, count }),
    });
    if (res.ok) {
      setLabel("");
      fetchCodes();
    }
    setGenerating(false);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-green-100">测评码管理</h1>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
        <h2 className="text-sm font-medium text-white/60 mb-4">批量生成</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs text-white/30 mb-1">批次标签</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="如：2026 校招-产品岗"
              className="w-48 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm placeholder-white/15 focus:outline-none focus:border-green-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-white/30 mb-1">数量</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={100}
              className="w-20 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-green-500/50"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 rounded-lg bg-green-700 text-white text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {generating ? "生成中..." : "生成"}
          </button>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-white/40 text-xs">
              <th className="text-left px-5 py-3 font-medium">邀请码</th>
              <th className="text-left px-5 py-3 font-medium">标签</th>
              <th className="text-left px-5 py-3 font-medium">使用</th>
              <th className="text-left px-5 py-3 font-medium">状态</th>
              <th className="text-left px-5 py-3 font-medium">创建时间</th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-white/20">暂无测评码</td>
              </tr>
            )}
            {codes.map((c) => (
              <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <Link href={`/admin/invite-codes/${c.id}`} className="text-green-300 hover:text-green-200 font-mono text-xs">
                    {c.code}
                  </Link>
                </td>
                <td className="px-5 py-3 text-white/50">{c.label || "-"}</td>
                <td className="px-5 py-3 text-white/50">{c.usedCount}/{c.maxUses}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs ${c.isActive ? "text-green-400" : "text-red-400"}`}>
                    {c.isActive ? "启用" : "停用"}
                  </span>
                </td>
                <td className="px-5 py-3 text-white/30 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
