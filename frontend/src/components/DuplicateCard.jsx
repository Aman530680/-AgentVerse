function DataField({ label, value, highlight }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-all duration-300">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`font-semibold text-base ${highlight ? "text-rose-400" : "text-white"}`}>
        {value ?? <span className="text-slate-600 italic">—</span>}
      </span>
    </div>
  );
}

export default function DuplicateCard({ data }) {
  if (!data) return null;

  const score = Math.round((data.duplicate_score || 0) * 100);
  const isDup = data.is_duplicate;

  return (
    <div className="glass-bright rounded-3xl p-8 mt-8 animate-fade-up" style={{ boxShadow: "0 0 40px rgba(244,63,94,0.2)" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-pink-500/40 animate-float">
          🔍
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Duplicate Detection Agent</h2>
          <p className="text-slate-400 text-sm">Cross-case similarity analysis</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            isDup
              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          }`}>
            {isDup ? "⚠ Duplicate Found" : "✓ Unique Case"}
          </span>
        </div>
      </div>

      {/* Score + Fields */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Big score circle */}
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center col-span-1">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="url(#pinkGrad)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score * 2.01} 201`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-lg font-bold text-white">{score}%</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-2 uppercase tracking-widest">Similarity</span>
        </div>

        <div className="col-span-2 grid grid-rows-2 gap-3">
          <DataField label="Duplicate Case" value={isDup ? "Yes" : "No"} highlight={isDup} />
          <DataField label="Similar Case ID" value={data.similar_case || "—"} />
        </div>
      </div>

      {/* Reasoning */}
      <div className="glass rounded-2xl p-5 border-l-4 border-rose-500">
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest mb-2">🤖 AI Reasoning</p>
        <p className="text-slate-300 text-sm leading-7">{data.reasoning?.duplicate}</p>
      </div>
    </div>
  );
}
