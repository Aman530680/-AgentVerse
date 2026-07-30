const NAV_LINKS = [
  { page: "dashboard", label: "🔬 Investigate" },
  { page: "cases",     label: "📋 Cases"       },
  { page: "analytics", label: "📊 Analytics"   },
  { page: "history",   label: "🕓 History"     },
  { page: "reports",   label: "📄 Reports"     },
];

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="glass border-b border-white/10 flex-shrink-0 relative z-10">
      <div className="max-w-full px-6 py-3 flex items-center gap-6">
        <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm animate-float">🤖</div>
          <span className="font-display text-xl font-bold shimmer-text">CasePilot</span>
        </button>

        <div className="flex items-center gap-1 ml-4">
          {NAV_LINKS.map((l) => (
            <button key={l.page} onClick={() => onNavigate(l.page)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                currentPage === l.page
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
