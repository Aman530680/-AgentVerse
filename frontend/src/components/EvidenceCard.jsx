export default function EvidenceCard({ data }) {
  if (!data) return null;

  const isSufficient = data.evidence_status === "Sufficient";
  const missing = data.missing_items || [];

  return (
    <div className="glass-bright rounded-3xl p-8 mt-8 animate-fade-up" style={{ boxShadow: "0 0 40px rgba(245,158,11,0.2)" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/40 animate-float">
          📄
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Evidence Completeness Agent</h2>
          <p className="text-slate-400 text-sm">Document & evidence verification</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            isSufficient
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border-amber-500/30"
          }`}>
            {isSufficient ? "✓ Sufficient" : "⚠ Incomplete"}
          </span>
        </div>
      </div>

      {/* Status + Count */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center">
          <span className={`font-display text-3xl font-bold ${isSufficient ? "text-emerald-400" : "text-amber-400"}`}>
            {isSufficient ? "✓" : "✗"}
          </span>
          <span className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Status</span>
          <span className={`text-sm font-semibold mt-1 ${isSufficient ? "text-emerald-300" : "text-amber-300"}`}>
            {data.evidence_status}
          </span>
        </div>
        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-amber-400">{missing.length}</span>
          <span className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Missing Items</span>
        </div>
      </div>

      {/* Missing Documents */}
      {missing.length > 0 && (
        <div className="glass rounded-2xl p-5 mb-6">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Missing Documents</p>
          <div className="space-y-2">
            {missing.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="w-5 h-5 rounded-full border-2 border-amber-500/50 flex items-center justify-center text-xs text-amber-400 flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning */}
      <div className="glass rounded-2xl p-5 border-l-4 border-amber-500">
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">🤖 AI Reasoning</p>
        <p className="text-slate-300 text-sm leading-7">{data.reasoning?.evidence}</p>
      </div>
    </div>
  );
}
