export default function RiskCard({ data }) {
  if (!data) return null;

  const score = data.risk_score || 0;
  const priority = data.priority || "Low";

  const priorityConfig = {
    Critical: { color: "text-red-400",    bg: "bg-red-500/20",    border: "border-red-500/30",    bar: "from-red-500 to-rose-400",    glow: "shadow-red-500/40" },
    High:     { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", bar: "from-orange-500 to-amber-400", glow: "shadow-orange-500/40" },
    Medium:   { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", bar: "from-yellow-500 to-amber-300", glow: "shadow-yellow-500/40" },
    Low:      { color: "text-emerald-400",bg: "bg-emerald-500/20",border: "border-emerald-500/30",bar: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/40" },
  };

  const cfg = priorityConfig[priority] || priorityConfig.Low;

  return (
    <div className="glass-bright rounded-3xl p-8 mt-8 animate-fade-up" style={{ boxShadow: "0 0 40px rgba(239,68,68,0.2)" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg shadow-red-500/40 animate-float">
          ⚠️
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Risk & Fraud Prioritization Agent</h2>
          <p className="text-slate-400 text-sm">Threat scoring & action recommendation</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {priority} Priority
          </span>
        </div>
      </div>

      {/* Score + Priority */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Risk Score Gauge */}
        <div className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Risk Score</p>
          <div className="flex items-end gap-2 mb-3">
            <span className={`font-display text-4xl font-bold ${cfg.color}`}>{score}</span>
            <span className="text-slate-500 text-lg mb-1">/100</span>
          </div>
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${cfg.bar} transition-all duration-1000`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Priority */}
        <div className={`glass rounded-2xl p-5 flex flex-col items-center justify-center border ${cfg.border}`}>
          <span className={`font-display text-4xl font-bold ${cfg.color}`}>{priority}</span>
          <span className="text-xs text-slate-500 mt-2 uppercase tracking-widest">Priority Level</span>
        </div>
      </div>

      {/* Recommended Action */}
      <div className={`glass rounded-2xl p-5 mb-6 border-l-4 border-red-500`}>
        <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">⚡ Recommended Action</p>
        <p className="text-slate-200 text-sm leading-7 font-medium">{data.recommended_action}</p>
      </div>

      {/* Reasoning */}
      <div className="glass rounded-2xl p-5 border-l-4 border-slate-600">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">🤖 AI Reasoning</p>
        <p className="text-slate-300 text-sm leading-7">{data.reasoning?.risk}</p>
      </div>
    </div>
  );
}
