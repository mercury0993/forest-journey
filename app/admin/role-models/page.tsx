"use client";

import { useState, useEffect, useMemo } from "react";

interface RoleModel {
  id: string;
  name: string;
  empathy: number;
  rule: number;
  resilience: number;
  role: number;
}

interface Candidate {
  roleTitle: string;
  dimensions: { empathy: number; rule: number; resilience: number; role: number };
  score: number;
}

function MiniRadar({ empathy, rule, resilience, role, size = 80, highlight }: {
  empathy: number; rule: number; resilience: number; role: number;
  size?: number; highlight?: { empathy: number; rule: number; resilience: number; role: number };
}) {
  const dims = [
    { key: "empathy" as const, label: "共" },
    { key: "rule" as const, label: "规" },
    { key: "resilience" as const, label: "韧" },
    { key: "role" as const, label: "角" },
  ];
  const cx = size / 2; const cy = size / 2; const r = size / 2 - 12;
  const centerAngle = -Math.PI / 2;
  const angleStep = (2 * Math.PI) / dims.length;

  const points = dims.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    const value = { empathy, rule, resilience, role }[dims[i].key] / 100;
    return { x: cx + r * value * Math.cos(angle), y: cy + r * value * Math.sin(angle) };
  });

  const highlightPoints = highlight ? dims.map((_, i) => {
    const angle = centerAngle + i * angleStep;
    const value = highlight[dims[i].key] / 100;
    return { x: cx + r * value * Math.cos(angle), y: cy + r * value * Math.sin(angle) };
  }) : null;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[120px] mx-auto">
      {[0.5, 1].map((level) => {
        const pts = dims.map((_, i) => {
          const a = centerAngle + i * angleStep;
          return `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`;
        }).join(" ");
        return <polygon key={level} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />;
      })}
      <path
        d={points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"}
        fill="rgba(74, 138, 74, 0.2)" stroke="rgba(132, 200, 132, 0.5)" strokeWidth="1"
      />
      {highlightPoints && (
        <path
          d={highlightPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"}
          fill="rgba(251, 191, 36, 0.15)" stroke="rgba(251, 191, 36, 0.6)" strokeWidth="1" strokeDasharray="2 2"
        />
      )}
      {dims.map((d, i) => (
        <text key={d.key} x={cx + (r + 8) * Math.cos(centerAngle + i * angleStep)} y={cy + (r + 8) * Math.sin(centerAngle + i * angleStep)} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.25)" fontSize="7">
          {d.label}
        </text>
      ))}
    </svg>
  );
}

