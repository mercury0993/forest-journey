"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface CodeDetail {
  id: string;
  code: string;
  label: string | null;
  isActive: boolean;
  usedCount: number;
  maxUses: number;
  createdAt: string;
}

export default function InviteCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [code, setCode] = useState<CodeDetail | null>(null);

  useEffect(() => {
    fetch(`/api/admin/invite-codes?id=${id}`)
      .then((r) => r.json())
      .then((d) => setCode(d.code))
      .catch(() => router.push("/admin/invite-codes"));
  }, [id, router]);

  if (!code) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-white/30 hover:text-white/50 text-sm transition-colors">
        ← 返回列表
      </button>

      <div>
        <h1 className="text-lg font-bold text-green-100 font-mono">{code.code}</h1>
        <p className="text-white/40 text-sm mt-1">{code.label || "无标签"}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-xs mb-1">使用次数</p>
          <p className="text-white text-lg">{code.usedCount}/{code.maxUses}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-xs mb-1">状态</p>
          <p className={`text-lg ${code.isActive ? "text-green-400" : "text-red-400"}`}>
            {code.isActive ? "启用" : "停用"}
          </p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/30 text-xs mb-1">创建时间</p>
          <p className="text-white text-sm">{new Date(code.createdAt).toLocaleDateString("zh-CN")}</p>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center text-white/30 text-sm">
        使用者详情 — 后续子系统完善
      </div>
    </div>
  );
}
