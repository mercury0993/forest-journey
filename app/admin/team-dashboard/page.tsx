"use client";

import { useState, useEffect, useMemo } from "react";

interface TeamReport {
  id: string;
  roleTitle: string;
  dimensions: { empathy: number; rule: number; resilience: number; role: number };
  createdAt: string;
  inviteCode: string | null;
  batchLabel: string | null;
}

interface ByCode {
  code: string;
  label: string | null;
  reports: TeamReport[];
}

interface TeamData {
  totalMembers: number;
  totalReports: number;
  reports: TeamReport[];
  byCode: ByCode[];
}

type Tab = "overview" | "members" | "batches";

function RadarChart({ dimensions }: { dimensions: { empathy: number; rule: number; resilience: number; role: number } }) {
  const dims = [
    { key: "empathy", label: "共情" },
    { key: "rule", label: "规则" },
    { key: "resilience", label: "韧性" },
    { key: "role", label: "角色" },
  ] as const;

  const cx = 80;
  const cy = 80;
  const r = 60;
  const centerAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / dims.length;

  const points = dims.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    const value = (dimensions[dims[i].key] || 0) / 100;
    return { x: cx + r * value * Math.cos(angle), y: cy + r * value * Math.sin(angle) };
  });

  const axisPoints = dims.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 160 160" className="w-full max-w-[160px] mx-auto">
      {[0.25, 0.5, 0.75, 1].map((level) => {
        const pts = dims.map((_, i) => {
          const a = centerAngle + i * angleStep;
          return `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={level} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      <path d={pathData} fill="rgba(74, 138, 74, 0.25)" stroke="rgba(132, 200, 132, 0.6)" strokeWidth="1.5" />
      {axisPoints.map((p, i) => (
        <text key={i} x={cx + (r + 15) * Math.cos(centerAngle + i * angleStep)} y={cy + (r + 15) * Math.sin(centerAngle + i * angleStep)} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.4)" fontSize="8">
          {dims[i].label}
        </text>
      ))}
    </svg>
  );
}

export default function TeamDashboardPage() {
  const [data, setData] = useState<TeamData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [prototypeFilter, setPrototypeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const prototypeCounts = useMemo(() => {
    if (!data) return {};
    const counts: Record<string, number> = {};
    for (const r of data.reports) {
      counts[r.roleTitle] = (counts[r.roleTitle] || 0) + 1;
    }
    return counts;
  }, [data]);

  const avgDimensions = useMemo(() => {
    if (!data || data.reports.length === 0) return { empathy: 0, rule: 0, resilience: 0, role: 0 };
    const sum = { empathy: 0, rule: 0, resilience: 0, role: 0 };
    for (const r of data.reports) {
      sum.empathy += r.dimensions.empathy;
      sum.rule += r.dimensions.rule;
      sum.resilience += r.dimensions.resilience;
      sum.role += r.dimensions.role;
    }
    const n = data.reports.length;
    return { empathy: Math.round(sum.empathy / n), rule: Math.round(sum.rule / n), resilience: Math.round(sum.resilience / n), role: Math.round(sum.role / n) };
  }, [data]);

  const prototypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.reports.map((r) => r.roleTitle))];
  }, [data]);

  const filteredReports = useMemo(() => {
    if (!data) return [];
    let list = [...data.reports];
    if (prototypeFilter !== "all") {
      list = list.filter((r) => r.roleTitle === prototypeFilter);
    }
    list.sort((a, b) => {
      const aVal = sortKey === "createdAt" ? a.createdAt : a.dimensions[sortKey as keyof typeof a.dimensions] ?? 0;
      const bVal = sortKey === "createdAt" ? b.createdAt : b.dimensions[sortKey as keyof typeof b.dimensions] ?? 0;
      return sortDir === "desc" ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });
    return list;
  }, [data, prototypeFilter, sortKey, sortDir]);

  if (!data) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "概览" },
    { key: "members", label: "成员列表" },
    { key: "batches", label: "批次分组" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-green-100">团队看板</h1>
      </div>

      <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              tab === t.key ? "bg-green-900/40 text-green-300" : "text-white/40 hover:text-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-white/30 text-xs">成员总数</p>
              <p className="text-2xl font-bold text-white mt-1">{data.totalMembers}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-white/30 text-xs">测评总数</p>
              <p className="text-2xl font-bold text-white mt-1">{data.totalReports}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <p className="text-white/30 text-xs">邀请码批次</p>
              <p className="text-2xl font-bold text-white mt-1">{data.byCode.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-medium text-white/60 mb-4">原型分布</h3>
              {Object.entries(prototypeCounts).length === 0 ? (
                <p className="text-white/20 text-sm text-center py-8">暂无数据</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(prototypeCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([role, count]) => (
                      <div key={role} className="flex items-center gap-2">
                        <span className="text-white/50 text-xs w-24 truncate">{role}</span>
                        <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-700/50 rounded-full transition-all"
                            style={{ width: `${(count / data.reports.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-white/30 text-xs w-6 text-right">{count}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-medium text-white/60 mb-4">四维平均分</h3>
              {data.reports.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-8">暂无数据</p>
              ) : (
                <RadarChart dimensions={avgDimensions} />
              )}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/60 mb-4">最近测评</h3>
            {data.reports.slice(0, 5).length === 0 ? (
              <p className="text-white/20 text-sm text-center py-8">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {data.reports.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/[0.03] text-sm">
                    <span className="text-white/50">{r.roleTitle}</span>
                    <span className="text-white/20 text-xs">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-4">
          <div className="flex gap-3 items-center">
            <select
              value={prototypeFilter}
              onChange={(e) => setPrototypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/60 text-xs focus:outline-none focus:border-green-500/50"
            >
              <option value="all">全部原型</option>
              {prototypes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="text-white/20 text-xs">{filteredReports.length} 条记录</span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-white/40 text-xs">
                  {[
                    { key: "roleTitle", label: "原型" },
                    { key: "empathy", label: "共情" },
                    { key: "rule", label: "规则" },
                    { key: "resilience", label: "韧性" },
                    { key: "role", label: "角色" },
                    { key: "createdAt", label: "测评时间" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="text-left px-4 py-3 font-medium cursor-pointer hover:text-white/60"
                      onClick={() => {
                        if (sortKey === col.key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                        else { setSortKey(col.key); setSortDir("desc"); }
                      }}
                    >
                      {col.label} {sortKey === col.key ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 font-medium">批次</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-white/20">暂无数据</td></tr>
                )}
                {filteredReports.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/70">{r.roleTitle}</td>
                    <td className="px-4 py-3 text-white/50">{r.dimensions.empathy}</td>
                    <td className="px-4 py-3 text-white/50">{r.dimensions.rule}</td>
                    <td className="px-4 py-3 text-white/50">{r.dimensions.resilience}</td>
                    <td className="px-4 py-3 text-white/50">{r.dimensions.role}</td>
                    <td className="px-4 py-3 text-white/30 text-xs">{new Date(r.createdAt).toLocaleDateString("zh-CN")}</td>
                    <td className="px-4 py-3 text-white/30 text-xs">{r.batchLabel || r.inviteCode || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "batches" && (
        <div className="grid grid-cols-2 gap-4">
          {data.byCode.length === 0 && (
            <p className="text-white/20 text-sm col-span-2 text-center py-12">暂无批次数据</p>
          )}
          {data.byCode.map((bc) => (
            <div key={bc.code} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-green-300 font-mono text-sm">{bc.code}</h3>
              <p className="text-white/40 text-xs mt-1">{bc.label || "无标签"}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-white/30 text-xs">{bc.reports.length} 人</span>
              </div>
              {bc.reports.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {[...new Set(bc.reports.map((r) => r.roleTitle))].map((role) => (
                    <span key={role} className="px-2 py-0.5 rounded-full bg-green-900/20 text-green-300/70 text-xs">
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
