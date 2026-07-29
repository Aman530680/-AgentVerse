function StatusBadge({ value }) {
  const colors = {
    Escalated:  "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Resolved:   "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Pending:    "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Closed:     "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
  const key = Object.keys(colors).find((k) => value?.includes(k)) || "Pending";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[key]}`}>
      {value}
    </span>
  );
}

function DataField({ label, value, badge }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2 hover:bg-white/10 transition-all duration-300">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
      {badge ? <StatusBadge value={value} /> : (
        <span className="text-white font-semibold text-sm leading-6">
          {value ?? <span className="text-slate-600 italic">—</span>}
        </span>
      )}
    </div>
  );
}

export default function WorkflowCard({ data }) {
  if (!data) return null;

  return (
    <div className="glass-bright rounded-3xl p-8 mt-8 mb-10 animate-fade-up" style={{ boxShadow: "0 0 40px rgba(16,185,129,0.2)" }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/40 animate-float">
          🚦
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Workflow & Resolution Agent</h2>
          <p className="text-slate-400 text-sm">Case routing, SLA & closure management</p>
        </div>
        <div className="ml-auto">
          <StatusBadge value={data.workflow_status} />
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <DataField label="Workflow Status" value={data.workflow_status} badge />
        <DataField label="SLA Deadline" value={data.sla} />
        <DataField label="Closure Status" value={data.closure_status} badge />
      </div>

      {/* Next Action */}
      <div className="glass rounded-2xl p-5 mb-6 border border-emerald-500/20">
        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">⚡ Next Action</p>
        <p className="text-slate-200 text-sm leading-7 font-medium">{data.next_action}</p>
      </div>

      {/* Reasoning */}
      <div className="glass rounded-2xl p-5 border-l-4 border-emerald-500">
        <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">🤖 AI Reasoning</p>
        <p className="text-slate-300 text-sm leading-7">{data.reasoning?.workflow}</p>
      </div>
    </div>
  );
}
