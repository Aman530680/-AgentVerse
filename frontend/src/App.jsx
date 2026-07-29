import { useState } from "react";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import ComplaintForm from "./components/ComplaintForm";
import ProgressTracker from "./components/ProgressTracker";
import IntakeCard from "./components/IntakeCard";
import ClassificationCard from "./components/ClassificationCard";
import DuplicateCard from "./components/DuplicateCard";
import EvidenceCard from "./components/EvidenceCard";
import RiskCard from "./components/RiskCard";
import WorkflowCard from "./components/WorkflowCard";

import { analyzeComplaint } from "./services/api";

const agentInfo = [
  { key: "intake",         icon: "📝", label: "Intake Agent",         desc: "Extracts structured data from raw complaint text — amount, bank, fraud type, channel, and date.", color: "from-blue-500 to-cyan-500",       glow: "rgba(99,102,241,0.3)",   accent: "blue" },
  { key: "classification", icon: "🏷️", label: "Classification Agent", desc: "Categorizes the complaint into the correct fraud type and routes it to the right department.",   color: "from-violet-500 to-purple-500",   glow: "rgba(139,92,246,0.3)",   accent: "violet" },
  { key: "duplicate",      icon: "🔍", label: "Duplicate Agent",       desc: "Checks if a similar complaint already exists to avoid redundant processing.",                    color: "from-pink-500 to-rose-500",       glow: "rgba(244,63,94,0.3)",    accent: "pink" },
  { key: "evidence",       icon: "📄", label: "Evidence Agent",        desc: "Evaluates available evidence and identifies missing items needed for investigation.",             color: "from-amber-500 to-orange-500",    glow: "rgba(245,158,11,0.3)",   accent: "amber" },
  { key: "risk",           icon: "⚠️", label: "Risk Agent",            desc: "Scores the complaint by risk level and recommends priority action.",                             color: "from-red-500 to-pink-500",        glow: "rgba(239,68,68,0.3)",    accent: "red" },
  { key: "workflow",       icon: "🚦", label: "Workflow Agent",        desc: "Assigns SLA, next steps, and closure status to complete the grievance pipeline.",                color: "from-emerald-500 to-teal-500",    glow: "rgba(16,185,129,0.3)",   accent: "emerald" },
];

const agentCardMap = {
  intake:         (data) => <IntakeCard data={data} />,
  classification: (data) => <ClassificationCard data={data} />,
  duplicate:      (data) => <DuplicateCard data={data} />,
  evidence:       (data) => <EvidenceCard data={data} />,
  risk:           (data) => <RiskCard data={data} />,
  workflow:       (data) => <WorkflowCard data={data} />,
};

