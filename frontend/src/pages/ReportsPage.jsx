import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// ── Data helpers ──────────────────────────────────────────────────────────────
function getHistory() {
  const stored = localStorage.getItem("casepilot_history");
  if (stored) return JSON.parse(stored);
  const mock = [
    { id: "CP-2024-001", date: "2024-12-01", complaint: "Unauthorized UPI transfer of ₹45,000 from my SBI account to an unknown number. I never initiated this transaction.", category: "UPI Fraud",        risk: "High",     status: "Resolved",  amount: "₹45,000",   officer: "Priya Sharma"  },
    { id: "CP-2024-002", date: "2024-12-02", complaint: "Received a phishing link via SMS claiming to be from HDFC Bank. Clicked it and lost ₹1,20,000 from my savings account.", category: "Phishing",         risk: "Critical", status: "In Review", amount: "₹1,20,000", officer: "Rahul Mehta"   },
    { id: "CP-2024-003", date: "2024-12-03", complaint: "My debit card was skimmed at an ATM near Connaught Place. ₹8,500 was withdrawn without my knowledge.", category: "Card Skimming",    risk: "Medium",   status: "Resolved",  amount: "₹8,500",    officer: "Anita Rao"     },
    { id: "CP-2024-004", date: "2024-11-28", complaint: "My account was taken over via OTP fraud. The fraudster transferred ₹2,50,000 to multiple accounts.", category: "Account Takeover", risk: "Critical", status: "In Review", amount: "₹2,50,000", officer: "Vikram Singh"  },
    { id: "CP-2024-005", date: "2024-11-29", complaint: "A fake loan app charged ₹75,000 in hidden processing fees and then disappeared from the Play Store.", category: "Loan Fraud",       risk: "High",     status: "New",       amount: "₹75,000",   officer: "Neha Patel"    },
    { id: "CP-2024-006", date: "2024-11-20", complaint: "My KYC documents were misused to open a fraudulent bank account in my name without my consent.", category: "KYC Fraud",        risk: "Low",      status: "Resolved",  amount: "₹12,000",   officer: "Priya Sharma"  },
  ];
  localStorage.setItem("casepilot_history", JSON.stringify(mock));
  return mock;
}

