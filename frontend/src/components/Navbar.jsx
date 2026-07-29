const agents = [
  { key: "intake",         icon: "📝", label: "Intake",         color: "from-blue-500 to-cyan-500" },
  { key: "classification", icon: "🏷️", label: "Classification", color: "from-violet-500 to-purple-500" },
  { key: "duplicate",      icon: "🔍", label: "Duplicate",       color: "from-pink-500 to-rose-500" },
  { key: "evidence",       icon: "📄", label: "Evidence",        color: "from-amber-500 to-orange-500" },
  { key: "risk",           icon: "⚠️", label: "Risk",            color: "from-red-500 to-pink-500" },
  { key: "workflow",       icon: "🚦", label: "Workflow",        color: "from-emerald-500 to-teal-500" },
];

export default function Navbar({ onHome, onAgentClick, activePage }) {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={onHome}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm animate-float">
            🤖
          </div>
          <span className="font-display text-xl font-bold shimmer-text">AgentVerse</span>
        </button>

        {/* Agent Nav Pills */}
        <div className="flex items-center gap-1">
          {agents.map((a) => (
            <button
              key={a.key}
              onClick={() => onAgentClick(a.key)}
              className={`
                relative text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-300
                ${activePage === a.key
                  ? `bg-gradient-to-r ${a.color} text-white shadow-lg scale-105`
                  : "text-slate-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <span className="mr-1">{a.icon}</span>{a.label}
              {activePage === a.key && (
                <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-30" />
              )}
            </button>
          ))}
        </div>

      </div>
    </nav>
  );
}