// ── Floating orbs background ──────────────────────────────────────────────────
function Orbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-cyan-600/8 blur-[80px] animate-float" style={{ animationDelay: "1s" }} />
    </div>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function HomePage({ onGoToAnalyze, onAgentClick }) {
  return (
    <div className="relative min-h-screen bg-animated">
      <Orbs />
      <div className="relative z-10">

        {/* Hero */}
        <div className="text-center pt-28 pb-20 px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Banking Fraud Investigation
          </div>

          <h1 className="font-display text-7xl font-bold leading-none mb-6 animate-fade-up">
            <span className="shimmer-text">Agent</span>
            <span className="text-white">Verse</span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-8 animate-fade-up delay-100">
            6 specialized AI agents working in concert to investigate, classify,
            and resolve banking fraud complaints in real time.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10 animate-fade-up delay-200">
            <button
              onClick={onGoToAnalyze}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-display font-bold text-lg hover:scale-105 hover:shadow-2xl glow-blue transition-all duration-300 animate-gradient-x"
            >
              🚀 Launch Investigation
            </button>
            <button
              onClick={() => document.getElementById("agents-section").scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-2xl glass border border-white/10 text-slate-300 font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Explore Agents ↓
            </button>
          </div>

          {/* Floating agent pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12 animate-fade-up delay-300">
            {agentInfo.map((a) => (
              <span key={a.key} className={`px-4 py-2 rounded-full glass border border-white/10 text-sm font-semibold text-slate-300`}>
                {a.icon} {a.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "6",             label: "AI Agents",       icon: "🤖" },
              { value: "Real-Time",     label: "Processing",      icon: "⚡" },
              { value: "Multi-Lingual", label: "Language Support", icon: "🌐" },
            ].map((s, i) => (
              <div key={s.label} className={`glass-bright rounded-3xl p-6 text-center animate-fade-up delay-${(i+1)*100}`}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-display text-2xl font-bold shimmer-text">{s.value}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Cards */}
        <div id="agents-section" className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-white mb-3">Meet the Agents</h2>
            <p className="text-slate-400 text-lg">Click any agent to view its dedicated analysis page</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agentInfo.map((agent, i) => (
              <div
                key={agent.key}
                onClick={() => onAgentClick(agent.key)}
                className={`glass-bright rounded-3xl p-6 cursor-pointer neon-border group transition-all duration-300 hover:scale-105 animate-fade-up delay-${(i % 3 + 1) * 100}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    style={{ boxShadow: `0 8px 24px ${agent.glow}` }}>
                    {agent.icon}
                  </div>
                  <span className="text-xs font-mono-jet font-bold text-slate-600 bg-white/5 px-2 py-1 rounded-lg">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{agent.label}</h3>
                <p className="text-slate-400 text-sm leading-6 mb-4">{agent.desc}</p>
                <div className={`flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${agent.color} bg-clip-text text-transparent group-hover:gap-3 transition-all`}>
                  Open Agent Page <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Agent Detail Page ─────────────────────────────────────────────────────────
function AgentPage({ agentKey, result, onBack, onGoToAnalyze }) {
  const info = agentInfo.find((a) => a.key === agentKey);

  return (
    <div className="relative min-h-screen bg-animated">
      <Orbs />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-8 transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </button>

        {/* Agent Hero Banner */}
        <div
          className={`rounded-3xl p-8 mb-8 relative overflow-hidden animate-fade-up`}
          style={{ background: `linear-gradient(135deg, ${info.glow.replace("0.3", "0.15")} 0%, rgba(255,255,255,0.03) 100%)`, border: `1px solid ${info.glow.replace("0.3", "0.3")}` }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ background: `radial-gradient(circle, ${info.glow} 0%, transparent 70%)` }} />
          <div className="relative z-10 flex items-center gap-5">
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${info.color} flex items-center justify-center text-4xl shadow-2xl animate-float`}
              style={{ boxShadow: `0 16px 48px ${info.glow}` }}>
              {info.icon}
            </div>
            <div>
              <p className="text-slate-400 text-xs font-mono-jet uppercase tracking-widest mb-1">AI Agent</p>
              <h1 className="font-display text-3xl font-bold text-white">{info.label}</h1>
              <p className="text-slate-300 text-sm mt-2 leading-6 max-w-md">{info.desc}</p>
            </div>
          </div>
        </div>

        {/* Result or CTA */}
        {result ? (
          <div className="animate-fade-up delay-100">
            {agentCardMap[agentKey](result)}
          </div>
        ) : (
          <div className="glass-bright rounded-3xl p-10 text-center animate-bounce-in">
            <div className="text-6xl mb-4 animate-float">{info.icon}</div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">No Results Yet</h3>
            <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto leading-6">
              Submit a banking fraud complaint to see the <strong className="text-white">{info.label}</strong> analysis output.
            </p>
            <button
              onClick={onGoToAnalyze}
              className={`px-8 py-4 rounded-2xl bg-gradient-to-r ${info.color} text-white font-display font-bold hover:scale-105 transition-all duration-300 shadow-xl`}
              style={{ boxShadow: `0 8px 32px ${info.glow}` }}
            >
              🚀 Submit a Complaint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Analyze Page ──────────────────────────────────────────────────────────────
function AnalyzePage({ onHome, onAgentResult }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState({
    intake: "waiting", classification: "waiting", duplicate: "waiting",
    evidence: "waiting", risk: "waiting", workflow: "waiting",
  });

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const runPipeline = async () => {
    const agents = ["intake", "classification", "duplicate", "evidence", "risk", "workflow"];
    for (const agent of agents) {
      setStatuses((prev) => ({ ...prev, [agent]: "running" }));
      await delay(700);
      setStatuses((prev) => ({ ...prev, [agent]: "completed" }));
    }
  };

  const handleAnalyze = async (complaint) => {
    try {
      setLoading(true);
      setResult(null);
      setStatuses({ intake: "waiting", classification: "waiting", duplicate: "waiting", evidence: "waiting", risk: "waiting", workflow: "waiting" });
      const data = await analyzeComplaint(complaint);
      await runPipeline();
      setResult(data);
      onAgentResult(data);
    } catch (err) {
      console.error(err);
      alert("Backend connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-animated">
      <Orbs />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <button onClick={onHome} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-8 transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
        </button>

        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-4xl font-bold text-white mb-2">🔬 AI Investigation</h1>
          <p className="text-slate-400">Submit your complaint and watch 6 agents analyze it live</p>
        </div>

        <ComplaintForm onAnalyze={handleAnalyze} loading={loading} />
        <ProgressTracker statuses={statuses} />

        {result && (
          <div className="mt-4">
            <div id="intake"><IntakeCard data={result} /></div>
            <div id="classification"><ClassificationCard data={result} /></div>
            <div id="duplicate"><DuplicateCard data={result} /></div>
            <div id="evidence"><EvidenceCard data={result} /></div>
            <div id="risk"><RiskCard data={result} /></div>
            <div id="workflow"><WorkflowCard data={result} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [result, setResult] = useState(null);

  const goHome    = () => setPage("home");
  const goAnalyze = () => setPage("analyze");

  return (
    <>
      <Navbar
        onHome={goHome}
        onAgentClick={(key) => setPage(key)}
        activePage={page}
      />

      {page === "home" && (
        <HomePage onGoToAnalyze={goAnalyze} onAgentClick={(key) => setPage(key)} />
      )}
      {page === "analyze" && (
        <AnalyzePage onHome={goHome} onAgentResult={(data) => setResult(data)} />
      )}
      {agentInfo.map((a) =>
        page === a.key ? (
          <AgentPage key={a.key} agentKey={a.key} result={result} onBack={goHome} onGoToAnalyze={goAnalyze} />
        ) : null
      )}

      <Chatbot />
    </>
  );
}
