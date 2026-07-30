import { useState } from "react";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import ComplaintForm from "./components/ComplaintForm";
import AnalyticsPage from "./pages/AnalyticsPage";
import CasesPage from "./pages/CasesPage";
import HistoryPage from "./pages/HistoryPage";
import ReportsPage from "./pages/ReportsPage";

import { analyzeStream } from "./services/api";

function saveToHistory(complaint, agentData) {
  const risk = agentData?.risk?.priority || "Medium";
  const category = agentData?.classification?.category || "Unknown";
  const entry = {
    id: `CP-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    complaint,
    category,
    risk,
    status: "New",
  };
  const prev = JSON.parse(localStorage.getItem("casepilot_history") || "[]");
  localStorage.setItem("casepilot_history", JSON.stringify([entry, ...prev]));
}

const agentInfo = [
  { key: "intake",         icon: "📝", label: "Intake",         color: "from-blue-500 to-cyan-500",     glow: "rgba(99,102,241,0.35)"  },
  { key: "classification", icon: "🏷️", label: "Classification", color: "from-violet-500 to-purple-500", glow: "rgba(139,92,246,0.35)"  },
  { key: "duplicate",      icon: "🔍", label: "Duplicate",       color: "from-pink-500 to-rose-500",     glow: "rgba(244,63,94,0.35)"   },
  { key: "evidence",       icon: "📄", label: "Evidence",        color: "from-amber-500 to-orange-500",  glow: "rgba(245,158,11,0.35)"  },
  { key: "risk",           icon: "⚠️", label: "Risk",            color: "from-red-500 to-pink-500",      glow: "rgba(239,68,68,0.35)"   },
  { key: "workflow",       icon: "🚦", label: "Workflow",        color: "from-emerald-500 to-teal-500",  glow: "rgba(16,185,129,0.35)"  },
];

const initStatuses = () => ({
  intake: "waiting", classification: "waiting", duplicate: "waiting",
  evidence: "waiting", risk: "waiting", workflow: "waiting",
});

function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-600/8 blur-[80px] animate-float" style={{ animationDelay: "1s" }} />
    </div>
  );
}

// ── Shared mini components ────────────────────────────────────────────────────
function Label({ children }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{children}</p>;
}
function Value({ children, color = "text-white" }) {
  return <p className={`text-xs font-bold truncate ${color}`}>{children || "—"}</p>;
}
function MiniBar({ pct, color }) {
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
      <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── 1. Intake ─────────────────────────────────────────────────────────────────
function IntakeResult({ data }) {
  return (
    <div className="space-y-2">
      {/* Big amount highlight */}
      <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2 flex items-center justify-between">
        <div>
          <Label>Amount Lost</Label>
          <p className="font-display text-xl font-bold text-blue-300">{data.amount ? `₹${data.amount}` : "—"}</p>
        </div>
        <div className="text-right">
          <Label>Bank</Label>
          <Value>{data.bank_name}</Value>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/5 px-2.5 py-2">
          <Label>Fraud Type</Label>
          <Value color="text-cyan-300">{data.fraud_type}</Value>
        </div>
        <div className="rounded-xl bg-white/5 px-2.5 py-2">
          <Label>Channel</Label>
          <Value>{data.transaction_channel}</Value>
        </div>
      </div>
      <div className="rounded-xl bg-white/5 px-2.5 py-1.5">
        <Label>Transaction Date</Label>
        <Value>{data.transaction_date}</Value>
      </div>
    </div>
  );
}

// ── 2. Classification ─────────────────────────────────────────────────────────
function ClassificationResult({ data }) {
  const conf = Math.round((data.classification_confidence || 0) * 100);
  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-3 py-2">
        <Label>Fraud Category</Label>
        <p className="text-sm font-bold text-violet-300 truncate">{data.category || "—"}</p>
      </div>
      <div className="rounded-xl bg-white/5 px-2.5 py-2">
        <Label>Routed To</Label>
        <Value color="text-purple-300">{data.assigned_department}</Value>
      </div>
      <div className="rounded-xl bg-white/5 px-2.5 py-2">
        <div className="flex justify-between items-center">
          <Label>AI Confidence</Label>
          <span className="text-[10px] font-bold font-mono-jet text-violet-400">{conf}%</span>
        </div>
        <MiniBar pct={conf} color="from-violet-500 to-purple-400" />
      </div>
    </div>
  );
}

// ── 3. Duplicate ──────────────────────────────────────────────────────────────
function DuplicateResult({ data }) {
  const score = Math.round((data.duplicate_score || 0) * 100);
  const isDup = data.is_duplicate;
  return (
    <div className="space-y-2">
      {/* Big verdict */}
      <div className={`rounded-xl px-3 py-2 border flex items-center gap-3 ${
        isDup ? "bg-rose-500/10 border-rose-500/30" : "bg-emerald-500/10 border-emerald-500/30"
      }`}>
        <span className="text-2xl">{isDup ? "⚠️" : "✅"}</span>
        <div>
          <Label>Verdict</Label>
          <p className={`text-sm font-display font-bold ${isDup ? "text-rose-300" : "text-emerald-300"}`}>
            {isDup ? "Duplicate Found" : "Unique Case"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/5 px-2.5 py-2">
          <Label>Similar Case</Label>
          <Value color="text-rose-300">{data.similar_case || "None"}</Value>
        </div>
        <div className="rounded-xl bg-white/5 px-2.5 py-2">
          <div className="flex justify-between"><Label>Similarity</Label><span className="text-[10px] font-bold font-mono-jet text-rose-400">{score}%</span></div>
          <MiniBar pct={score} color="from-pink-500 to-rose-400" />
        </div>
      </div>
    </div>
  );
}

// ── 4. Evidence ───────────────────────────────────────────────────────────────
function EvidencePieChart({ provided, missing }) {
  const total = provided + missing;
  if (total === 0) return null;
  const providedPct = (provided / total) * 100;
  // SVG donut: r=16, circumference = 2*PI*16 ≈ 100.5
  const C = 100.5;
  const providedDash = (providedPct / 100) * C;
  const missingDash  = C - providedDash;
  return (
    <div className="flex items-center gap-3">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        {/* Missing — amber */}
        <circle cx="22" cy="22" r="16" fill="none" stroke="#f59e0b" strokeWidth="6"
          strokeDasharray={`${missingDash} ${C}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          className="transition-all duration-1000"
        />
        {/* Provided — emerald */}
        <circle cx="22" cy="22" r="16" fill="none" stroke="#10b981" strokeWidth="6"
          strokeDasharray={`${providedDash} ${C}`}
          strokeDashoffset={`-${missingDash}`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
          className="transition-all duration-1000"
        />
        <text x="22" y="26" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">{Math.round(providedPct)}%</text>
      </svg>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-400">Provided <span className="text-emerald-400 font-bold">{provided}</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-400">Missing <span className="text-amber-400 font-bold">{missing}</span></span>
        </div>
      </div>
    </div>
  );
}

function EvidenceResult({ data }) {
  const [uploads, setUploads] = useState({});
  const ok      = data.evidence_status === "Sufficient";
  const missing = data.missing_items || [];
  // Assume total evidence items = missing + some provided (estimate provided as 3 base)
  const provided = Math.max(3, 8 - missing.length);

  const handleFile = (item, e) => {
    const file = e.target.files?.[0];
    if (file) setUploads((p) => ({ ...p, [item]: file.name }));
  };

  return (
    <div className="space-y-2">
      {/* Status + Pie chart row */}
      <div className={`rounded-xl px-3 py-2 border flex items-center justify-between gap-2 ${
        ok ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
      }`}>
        <div>
          <Label>Evidence Status</Label>
          <p className={`text-sm font-display font-bold ${ok ? "text-emerald-300" : "text-amber-300"}`}>
            {ok ? "✅" : "⚠️"} {data.evidence_status}
          </p>
        </div>
        <EvidencePieChart provided={provided} missing={missing.length} />
      </div>

      {/* Missing items with upload */}
      {missing.length > 0 && (
        <div className="space-y-1">
          <Label>Upload Missing Documents (Optional)</Label>
          {missing.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-lg bg-amber-500/5 border border-amber-500/15 px-2 py-1.5">
              <span className="text-amber-500 text-[9px] font-bold w-3 flex-shrink-0">{i + 1}</span>
              <span className="text-slate-300 text-[10px] flex-1 truncate">{item}</span>
              <label className="flex-shrink-0 cursor-pointer">
                <input type="file" className="hidden" onChange={(e) => handleFile(item, e)} />
                {uploads[item] ? (
                  <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">✓ {uploads[item].slice(0, 8)}…</span>
                ) : (
                  <span className="text-[9px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full hover:bg-amber-500/20 transition-all">+ Upload</span>
                )}
              </label>
            </div>
          ))}
          {missing.length > 3 && (
            <p className="text-slate-600 text-[10px] pl-1">+{missing.length - 3} more items</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── 5. Risk ───────────────────────────────────────────────────────────────────
function RiskResult({ data }) {
  const score = data.risk_score || 0;
  const pCfg = {
    Critical: { text: "text-red-300",     bg: "bg-red-500/10",     border: "border-red-500/30",     bar: "from-red-500 to-rose-400",     emoji: "🔴" },
    High:     { text: "text-orange-300",  bg: "bg-orange-500/10",  border: "border-orange-500/30",  bar: "from-orange-500 to-amber-400", emoji: "🟠" },
    Medium:   { text: "text-yellow-300",  bg: "bg-yellow-500/10",  border: "border-yellow-500/30",  bar: "from-yellow-500 to-amber-300", emoji: "🟡" },
    Low:      { text: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "from-emerald-500 to-teal-400", emoji: "🟢" },
  };
  const c = pCfg[data.priority] || pCfg.Low;
  return (
    <div className="space-y-2">
      {/* Score + priority side by side */}
      <div className={`rounded-xl px-3 py-2 border ${c.bg} ${c.border} flex items-center justify-between`}>
        <div>
          <Label>Risk Score</Label>
          <p className={`font-display text-2xl font-bold ${c.text}`}>{score}<span className="text-slate-600 text-xs">/100</span></p>
        </div>
        <div className="text-right">
          <Label>Priority</Label>
          <p className={`text-sm font-display font-bold ${c.text}`}>{c.emoji} {data.priority}</p>
        </div>
      </div>
      <MiniBar pct={score} color={c.bar} />
      <div className="rounded-xl bg-white/5 px-2.5 py-2">
        <Label>⚡ Recommended Action</Label>
        <p className="text-slate-300 text-[10px] leading-4 line-clamp-2">{data.recommended_action}</p>
      </div>
    </div>
  );
}

// ── 6. Workflow ───────────────────────────────────────────────────────────────
function WorkflowResult({ data }) {
  const statusColor = data.workflow_status?.includes("Escalat") ? "text-orange-300" :
                      data.workflow_status?.includes("Resolv")  ? "text-emerald-300" : "text-blue-300";
  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 flex items-center justify-between">
        <div>
          <Label>Status</Label>
          <p className={`text-sm font-display font-bold ${statusColor}`}>{data.workflow_status}</p>
        </div>
        <div className="text-right">
          <Label>SLA</Label>
          <Value color="text-teal-300">{data.sla}</Value>
        </div>
      </div>
      <div className="rounded-xl bg-white/5 px-2.5 py-2">
        <Label>Closure Status</Label>
        <Value color="text-slate-300">{data.closure_status}</Value>
      </div>
      <div className="rounded-xl bg-white/5 px-2.5 py-2">
        <Label>⚡ Next Action</Label>
        <p className="text-slate-300 text-[10px] leading-4 line-clamp-2">{data.next_action}</p>
      </div>
    </div>
  );
}

const resultMap = {
  intake: (d) => <IntakeResult data={d} />,
  classification: (d) => <ClassificationResult data={d} />,
  duplicate: (d) => <DuplicateResult data={d} />,
  evidence: (d) => <EvidenceResult data={d} />,
  risk: (d) => <RiskResult data={d} />,
  workflow: (d) => <WorkflowResult data={d} />,
};

// ── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({ info, status, logs, data }) {
  const isDone    = status === "done";
  const isRunning = status === "running";
  return (
    <div
      className={`rounded-2xl p-3 flex flex-col transition-all duration-500 h-full
        ${isDone ? "glass-bright border border-white/10" : "glass border border-white/5"}
        ${isRunning ? "border-indigo-500/40" : ""}
      `}
      style={isDone ? { boxShadow: `0 0 28px ${info.glow}` } : isRunning ? { boxShadow: "0 0 16px rgba(99,102,241,0.15)" } : {}}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all duration-500
          ${isDone ? `bg-gradient-to-br ${info.color}` : "bg-white/5"} ${isRunning ? "animate-pulse" : ""}`}
          style={isDone ? { boxShadow: `0 4px 12px ${info.glow}` } : {}}>
          {info.icon}
        </div>
        <p className={`font-display font-bold text-xs flex-1 min-w-0 ${isDone ? "text-white" : isRunning ? "text-slate-300" : "text-slate-600"}`}>
          {info.label} Agent
        </p>
        {isDone    && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex-shrink-0">✓ Done</span>}
        {isRunning && <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />}
        {!isDone && !isRunning && <span className="text-[9px] text-slate-700 flex-shrink-0">Waiting</span>}
      </div>

      {/* Divider */}
      {isDone && <div className={`h-px bg-gradient-to-r ${info.color} opacity-20 mb-2.5`} />}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isDone && data && resultMap[info.key]?.(data)}
        {isRunning && (
          <div className="space-y-1.5 pt-1">
            {logs.slice(-4).map((log, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-[10px] font-mono-jet ${
                i === Math.min(logs.length, 4) - 1 ? "text-amber-300" : "text-slate-600"
              }`}>
                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${
                  i === Math.min(logs.length, 4) - 1 ? "bg-amber-400 animate-pulse" : "bg-slate-700"
                }`} />
                {log}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="flex items-center gap-2 text-slate-600 text-[10px] font-mono-jet">
                <div className="w-3 h-3 border border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin" />
                Initializing agent...
              </div>
            )}
          </div>
        )}
        {!isDone && !isRunning && (
          <div className="flex flex-col items-center justify-center h-full gap-1 opacity-30">
            <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-slate-600 text-xs">○</div>
            <p className="text-slate-700 text-[10px]">In queue</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onEnter }) {
  return (
    <div className="bg-animated" style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Orbs />
      <div className="relative z-10 flex-shrink-0 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm animate-float">🤖</div>
          <span className="font-display text-xl font-bold shimmer-text">CasePilot</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Banking Fraud Investigation
        </div>

        <h1 className="font-display text-7xl font-bold leading-none mb-5 animate-fade-up">
          <span className="shimmer-text">Case</span><span className="text-white">Pilot</span>
        </h1>

        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-8 mb-3 animate-fade-up delay-100">
          An AI-powered multi-agent system that investigates banking fraud complaints in real time.
        </p>

        <p className="text-slate-500 text-sm max-w-xl mx-auto leading-7 mb-8 animate-fade-up delay-200">
          Submit your complaint and watch <strong className="text-white">6 specialized AI agents</strong> — Intake, Classification,
          Duplicate Detection, Evidence, Risk & Workflow — each analyze it sequentially and reveal findings live.
        </p>

        {/* Agent pipeline */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-up delay-200">
          {agentInfo.map((a, i) => (
            <div key={a.key} className="flex items-center gap-2">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-xl animate-float`}
                style={{ animationDelay: `${i * 0.2}s`, boxShadow: `0 6px 20px ${a.glow}` }}>
                {a.icon}
              </div>
              {i < agentInfo.length - 1 && <span className="text-slate-700 font-bold">→</span>}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-10 animate-fade-up delay-300">
          {[{ value: "6", label: "AI Agents", icon: "🤖" }, { value: "Real-Time", label: "Processing", icon: "⚡" }, { value: "Multi-Lingual", label: "Support", icon: "🌐" }].map((s) => (
            <div key={s.label} className="glass-bright rounded-2xl px-5 py-3 text-center">
              <p className="text-xl mb-0.5">{s.icon}</p>
              <p className="font-display font-bold shimmer-text">{s.value}</p>
              <p className="text-slate-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onEnter}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white font-display font-bold text-xl hover:scale-105 transition-all duration-300 animate-gradient-x animate-fade-up delay-300"
          style={{ boxShadow: "0 8px 40px rgba(99,102,241,0.5)" }}
        >
          🚀 Launch Investigation
        </button>
        <p className="text-slate-600 text-xs mt-3 animate-fade-up delay-400">No login required · Free to use</p>
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
function DashboardPage({ onHome, initialComplaint, onNavigate }) {
  const [loading,   setLoading]   = useState(false);
  const [statuses,  setStatuses]  = useState(initStatuses());
  const [agentData, setAgentData] = useState({});
  const [agentLogs, setAgentLogs] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [complaint, setComplaint] = useState("");

  const done = Object.values(statuses).filter((s) => s === "done").length;
  const pct  = Math.round((done / agentInfo.length) * 100);

  const [pendingComplaint] = useState(initialComplaint || null);

  const handleAnalyze = (text) => {
    setComplaint(text);
    setSubmitted(true);
    setLoading(true);
    setStatuses(initStatuses());
    setAgentData({});
    setAgentLogs({});
    const finalData = {};
    analyzeStream(text, {
      onAgentStart: (key) => setStatuses((p) => ({ ...p, [key]: "running" })),
      onAgentLog:   (key, log) => setAgentLogs((p) => ({ ...p, [key]: [...(p[key] || []), log] })),
      onAgentDone:  (key, data) => {
        setStatuses((p) => ({ ...p, [key]: "done" }));
        setAgentData((p) => ({ ...p, [key]: data }));
        finalData[key] = data;
      },
      onComplete: () => { setLoading(false); saveToHistory(text, finalData); },
      onError: (err) => { console.error(err); alert("Backend connection failed."); setLoading(false); },
    });
  };

  const handleReset = () => {
    setSubmitted(false); setComplaint(""); setLoading(false);
    setStatuses(initStatuses()); setAgentData({}); setAgentLogs({});
  };

  return (
    <div className="bg-animated" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Orbs />

      <Navbar currentPage="dashboard" onNavigate={(p) => p === "landing" ? onHome() : onNavigate?.(p)} />

      <div className="relative z-10 flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>

        {/* LEFT: Form + agent status */}
        <div className="w-[360px] flex-shrink-0 flex flex-col border-r border-white/8 px-5 py-5 overflow-hidden">
          <div className="mb-4">
            <h2 className="font-display text-xl font-bold text-white">Submit Complaint</h2>
            <p className="text-slate-500 text-xs mt-0.5">6 AI agents will investigate live</p>
          </div>

          <div className="flex-1 space-y-1.5 mb-3 overflow-hidden">
            {agentInfo.map((a) => {
              const s = statuses[a.key];
              return (
                <div key={a.key} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-500 ${
                  s === "done" ? "glass border border-white/8" :
                  s === "running" ? "glass border border-indigo-500/30 bg-indigo-500/5" : "opacity-30"
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all duration-500 ${
                    s === "done" ? `bg-gradient-to-br ${a.color}` : s === "running" ? "bg-white/10 animate-pulse" : "bg-white/5"
                  }`} style={s === "done" ? { boxShadow: `0 3px 10px ${a.glow}` } : {}}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${s === "done" ? "text-white" : s === "running" ? "text-slate-300" : "text-slate-600"}`}>{a.label} Agent</p>
                    {s === "running" && agentLogs[a.key]?.length > 0 && (
                      <p className="text-[10px] text-amber-400 font-mono-jet truncate animate-pulse">{agentLogs[a.key][agentLogs[a.key].length - 1]}</p>
                    )}
                  </div>
                  {s === "done"    && <span className="text-emerald-400 text-xs font-mono-jet">✓</span>}
                  {s === "running" && <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {submitted && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-mono-jet">Pipeline</span>
                <span className="font-display font-bold shimmer-text">{pct}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="progress-bar" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <ComplaintForm onAnalyze={handleAnalyze} loading={loading} initialValue={initialComplaint || ""} />

          {submitted && (
            <button onClick={handleReset} className="mt-2 w-full py-2 rounded-xl glass border border-white/10 text-slate-500 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold">
              ↺ New Complaint
            </button>
          )}
        </div>

        {/* RIGHT: Dashboard */}
        <div className="flex-1 flex flex-col px-5 py-5 overflow-hidden" style={{ minWidth: 0 }}>
          {!submitted ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="flex gap-3 mb-5">
                {agentInfo.map((a, i) => (
                  <div key={a.key} className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-xl animate-float opacity-25`}
                    style={{ animationDelay: `${i * 0.3}s` }}>{a.icon}</div>
                ))}
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">Investigation Dashboard</h2>
              <p className="text-slate-600 text-sm max-w-xs leading-6">Submit a complaint on the left to start. Each agent's result will appear here as it completes.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">🔬 Investigation Dashboard</h2>
                  <p className="text-slate-500 text-xs truncate max-w-md mt-0.5">"{complaint}"</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold shimmer-text">{done}<span className="text-slate-600 text-sm">/6</span></p>
                  <p className="text-slate-600 text-xs">agents done</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-3 min-h-0">
                {agentInfo.map((info) => (
                  <AgentCard key={info.key} info={info} status={statuses[info.key]} logs={agentLogs[info.key] || []} data={agentData[info.key]} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shell (pages with Navbar) ─────────────────────────────────────────────────
function AppShell({ page, setPage, reopenComplaint, setReopenComplaint }) {
  return (
    <div className="bg-animated" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Orbs />
      <Navbar currentPage={page} onNavigate={setPage} />
      <div className="relative z-10 flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {page === "analytics" && <AnalyticsPage />}
        {page === "cases"     && <CasesPage />}
        {page === "history"   && (
          <HistoryPage onReopen={(c) => { setReopenComplaint(c); setPage("dashboard"); }} />
        )}
        {page === "reports"   && <ReportsPage />}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [reopenComplaint, setReopenComplaint] = useState(null);

  const innerPages = ["analytics", "cases", "history", "reports"];

  return (
    <>
      {page === "landing" && <LandingPage onEnter={() => setPage("dashboard")} />}
      {page === "dashboard" && (
        <DashboardPage
          onHome={() => setPage("landing")}
          onNavigate={setPage}
          initialComplaint={reopenComplaint}
          key={reopenComplaint}
        />
      )}
      {innerPages.includes(page) && (
        <AppShell page={page} setPage={setPage}
          reopenComplaint={reopenComplaint}
          setReopenComplaint={setReopenComplaint}
        />
      )}
      <Chatbot />
    </>
  );
}