export default function RoleModelsPage() {
  const [models, setModels] = useState<RoleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [matchModel, setMatchModel] = useState<RoleModel | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [empathy, setEmpathy] = useState(50);
  const [rule, setRule] = useState(50);
  const [resilience, setResilience] = useState(50);
  const [role, setRole] = useState(50);
  const [saving, setSaving] = useState(false);

  const fetchModels = async () => {
    const res = await fetch("/api/admin/role-models");
    if (res.ok) {
      const d = await res.json();
      setModels(d.models);
    }
    setLoading(false);
  };

  useEffect(() => { fetchModels(); }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/role-models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), empathy, rule, resilience, role }),
    });
    if (res.ok) {
      setName(""); setEmpathy(50); setRule(50); setResilience(50); setRole(50);
      setShowForm(false);
      fetchModels();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/role-models?id=${id}`, { method: "DELETE" });
    fetchModels();
    if (matchModel?.id === id) setMatchModel(null);
  };

  const handleMatch = async (model: RoleModel) => {
    setMatchModel(model);
    setMatchLoading(true);
    const res = await fetch("/api/admin/team");
    if (res.ok) {
      const d = await res.json();
      const list: Candidate[] = (d.reports || []).map((r: any) => {
        const dims = r.dimensions || { empathy: 0, rule: 0, resilience: 0, role: 0 };
        const dEmp = dims.empathy - model.empathy;
        const dRule = dims.rule - model.rule;
        const dRes = dims.resilience - model.resilience;
        const dRole = dims.role - model.role;
        const dist = Math.sqrt(dEmp * dEmp + dRule * dRule + dRes * dRes + dRole * dRole);
        const score = Math.max(0, Math.round(100 - dist));
        return { roleTitle: r.roleTitle, dimensions: dims, score };
      });
      list.sort((a, b) => b.score - a.score);
      setCandidates(list);
    }
    setMatchLoading(false);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-green-100">岗位模型</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 rounded-lg bg-green-700 text-white text-sm hover:bg-green-600 transition-colors"
        >
          {showForm ? "取消" : "新建岗位"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <div className="flex gap-6 flex-wrap">
            <div className="flex-1 min-w-48 space-y-4">
              <input
                type="text" placeholder="岗位名称" value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white text-sm placeholder-white/15 focus:outline-none focus:border-green-500/50"
              />
              {([
                { key: "empathy", label: "共情", val: empathy, set: setEmpathy },
                { key: "rule", label: "规则", val: rule, set: setRule },
                { key: "resilience", label: "韧性", val: resilience, set: setResilience },
                { key: "role", label: "角色", val: role, set: setRole },
              ] as const).map((d) => (
                <div key={d.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/40">{d.label}</span>
                    <span className="text-white/60">{d.val}</span>
                  </div>
                  <input type="range" min={0} max={100} value={d.val}
                    onChange={(e) => d.set(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/[0.1] accent-green-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center w-40">
              <MiniRadar empathy={empathy} rule={rule} resilience={resilience} role={role} size={120} />
            </div>
          </div>
          <button
            onClick={handleSave} disabled={saving || !name.trim()}
            className="mt-4 px-4 py-2 rounded-lg bg-green-700 text-white text-sm hover:bg-green-600 disabled:opacity-30 transition-colors"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      )}

      {models.length === 0 && !showForm && (
        <p className="text-white/20 text-sm text-center py-12">暂无岗位模型，点击"新建岗位"开始</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {models.map((m) => (
          <div key={m.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-green-100 font-medium">{m.name}</h3>
                <div className="mt-2 space-y-0.5">
                  {(["empathy", "rule", "resilience", "role"] as const).map((k) => (
                    <span key={k} className="text-white/30 text-xs mr-3">{k === "empathy" ? "共" : k === "rule" ? "规" : k === "resilience" ? "韧" : "角"}: {m[k]}</span>
                  ))}
                </div>
              </div>
              <MiniRadar empathy={m.empathy} rule={m.rule} resilience={m.resilience} role={m.role} size={70} />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleMatch(m)}
                className="px-2 py-1 rounded bg-green-900/30 text-green-300 text-xs hover:bg-green-900/50 transition-colors"
              >
                {matchModel?.id === m.id ? "已选中" : "匹配候选人"}
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                className="px-2 py-1 rounded text-red-400/50 text-xs hover:text-red-400 hover:bg-red-900/10 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {matchModel && (
        <div className="bg-white/[0.03] border border-amber-800/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-amber-300">候选人匹配 — {matchModel.name}</h3>
            <button onClick={() => setMatchModel(null)} className="text-white/20 hover:text-white/40 text-xs">✕</button>
          </div>
          {matchLoading ? (
            <p className="text-white/30 text-sm text-center py-8">加载中...</p>
          ) : candidates.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-8">暂无可匹配的候选人</p>
          ) : (
            <div className="space-y-2">
              {candidates.map((c, i) => (
                <div key={i} className="flex items-center gap-4 py-2 border-b border-white/[0.03]">
                  <div className="w-12"><MiniRadar empathy={c.dimensions.empathy} rule={c.dimensions.rule} resilience={c.dimensions.resilience} role={c.dimensions.role} size={48} highlight={{ empathy: matchModel.empathy, rule: matchModel.rule, resilience: matchModel.resilience, role: matchModel.role }} /></div>
                  <span className="text-white/70 text-sm flex-1">{c.roleTitle}</span>
                  <span className="text-xs text-white/40">共{c.dimensions.empathy} 规{c.dimensions.rule} 韧{c.dimensions.resilience} 角{c.dimensions.role}</span>
                  <span className={`text-sm font-mono font-bold ${c.score >= 80 ? "text-green-400" : c.score >= 60 ? "text-amber-400" : "text-white/40"}`}>{c.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
