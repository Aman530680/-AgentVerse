import { useState, useEffect, useRef } from "react";

export default function AgentAccordion({ agentKey, info, status, logs = [], children }) {
  const [open, setOpen] = useState(false);
  const contentRef      = useRef(null);
  const logsEndRef      = useRef(null);

  // Auto-expand when agent completes
  useEffect(() => {
    if (status === "done") setOpen(true);
  }, [status]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const isDone    = status === "done";
  const isRunning = status === "running";
  const isWaiting = status === "waiting";

  return (
    <div
      className={`rounded-3xl overflow-hidden transition-all duration-500 mt-5
        ${isDone    ? "glass-bright" : "glass"}
        ${isRunning ? "border border-indigo-500/50" : "border border-white/5"}
      `}
      style={isDone ? { boxShadow: `0 0 32px ${info.glow}` } : isRunning ? { boxShadow: "0 0 24px rgba(99,102,241,0.2)" } : {}}
    >
      {/* ── Header row ── */}
      <button
        onClick={() => isDone && setOpen((o) => !o)}
        className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-all duration-200
          ${isDone ? "cursor-pointer hover:bg-white/5" : "cursor-default"}
        `}
      >
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-500
            ${isDone    ? `bg-gradient-to-br ${info.color} shadow-lg` : "bg-white/5"}
            ${isRunning ? "animate-pulse" : ""}
          `}
          style={isDone ? { boxShadow: `0 6px 20px ${info.glow}` } : {}}
        >
          {info.icon}
        </div>

        {/* Title + status */}
        <div className="flex-1 min-w-0">
          <p className={`font-display font-bold text-base ${isDone ? "text-white" : isRunning ? "text-slate-300" : "text-slate-600"}`}>
            {info.label}
          </p>
          <p className={`text-xs mt-0.5 font-mono-jet ${
            isDone    ? "text-emerald-400" :
            isRunning ? "text-amber-400" :
            "text-slate-600"
          }`}>
            {isDone    ? "✓ Completed — click arrow to expand / collapse" :
             isRunning ? logs[logs.length - 1] || "⟳ Initializing..." :
             "○ Waiting for previous agent..."}
          </p>
        </div>

        {/* Right indicator */}
        <div className="flex-shrink-0">
          {isRunning && (
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
          )}
          {isDone && (
            <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
          {isWaiting && (
            <div className="w-3 h-3 rounded-full bg-slate-700" />
          )}
        </div>
      </button>

      {/* ── Live thinking logs (visible while running) ── */}
      {isRunning && logs.length > 0 && (
        <div className="mx-6 mb-4 glass rounded-2xl p-4 border border-indigo-500/20">
          <p className="text-xs font-mono-jet text-indigo-400 mb-2 uppercase tracking-widest">⚙ Agent Activity</p>
          <div className="space-y-1.5 max-h-28 overflow-hidden">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs font-mono-jet transition-all duration-300
                  ${i === logs.length - 1 ? "text-amber-300" : "text-slate-500"}
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === logs.length - 1 ? "bg-amber-400 animate-pulse" : "bg-slate-600"}`} />
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {/* ── Collapsible result content ── */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: open && isDone ? `${contentRef.current?.scrollHeight || 3000}px` : "0px",
          opacity:   open && isDone ? 1 : 0,
        }}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
