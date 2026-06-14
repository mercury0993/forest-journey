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

interface CodeUser {
  email: string | null;
  userId: string;
  createdAt: string;
  report: {
    roleTitle: string;
    dimensions: { empathy: number; rule: number; resilience: number; role: number };
    reportCreatedAt: string;
  } | null;
}

export default function InviteCodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [code, setCode] = useState<CodeDetail | null>(null);
  const [users, setUsers] = useState<CodeUser[]>([]);

  useEffect(() => {
    fetch(`/api/admin/invite-codes?id=${id}&users=true`)
      .then((r) => r.json())
      .then((d) => {
        setCode(d.code);
        setUsers(d.users || []);
      })
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

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-white/40 text-xs">
              <th className="text-left px-4 py-3 font-medium">邮箱</th>
              <th className="text-left px-4 py-3 font-medium">原型</th>
              <th className="text-left px-4 py-3 font-medium">共情</th>
              <th className="text-left px-4 py-3 font-medium">规则</th>
              <th className="text-left px-4 py-3 font-medium">韧性</th>
              <th className="text-left px-4 py-3 font-medium">角色</th>
              <th className="text-left px-4 py-3 font-medium">测评时间</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-white/20">暂无使用者</td></tr>
            )}
            {users.map((u) => (
              <tr key={u.userId} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white/50 text-xs">{u.email || "-"}</td>
                <td className="px-4 py-3 text-white/70">{u.report?.roleTitle || "-"}</td>
                <td className="px-4 py-3 text-white/50">{u.report?.dimensions.empathy ?? "-"}</td>
                <td className="px-4 py-3 text-white/50">{u.report?.dimensions.rule ?? "-"}</td>
                <td className="px-4 py-3 text-white/50">{u.report?.dimensions.resilience ?? "-"}</td>
                <td className="px-4 py-3 text-white/50">{u.report?.dimensions.role ?? "-"}</td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {u.report ? new Date(u.report.reportCreatedAt).toLocaleDateString("zh-CN") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
