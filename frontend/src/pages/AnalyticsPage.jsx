import { useEffect, useRef, useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell, PieChart, Pie, Tooltip,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  Label,
} from "recharts";

// ── Data ──────────────────────────────────────────────────────────────────────
const MONTHLY = [
  { month: "Jan", cases: 12, resolved: 9,  escalated: 3  },
  { month: "Feb", cases: 19, resolved: 14, escalated: 5  },
  { month: "Mar", cases: 15, resolved: 13, escalated: 2  },
  { month: "Apr", cases: 27, resolved: 20, escalated: 7  },
  { month: "May", cases: 22, resolved: 18, escalated: 4  },
  { month: "Jun", cases: 34, resolved: 26, escalated: 8  },
  { month: "Jul", cases: 29, resolved: 24, escalated: 5  },
  { month: "Aug", cases: 41, resolved: 33, escalated: 8  },
  { month: "Sep", cases: 38, resolved: 30, escalated: 8  },
  { month: "Oct", cases: 45, resolved: 38, escalated: 7  },
  { month: "Nov", cases: 52, resolved: 44, escalated: 8  },
  { month: "Dec", cases: 48, resolved: 41, escalated: 7  },
];

const RISK_DIST = [
  { name: "Critical", value: 18, color: "#ef4444" },
  { name: "High",     value: 34, color: "#f97316" },
  { name: "Medium",   value: 67, color: "#eab308" },
  { name: "Low",      value: 89, color: "#10b981" },
];

const FRAUD_TYPES = [
  { type: "UPI Fraud",        Q1: 28, Q2: 35, Q3: 42, Q4: 38 },
  { type: "Phishing",         Q1: 18, Q2: 22, Q3: 19, Q4: 25 },
  { type: "Card Skimming",    Q1: 14, Q2: 11, Q3: 16, Q4: 13 },
  { type: "Account Takeover", Q1: 22, Q2: 28, Q3: 31, Q4: 29 },
  { type: "Loan Fraud",       Q1: 9,  Q2: 14, Q3: 12, Q4: 17 },
  { type: "KYC Fraud",        Q1: 7,  Q2: 9,  Q3: 11, Q4: 8  },
];

const AGENT_RADAR = [
  { agent: "Intake",         accuracy: 97, speed: 88, confidence: 95 },
  { agent: "Classification", accuracy: 94, speed: 78, confidence: 91 },
  { agent: "Duplicate",      accuracy: 91, speed: 72, confidence: 88 },
  { agent: "Evidence",       accuracy: 96, speed: 82, confidence: 93 },
  { agent: "Risk",           accuracy: 93, speed: 85, confidence: 90 },
  { agent: "Workflow",       accuracy: 98, speed: 94, confidence: 97 },
];

const AGENT_COLORS = {
  Intake: "#6366f1", Classification: "#8b5cf6", Duplicate: "#f43f5e",
  Evidence: "#f59e0b", Risk: "#ef4444", Workflow: "#10b981",
};

const HEATMAP_CATS = ["UPI Fraud", "Phishing", "Card Skimming", "Account Takeover", "Loan Fraud", "KYC Fraud"];
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const KPI = [
  { label: "Total Cases",    value: 208,   suffix: "",   icon: "📁", color: "from-indigo-500 to-blue-500",    glow: "rgba(99,102,241,0.3)"   },
  { label: "Resolved",       value: 174,   suffix: "",   icon: "✅", color: "from-emerald-500 to-teal-500",   glow: "rgba(16,185,129,0.3)"   },
  { label: "Avg Risk Score", value: 62,    suffix: "/100",icon: "⚠️", color: "from-amber-500 to-orange-500",  glow: "rgba(245,158,11,0.3)"   },
  { label: "Fraud Detected", value: 94,    suffix: "%",  icon: "🎯", color: "from-violet-500 to-purple-500",  glow: "rgba(139,92,246,0.3)"   },
  { label: "Avg Time",       value: 9,     suffix: "s",  icon: "⚡", color: "from-cyan-500 to-sky-500",       glow: "rgba(6,182,212,0.3)"    },
  { label: "Active Agents",  value: 6,     suffix: "",   icon: "🤖", color: "from-pink-500 to-rose-500",      glow: "rgba(244,63,94,0.3)"    },
];

