function DataField({ label, value, mono = false }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-all duration-300">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-white font-semibold text-base ${mono ? "font-mono-jet" : ""}`}>
        {value ?? <span className="text-slate-600 italic">—</span>}
      </span>
    </div>
  );
}

export default function IntakeCard({ data }) {
  if (!data) return null;

  return (
    <div className="glass-bright rounded-3xl p-8 mt-8 glow-blue animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/40 animate-float">
          📝
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Intake Agent</h2>
          <p className="text-slate-400 text-sm">Structured case extraction</p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            ✓ Completed
          </span>
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <DataField label="Amount" value={data.amount ? `₹${data.amount}` : data.amount} mono />
        <DataField label="Bank" value={data.bank_name} />
        <DataField label="Fraud Type" value={data.fraud_type} />
        <DataField label="Channel" value={data.transaction_channel} />
        <DataField label="Transaction Date" value={data.transaction_date} />
      </div>

      {/* Reasoning */}
      <div className="glass rounded-2xl p-5 border-l-4 border-blue-500">
        <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">🤖 AI Reasoning</p>
        <p className="text-slate-300 text-sm leading-7">{data.reasoning?.intake}</p>
      </div>
    </div>
  );
}
