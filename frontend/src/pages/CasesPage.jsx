import { useState } from "react";

const OFFICERS = ["Priya Sharma", "Rahul Mehta", "Anita Rao", "Vikram Singh", "Neha Patel"];
const RISK_COLOR = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/30",
  High:     "text-orange-400 bg-orange-500/10 border-orange-500/30",
  Medium:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
};

const INITIAL_CASES = {
  "New": [
    { id: "CP-2024-001", category: "UPI Fraud",        risk: "High",     officer: "Priya Sharma",  amount: "₹45,000",  date: "2024-12-01" },
    { id: "CP-2024-002", category: "Phishing",         risk: "Critical", officer: "Rahul Mehta",   amount: "₹1,20,000", date: "2024-12-02" },
    { id: "CP-2024-003", category: "Card Skimming",    risk: "Medium",   officer: "Anita Rao",     amount: "₹8,500",   date: "2024-12-03" },
  ],
  "In Review": [
    { id: "CP-2024-004", category: "Account Takeover", risk: "Critical", officer: "Vikram Singh",  amount: "₹2,50,000", date: "2024-11-28" },
    { id: "CP-2024-005", category: "Loan Fraud",       risk: "High",     officer: "Neha Patel",    amount: "₹75,000",  date: "2024-11-29" },
  ],
  "Resolved": [
    { id: "CP-2024-006", category: "KYC Fraud",        risk: "Low",      officer: "Priya Sharma",  amount: "₹12,000",  date: "2024-11-20" },
    { id: "CP-2024-007", category: "UPI Fraud",        risk: "Medium",   officer: "Anita Rao",     amount: "₹22,000",  date: "2024-11-22" },
  ],
};

const COL_STYLE = {
  "New":       { header: "text-blue-400",    dot: "bg-blue-400",    border: "border-blue-500/20"    },
  "In Review": { header: "text-amber-400",   dot: "bg-amber-400",   border: "border-amber-500/20"   },
  "Resolved":  { header: "text-emerald-400", dot: "bg-emerald-400", border: "border-emerald-500/20" },
};

function CaseModal({ c, onClose }) {
  if (!c) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-bright rounded-2xl p-6 w-[420px] border border-white/15 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display font-bold text-white text-lg">{c.id}</p>
            <p className="text-slate-500 text-xs">{c.date}</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-white text-xl transition-colors">✕</button>
        </div>
        <div className="space-y-3">
          {[
            { label: "Category",        value: c.category },
            { label: "Assigned Officer", value: c.officer  },
            { label: "Amount Lost",      value: c.amount   },
          ].map((r) => (
            <div key={r.label} className="glass rounded-xl px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">{r.label}</span>
              <span className="text-sm font-semibold text-white">{r.value}</span>
            </div>
          ))}
          <div className="glass rounded-xl px-3 py-2 flex justify-between items-center">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider">Risk Level</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${RISK_COLOR[c.risk]}`}>{c.risk}</span>
          </div>
        </div>
        <p className="text-slate-600 text-[11px] mt-4 text-center">Full agent results available after re-analysis</p>
      </div>
    </div>
  );
}

export default function CasesPage() {
  const [columns, setColumns] = useState(INITIAL_CASES);
  const [dragging, setDragging] = useState(null); // { caseId, fromCol }
  const [modal, setModal] = useState(null);

  const findCase = (id) => {
    for (const col of Object.keys(columns)) {
      const c = columns[col].find((x) => x.id === id);
      if (c) return { c, col };
    }
    return null;
  };

  const onDragStart = (e, caseId, fromCol) => {
    setDragging({ caseId, fromCol });
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e, toCol) => {
    e.preventDefault();
    if (!dragging || dragging.fromCol === toCol) return;
    const { caseId, fromCol } = dragging;
    const found = findCase(caseId);
    if (!found) return;
    setColumns((prev) => ({
      ...prev,
      [fromCol]: prev[fromCol].filter((x) => x.id !== caseId),
      [toCol]:   [...prev[toCol], found.c],
    }));
    setDragging(null);
  };

  const onDragOver = (e) => e.preventDefault();

  return (
    <div className="flex-1 overflow-hidden flex flex-col px-6 py-6">
      <div className="mb-5 flex-shrink-0">
        <h1 className="font-display text-2xl font-bold text-white">Case Management Board</h1>
        <p className="text-slate-500 text-sm mt-0.5">Drag cards between columns to update status</p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {Object.keys(columns).map((col) => {
          const s = COL_STYLE[col];
          return (
            <div key={col}
              className={`flex-1 flex flex-col glass rounded-2xl border ${s.border} overflow-hidden`}
              onDrop={(e) => onDrop(e, col)}
              onDragOver={onDragOver}
            >
              {/* Column header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 flex-shrink-0">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className={`font-display font-bold text-sm ${s.header}`}>{col}</span>
                <span className="ml-auto text-[11px] text-slate-600 font-mono">{columns[col].length}</span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {columns[col].map((c) => (
                  <div key={c.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, c.id, col)}
                    onClick={() => setModal(c)}
                    className="glass-bright rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-white/20 border border-white/8 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-500">{c.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${RISK_COLOR[c.risk]}`}>{c.risk}</span>
                    </div>
                    <p className="text-xs font-semibold text-white mb-1 truncate">{c.category}</p>
                    <p className="text-[10px] text-slate-500 truncate">👤 {c.officer}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-600">{c.date}</span>
                      <span className="text-[10px] font-bold text-indigo-400">{c.amount}</span>
                    </div>
                  </div>
                ))}
                {columns[col].length === 0 && (
                  <div className="flex items-center justify-center h-20 text-slate-700 text-xs border-2 border-dashed border-white/5 rounded-xl">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CaseModal c={modal} onClose={() => setModal(null)} />
    </div>
  );
}
