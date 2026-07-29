import { useEffect, useState } from "react";

const agents = [
  { key: "intake",         icon: "📝", title: "Intake Agent",         color: "from-blue-500 to-cyan-500",     glow: "shadow-blue-500/40" },
  { key: "classification", icon: "🏷️", title: "Classification Agent", color: "from-violet-500 to-purple-500", glow: "shadow-violet-500/40" },
  { key: "duplicate",      icon: "🔍", title: "Duplicate Agent",       color: "from-pink-500 to-rose-500",     glow: "shadow-pink-500/40" },
  { key: "evidence",       icon: "📄", title: "Evidence Agent",        color: "from-amber-500 to-orange-500",  glow: "shadow-amber-500/40" },
  { key: "risk",           icon: "⚠️", title: "Risk Agent",            color: "from-red-500 to-pink-500",      glow: "shadow-red-500/40" },
  { key: "workflow",       icon: "🚦", title: "Workflow Agent",        color: "from-emerald-500 to-teal-500",  glow: "shadow-emerald-500/40" },
];

export default function ProgressTracker({ statuses }) {
  const completed = Object.values(statuses).filter((s) => s === "completed").length;
  const progress = Math.round((completed / agents.length) * 100);

  return (
    <div className="glass-bright rounded-3xl p-8 mt-8 animate-fade-up delay-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">🧠 AI Investigation Pipeline</h2>
          <p className="text-slate-400 text-sm mt-1">Processing through 6 specialized agents</p>
        </div>
        <div className="text-right">
          <span className="font-display text-3xl font-bold shimmer-text">{progress}%</span>
          <p className="text-slate-500 text-xs">Complete</p>
        </div>
      </div>

      {/* Master progress bar */}
      <div className="h-2 bg-white/5 rounded-full mb-8 overflow-hidden">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Agent rows */}
      <div className="space-y-4">
        {agents.map((agent, i) => {
          const status = statuses?.[agent.key] || "waiting";
          const isCompleted = status === "completed";
          const isRunning   = status === "running";

          return (
            <div
              key={agent.key}
              className={`
                flex items-center gap-4 p-4 rounded-2xl transition-all duration-500
                ${isCompleted ? "bg-white/5 border border-white/10" : "bg-white/[0.02] border border-white/5"}
                ${isRunning   ? "border-indigo-500/40 bg-indigo-500/5" : ""}
              `}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`
                w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-500
                ${isCompleted ? `bg-gradient-to-br ${agent.color} shadow-lg ${agent.glow}` : "bg-white/5"}
                ${isRunning   ? "animate-pulse" : ""}
              `}>
                {agent.icon}
              </div>

              {/* Title + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-semibold text-sm ${isCompleted ? "text-white" : "text-slate-500"}`}>
                    {agent.title}
                  </span>
                  <span className={`text-xs font-mono-jet font-semibold ${
                    isCompleted ? "text-emerald-400" :
                    isRunning   ? "text-amber-400 animate-pulse" :
                    "text-slate-600"
                  }`}>
                    {isCompleted ? "✓ Done" : isRunning ? "⟳ Running" : "○ Waiting"}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCompleted ? `bg-gradient-to-r ${agent.color}` :
                      isRunning   ? "bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse w-2/3" :
                      "w-0"
                    }`}
                    style={{ width: isCompleted ? "100%" : isRunning ? "66%" : "0%" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
