function DataField({ label, value }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-all duration-300">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-white font-semibold text-base">
        {value ?? <span className="text-slate-600 italic">—</span>}
      </span>
    </div>
  );
}

export default function ClassificationCard({ data }) {
  if (!data) return null;

  const confidence = Math.round((data.classification_confidence || 0) * 100);

  return (
    <div className="glass-bright rounded-3xl p-8 mt-8 glow-purple animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/40 animate-float">
          🏷️
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Classification Agent</h2>
          <p className="text-slate-400 text-sm">Fraud type & department routing</p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold border border-violet-500/30">
            ✓ Completed
          </span>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <DataField label="Category" value={data.category} />
        <DataField label="Department" value={data.assigned_department} />
      </div>

      {/* Confidence Meter */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Confidence Score</span>
          <span className="font-display text-2xl font-bold text-violet-400">{confidence}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-1000"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Reasoning */}
      <div className="glass rounded-2xl p-5 border-l-4 border-violet-500">
        <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-2">🤖 AI Reasoning</p>
        <p className="text-slate-300 text-sm leading-7">{data.reasoning?.classification}</p>
      </div>
    </div>
  );
}
