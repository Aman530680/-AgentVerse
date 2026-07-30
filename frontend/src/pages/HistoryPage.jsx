import { useState, useMemo } from "react";

const RISK_COLOR = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/30",
  High:     "text-orange-400 bg-orange-500/10 border-orange-500/30",
  Medium:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Low:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
};

// Seed mock data if localStorage is empty
function getHistory() {
  const stored = localStorage.getItem("casepilot_history");
  if (stored) return JSON.parse(stored);
  const mock = [
    { id: "CP-2024-001", date: "2024-12-01", complaint: "Unauthorized UPI transfer of ₹45,000 from my SBI account.", category: "UPI Fraud",        risk: "High",     status: "Resolved"  },
    { id: "CP-2024-002", date: "2024-12-02", complaint: "Received phishing link, clicked it and lost ₹1,20,000.",   category: "Phishing",         risk: "Critical", status: "In Review" },
    { id: "CP-2024-003", date: "2024-12-03", complaint: "Card skimmed at ATM, ₹8,500 withdrawn without consent.",   category: "Card Skimming",    risk: "Medium",   status: "Resolved"  },
    { id: "CP-2024-004", date: "2024-11-28", complaint: "Account taken over via OTP fraud, ₹2,50,000 transferred.", category: "Account Takeover", risk: "Critical", status: "In Review" },
    { id: "CP-2024-005", date: "2024-11-29", complaint: "Fake loan app charged ₹75,000 in hidden fees.",            category: "Loan Fraud",       risk: "High",     status: "New"       },
    { id: "CP-2024-006", date: "2024-11-20", complaint: "KYC documents misused to open fraudulent account.",        category: "KYC Fraud",        risk: "Low",      status: "Resolved"  },
  ];
  localStorage.setItem("casepilot_history", JSON.stringify(mock));
  return mock;
}

function exportCSV(rows) {
  const headers = ["ID", "Date", "Category", "Risk", "Status", "Complaint"];
  const lines = [headers.join(","), ...rows.map((r) =>
    [r.id, r.date, r.category, r.risk, r.status, `"${r.complaint.replace(/"/g, '""')}"`].join(",")
  )];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "casepilot_history.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryPage({ onReopen }) {
  const [history] = useState(getHistory);
  const [search, setSearch]     = useState("");
  const [filterRisk, setRisk]   = useState("All");
  const [filterCat, setCat]     = useState("All");
  const [selected, setSelected] = useState(null);

  const categories = ["All", ...new Set(history.map((h) => h.category))];
  const risks      = ["All", "Critical", "High", "Medium", "Low"];

  const filtered = useMemo(() => history.filter((h) => {
    const matchSearch = h.complaint.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase());
    const matchRisk   = filterRisk === "All" || h.risk === filterRisk;
    const matchCat    = filterCat  === "All" || h.category === filterCat;
    return matchSearch && matchRisk && matchCat;
  }), [history, search, filterRisk, filterCat]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col px-6 py-6">
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Case History</h1>
          <p className="text-slate-500 text-sm mt-0.5">{history.length} total cases stored</p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:scale-105 transition-all"
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-shrink-0 flex-wrap">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID or complaint…"
          className="flex-1 min-w-[200px] glass rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 border border-white/8 outline-none focus:border-indigo-500/50"
        />
        <select value={filterRisk} onChange={(e) => setRisk(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-xs text-white border border-white/8 outline-none bg-transparent">
          {risks.map((r) => <option key={r} value={r} className="bg-slate-900">{r === "All" ? "All Risks" : r}</option>)}
        </select>
        <select value={filterCat} onChange={(e) => setCat(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-xs text-white border border-white/8 outline-none bg-transparent">
          {categories.map((c) => <option key={c} value={c} className="bg-slate-900">{c === "All" ? "All Categories" : c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto glass-bright rounded-2xl border border-white/8">
        <table className="w-full text-xs">
          <thead className="sticky top-0 glass border-b border-white/8">
            <tr>
              {["Case ID", "Date", "Category", "Risk", "Status", "Complaint", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${selected === row.id ? "bg-indigo-500/5" : ""}`}
                onClick={() => setSelected(selected === row.id ? null : row.id)}
              >
                <td className="px-4 py-3 font-mono text-indigo-400 font-bold">{row.id}</td>
                <td className="px-4 py-3 text-slate-500">{row.date}</td>
                <td className="px-4 py-3 text-white font-semibold">{row.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${RISK_COLOR[row.risk]}`}>{row.risk}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">{row.status}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[220px] truncate">{row.complaint}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onReopen?.(row.complaint); }}
                    className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-all font-semibold"
                  >
                    Re-analyze
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600">No cases match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