// ── Animated counter ──────────────────────────────────────────────────────────
function useCounter(target, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function KpiCard({ item, delay }) {
  const count = useCounter(item.value, 1600);
  return (
    <div
      className="glass-bright rounded-2xl p-4 flex flex-col gap-2 border border-white/10 hover:scale-[1.03] transition-all duration-300 cursor-default"
      style={{ boxShadow: `0 0 24px ${item.glow}`, animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{item.icon}</span>
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.color} animate-pulse`} />
      </div>
      <div>
        <p className="font-display text-3xl font-bold text-white">
          {count}<span className="text-slate-500 text-base font-normal">{item.suffix}</span>
        </p>
        <p className="text-slate-400 text-xs mt-0.5">{item.label}</p>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000`}
          style={{ width: `${(item.value / 208) * 100}%` }} />
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-bright rounded-xl px-3 py-2 border border-white/15 shadow-xl text-xs">
      <p className="font-bold text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap() {
  const [tooltip, setTooltip] = useState(null);
  const cells = useMemo(() =>
    HEATMAP_CATS.map(() => HEATMAP_DAYS.map(() => Math.floor(Math.random() * 22 + 1))), []);
  const max = Math.max(...cells.flat());

  return (
    <div className="relative">
      {/* Day headers */}
      <div className="flex gap-2 mb-2 ml-32">
        {HEATMAP_DAYS.map((d) => (
          <div key={d} className="flex-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      {/* Rows */}
      {HEATMAP_CATS.map((cat, ci) => (
        <div key={cat} className="flex items-center gap-2 mb-2">
          <span className="text-[11px] text-slate-400 w-32 flex-shrink-0 font-medium truncate">{cat}</span>
          {HEATMAP_DAYS.map((day, di) => {
            const v = cells[ci][di];
            const intensity = v / max;
            const bg = intensity > 0.75 ? "#ef4444" : intensity > 0.5 ? "#f97316" : intensity > 0.25 ? "#eab308" : "#10b981";
            return (
              <div key={di} className="flex-1 h-8 rounded-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 relative"
                style={{ background: `${bg}`, opacity: 0.15 + intensity * 0.85, boxShadow: intensity > 0.6 ? `0 0 8px ${bg}60` : "none" }}
                onMouseEnter={() => setTooltip({ cat, day, v })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 ml-32">
        <span className="text-[10px] text-slate-600">Low</span>
        {["#10b981","#eab308","#f97316","#ef4444"].map((c) => (
          <div key={c} className="w-6 h-3 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-[10px] text-slate-600">High</span>
      </div>
      {/* Floating tooltip */}
      {tooltip && (
        <div className="fixed z-50 pointer-events-none glass-bright border border-white/20 rounded-xl px-3 py-2 text-xs shadow-2xl"
          style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
          <p className="font-bold text-white">{tooltip.cat}</p>
          <p className="text-slate-400">{tooltip.day}: <span className="text-white font-bold">{tooltip.v} cases</span></p>
        </div>
      )}
    </div>
  );
}

// ── Donut center label ────────────────────────────────────────────────────────
function DonutLabel({ viewBox, total }) {
  const { cx, cy } = viewBox;
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize={22} fontWeight="bold">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize={10}>Total</text>
    </>
  );
}

// ── Resolution rate sparkline ─────────────────────────────────────────────────
const RESOLUTION_TREND = MONTHLY.map((m) => ({
  month: m.month,
  rate: Math.round((m.resolved / m.cases) * 100),
}));

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const total = RISK_DIST.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6" style={{ scrollbarWidth: "thin" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            📊 <span className="shimmer-text">Analytics</span> Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time fraud investigation intelligence · FY 2024</p>
        </div>
        <div className="glass-bright rounded-xl px-4 py-2 border border-indigo-500/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-semibold">Live Data</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-6 gap-3">
        {KPI.map((k, i) => <KpiCard key={k.label} item={k} delay={i * 80} />)}
      </div>

      {/* Row 1: Area chart + Donut */}
      <div className="grid grid-cols-3 gap-4">

        {/* Area chart — spans 2 cols */}
        <div className="col-span-2 glass-bright rounded-2xl p-5 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-bold text-white">📈 Monthly Case Volume & Resolution</p>
              <p className="text-slate-500 text-xs mt-0.5">Cases filed vs resolved vs escalated</p>
            </div>
            <div className="flex gap-3 text-[10px]">
              {[["#6366f1","Cases"],["#10b981","Resolved"],["#f43f5e","Escalated"]].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gEscalated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cases"     stroke="#6366f1" strokeWidth={2} fill="url(#gCases)"     dot={false} />
              <Area type="monotone" dataKey="resolved"  stroke="#10b981" strokeWidth={2} fill="url(#gResolved)"  dot={false} />
              <Area type="monotone" dataKey="escalated" stroke="#f43f5e" strokeWidth={2} fill="url(#gEscalated)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — 1 col */}
        <div className="glass-bright rounded-2xl p-5 border border-white/8 flex flex-col">
          <p className="font-display font-bold text-white mb-1">🎯 Risk Distribution</p>
          <p className="text-slate-500 text-xs mb-3">Cases by severity level</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={RISK_DIST} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {RISK_DIST.map((d) => <Cell key={d.name} fill={d.color} />)}
                  <Label content={<DonutLabel total={total} />} position="center" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-1">
              {RISK_DIST.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[10px] text-slate-400">{d.name}</span>
                  <span className="text-[10px] font-bold text-white ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Grouped bar + Radar */}
      <div className="grid grid-cols-2 gap-4">

        {/* Grouped bar — fraud types by quarter */}
        <div className="glass-bright rounded-2xl p-5 border border-white/8">
          <p className="font-display font-bold text-white mb-1">📊 Fraud Type Breakdown by Quarter</p>
          <p className="text-slate-500 text-xs mb-4">Quarterly case count per fraud category</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={FRAUD_TYPES} margin={{ top: 0, right: 10, left: -20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="type" tick={{ fill: "#64748b", fontSize: 9 }} angle={-25} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Q1" fill="#6366f1" radius={[3,3,0,0]} maxBarSize={12} />
              <Bar dataKey="Q2" fill="#8b5cf6" radius={[3,3,0,0]} maxBarSize={12} />
              <Bar dataKey="Q3" fill="#06b6d4" radius={[3,3,0,0]} maxBarSize={12} />
              <Bar dataKey="Q4" fill="#10b981" radius={[3,3,0,0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-1">
            {[["#6366f1","Q1"],["#8b5cf6","Q2"],["#06b6d4","Q3"],["#10b981","Q4"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </div>

        {/* Radar — agent performance */}
        <div className="glass-bright rounded-2xl p-5 border border-white/8">
          <p className="font-display font-bold text-white mb-1">🤖 Agent Performance Radar</p>
          <p className="text-slate-500 text-xs mb-2">Accuracy · Speed · Confidence per agent</p>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={AGENT_RADAR} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="agent" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[60, 100]} tick={{ fill: "#475569", fontSize: 8 }} />
              <Radar name="Accuracy"   dataKey="accuracy"   stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
              <Radar name="Speed"      dataKey="speed"      stroke="#10b981" fill="#10b981" fillOpacity={0.10} strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} />
              <Radar name="Confidence" dataKey="confidence" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.10} strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center">
            {[["#6366f1","Accuracy"],["#10b981","Speed"],["#f59e0b","Confidence"]].map(([c,l]) => (
              <span key={l} className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Resolution rate line + Heatmap */}
      <div className="grid grid-cols-3 gap-4">

        {/* Resolution rate */}
        <div className="glass-bright rounded-2xl p-5 border border-white/8">
          <p className="font-display font-bold text-white mb-1">✅ Resolution Rate Trend</p>
          <p className="text-slate-500 text-xs mb-4">Monthly % of cases resolved</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={RESOLUTION_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} fill="url(#gRate)"
                dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Heatmap — spans 2 cols */}
        <div className="col-span-2 glass-bright rounded-2xl p-5 border border-white/8">
          <p className="font-display font-bold text-white mb-1">🗓️ Complaint Category Heatmap</p>
          <p className="text-slate-500 text-xs mb-4">Case intensity by fraud type × day of week</p>
          <Heatmap />
        </div>
      </div>

      {/* Row 4: Agent cards */}
      <div className="glass-bright rounded-2xl p-5 border border-white/8">
        <p className="font-display font-bold text-white mb-4">⚡ Agent Processing Stats</p>
        <div className="grid grid-cols-6 gap-3">
          {[
            { key: "Intake",         icon: "📝", ms: 1200, acc: 97, color: "#6366f1" },
            { key: "Classification", icon: "🏷️", ms: 1800, acc: 94, color: "#8b5cf6" },
            { key: "Duplicate",      icon: "🔍", ms: 2100, acc: 91, color: "#f43f5e" },
            { key: "Evidence",       icon: "📄", ms: 1600, acc: 96, color: "#f59e0b" },
            { key: "Risk",           icon: "⚠️", ms: 1400, acc: 93, color: "#ef4444" },
            { key: "Workflow",       icon: "🚦", ms: 900,  acc: 98, color: "#10b981" },
          ].map((a) => (
            <div key={a.key} className="glass rounded-xl p-3 border border-white/8 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: `${a.color}22`, boxShadow: `0 0 12px ${a.color}40` }}>
                  {a.icon}
                </div>
                <span className="text-[11px] font-bold text-white truncate">{a.key}</span>
              </div>
              {/* Accuracy arc */}
              <div className="flex justify-center mb-2">
                <svg width="60" height="34" viewBox="0 0 60 34">
                  <path d="M 5 30 A 25 25 0 0 1 55 30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 5 30 A 25 25 0 0 1 55 30" fill="none" stroke={a.color} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${(a.acc / 100) * 78.5} 78.5`} style={{ filter: `drop-shadow(0 0 4px ${a.color})` }} />
                  <text x="30" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">{a.acc}%</text>
                </svg>
              </div>
              <p className="text-center text-[10px] text-slate-500 font-mono">{a.ms}ms avg</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