const RISK_CFG = {
  Critical: { color: "#ef4444", bg: "bg-red-500/10",    border: "border-red-500/30",    glow: "rgba(239,68,68,0.3)",    score: 88, emoji: "🔴" },
  High:     { color: "#f97316", bg: "bg-orange-500/10", border: "border-orange-500/30", glow: "rgba(249,115,22,0.3)",   score: 72, emoji: "🟠" },
  Medium:   { color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/30", glow: "rgba(234,179,8,0.3)",    score: 52, emoji: "🟡" },
  Low:      { color: "#10b981", bg: "bg-emerald-500/10",border: "border-emerald-500/30",glow: "rgba(16,185,129,0.3)",   score: 28, emoji: "🟢" },
};

const STATUS_CFG = {
  "Resolved":  { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "✅" },
  "In Review": { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   icon: "🔍" },
  "New":       { color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/30",    icon: "🆕" },
};

const AGENT_RESULTS = [
  { key: "intake",         icon: "📝", label: "Intake",         color: "#6366f1", summary: "Complaint parsed successfully. Fraud type identified, transaction details extracted and normalized." },
  { key: "classification", icon: "🏷️", label: "Classification", color: "#8b5cf6", summary: "Case classified under financial fraud. Routed to Cyber Crime Cell with high priority flag." },
  { key: "duplicate",      icon: "🔍", label: "Duplicate",       color: "#f43f5e", summary: "No duplicate found in the system. Case is unique and has been assigned a fresh case ID." },
  { key: "evidence",       icon: "📄", label: "Evidence",        color: "#f59e0b", summary: "2 of 5 required documents provided. Bank statement and transaction screenshot are missing." },
  { key: "risk",           icon: "⚠️", label: "Risk",            color: "#ef4444", summary: "Risk score computed. Priority level assigned. Immediate escalation recommended." },
  { key: "workflow",       icon: "🚦", label: "Workflow",        color: "#10b981", summary: "Case assigned to officer. SLA of 72 hours set. Status updated to In Review." },
];

// ── Risk Gauge (SVG semicircle) ───────────────────────────────────────────────
function RiskGauge({ score, color }) {
  const R = 52, cx = 70, cy = 70;
  const C = Math.PI * R; // semicircle circumference
  const filled = (score / 100) * C;
  const angle = -180 + (score / 100) * 180;
  const needleX = cx + R * Math.cos((angle * Math.PI) / 180);
  const needleY = cy + R * Math.sin((angle * Math.PI) / 180);
  return (
    <svg width="140" height="80" viewBox="0 0 140 80">
      {/* Track */}
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
      {/* Fill */}
      <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${filled} ${C}`}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke="white" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
      <circle cx={cx} cy={cy} r="4" fill={color} />
      {/* Labels */}
      <text x="18" y="78" fontSize="8" fill="#475569">0</text>
      <text x="66" y="22" fontSize="8" fill="#475569">50</text>
      <text x="116" y="78" fontSize="8" fill="#475569">100</text>
      {/* Score */}
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">{score}</text>
    </svg>
  );
}

// ── Evidence donut ────────────────────────────────────────────────────────────
function EvidenceDonut({ provided = 3, total = 5 }) {
  const missing = total - provided;
  const data = [
    { name: "Provided", value: provided, color: "#10b981" },
    { name: "Missing",  value: missing,  color: "#f59e0b" },
  ];
  return (
    <div className="flex items-center gap-3">
      <ResponsiveContainer width={64} height={64}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={20} outerRadius={30} dataKey="value" strokeWidth={0} paddingAngle={2}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            <span className="text-[10px] text-slate-400">{d.name}: <span className="font-bold text-white">{d.value}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Agent Timeline ────────────────────────────────────────────────────────────
function AgentTimeline() {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/60 via-purple-500/40 to-emerald-500/60" />
      <div className="space-y-3">
        {AGENT_RESULTS.map((a, i) => (
          <div key={a.key} className="flex items-start gap-4 pl-1">
            {/* Dot */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10"
              style={{ background: `${a.color}22`, border: `2px solid ${a.color}`, boxShadow: `0 0 8px ${a.color}60` }}>
              {a.icon}
            </div>
            {/* Content */}
            <div className="flex-1 glass rounded-xl px-3 py-2 border border-white/8">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-white">{a.label} Agent</span>
                <span className="text-[10px] text-emerald-400 font-bold">✓ Complete</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-4">{a.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Report Preview ────────────────────────────────────────────────────────────
function ReportPreview({ c }) {
  const rc = RISK_CFG[c.risk] || RISK_CFG.Low;
  const sc = STATUS_CFG[c.status] || STATUS_CFG["New"];

  return (
    <div className="space-y-5 text-sm">

      {/* ── Report Header ── */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 p-5"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 50%, rgba(16,185,129,0.08) 100%)" }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="font-display text-lg font-bold text-white">CasePilot Investigation Report</p>
                <p className="text-slate-400 text-[11px]">AI-Powered Fraud Analysis System</p>
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">Generated: {new Date().toLocaleString("en-IN")}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-indigo-400 font-bold text-lg">{c.id}</p>
            <p className="text-slate-500 text-xs">{c.date}</p>
            <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.border} ${sc.color}`}>
              {sc.icon} {c.status}
            </span>
          </div>
        </div>
      </div>

      {/* ── Case Info + Risk Gauge ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Info cards */}
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {[
            { label: "Fraud Category", value: c.category,        icon: "🏷️" },
            { label: "Amount Lost",    value: c.amount || "N/A", icon: "💰" },
            { label: "Assigned To",   value: c.officer || "TBD", icon: "👤" },
            { label: "Filed Date",    value: c.date,             icon: "📅" },
          ].map((f) => (
            <div key={f.label} className="glass rounded-xl px-3 py-2.5 border border-white/8 flex items-center gap-2.5">
              <span className="text-lg">{f.icon}</span>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{f.label}</p>
                <p className="text-xs font-bold text-white mt-0.5">{f.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Risk gauge */}
        <div className={`glass rounded-xl p-3 border ${rc.border} flex flex-col items-center justify-center`}
          style={{ boxShadow: `0 0 20px ${rc.glow}` }}>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Risk Score</p>
          <RiskGauge score={rc.score} color={rc.color} />
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border mt-1 ${rc.bg} ${rc.border}`}
            style={{ color: rc.color }}>{rc.emoji} {c.risk} Risk</span>
        </div>
      </div>

      {/* ── Complaint text ── */}
      <div className="glass rounded-xl px-4 py-3 border border-white/8">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <span>📋</span> Complaint Description
        </p>
        <p className="text-slate-300 text-xs leading-5 italic">"{c.complaint}"</p>
      </div>

      {/* ── Evidence + Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 border border-white/8">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">📄 Evidence</p>
          <EvidenceDonut provided={3} total={5} />
        </div>
        {[
          { label: "AI Confidence",   value: "94%",    color: "#6366f1", icon: "🎯" },
          { label: "Processing Time", value: "9.0s",   color: "#10b981", icon: "⚡" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-3 border border-white/8 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">{s.icon}</span>
            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Agent Timeline ── */}
      <div className="glass rounded-xl p-4 border border-white/8">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🤖</span> Agent Analysis Pipeline
        </p>
        <AgentTimeline />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-2 border-t border-white/8">
        <p className="text-[10px] text-slate-600">CasePilot · AI-Powered Fraud Investigation · Confidential</p>
        <p className="text-[10px] text-slate-600 font-mono">{c.id} · {new Date().toLocaleDateString("en-IN")}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [history]  = useState(getHistory);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef(null);

  const handleExport = async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, { backgroundColor: "#0d1b3e", scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, Math.min(pdfH, pdf.internal.pageSize.getHeight()));
      pdf.save(`${selected.id}_CasePilot_Report.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const rc = selected ? RISK_CFG[selected.risk] : null;

  return (
    <div className="flex-1 overflow-hidden flex flex-col px-6 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            📄 <span className="shimmer-text">Report</span> Generator
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Select a case · Preview · Download as PDF</p>
        </div>
        {selected && (
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
            {exporting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
              : <><span>⬇</span> Download PDF</>}
          </button>
        )}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── Case Selector ── */}
        <div className="w-60 flex-shrink-0 flex flex-col gap-2 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1 flex-shrink-0">Select Case</p>
          {history.map((c) => {
            const rc2 = RISK_CFG[c.risk] || RISK_CFG.Low;
            const sc2 = STATUS_CFG[c.status] || STATUS_CFG["New"];
            const isSelected = selected?.id === c.id;
            return (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`text-left rounded-xl px-3 py-3 border transition-all duration-200 hover:scale-[1.02] ${
                  isSelected ? "glass-bright border-indigo-500/50" : "glass border-white/8 hover:border-white/20"
                }`}
                style={isSelected ? { boxShadow: "0 0 16px rgba(99,102,241,0.25)" } : {}}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-mono text-indigo-400 text-[11px] font-bold">{c.id}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
                    style={{ color: rc2.color, borderColor: `${rc2.color}40`, background: `${rc2.color}15` }}>
                    {c.risk}
                  </span>
                </div>
                <p className="text-white text-xs font-semibold truncate">{c.category}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-slate-600 text-[10px]">{c.date}</p>
                  <span className={`text-[9px] font-semibold ${sc2.color}`}>{sc2.icon} {c.status}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Preview Panel ── */}
        <div className="flex-1 overflow-y-auto glass-bright rounded-2xl border border-white/8 p-5" style={{ scrollbarWidth: "thin" }}>
          {selected ? (
            <div ref={previewRef}>
              <ReportPreview c={selected} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-20 h-20 rounded-3xl glass border border-white/10 flex items-center justify-center text-4xl opacity-30">📄</div>
              <div>
                <p className="text-white font-display font-bold text-lg opacity-40">No Case Selected</p>
                <p className="text-slate-600 text-sm mt-1">Pick a case from the left panel to preview its full investigation report</p>
              </div>
              <div className="flex gap-2 mt-2">
                {["📝","🏷️","🔍","📄","⚠️","🚦"].map((icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-xl glass border border-white/8 flex items-center justify-center text-base opacity-20"
                    style={{ animationDelay: `${i * 0.15}s` }}>{icon}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
