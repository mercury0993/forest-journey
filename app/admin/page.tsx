"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ members: 0, reports: 0, codes: 0, models: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/team").then((r) => r.json()),
      fetch("/api/admin/invite-codes").then((r) => r.json()),
      fetch("/api/admin/role-models").then((r) => r.json()),
    ]).then(([team, codes, models]) => {
      setStats({
        members: team.totalMembers || 0,
        reports: team.totalReports || 0,
        codes: codes.codes?.length || 0,
        models: models.models?.length || 0,
      });
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-green-100">数据仪表盘</h1>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "团队成员", value: stats.members, href: "/admin/team-dashboard" },
          { label: "测评报告", value: stats.reports, href: "/admin/team-dashboard" },
          { label: "邀请码", value: stats.codes, href: "/admin/invite-codes" },
          { label: "岗位模型", value: stats.models, href: "/admin/role-models" },
        ].map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors">
            <p className="text-white/30 text-xs">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/team-dashboard"
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors">
          <p className="text-sm text-white/60">团队看板 →</p>
          <p className="text-white/30 text-xs mt-1">查看成员分布、四维统计</p>
        </Link>
        <Link href="/admin/invite-codes"
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors">
          <p className="text-sm text-white/60">测评码管理 →</p>
          <p className="text-white/30 text-xs mt-1">生成邀请码、追踪使用</p>
        </Link>
        <Link href="/admin/role-models"
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors">
          <p className="text-sm text-white/60">岗位模型 →</p>
          <p className="text-white/30 text-xs mt-1">定义理想画像、匹配候选人</p>
        </Link>
        <Link href="/admin/export"
          className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors">
          <p className="text-sm text-white/60">报告导出 →</p>
          <p className="text-white/30 text-xs mt-1">下载 CSV 团队报告</p>
        </Link>
      </div>
    </div>
  );
}
