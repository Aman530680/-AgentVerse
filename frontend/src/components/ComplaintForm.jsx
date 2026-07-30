import { useState } from "react";

export default function ComplaintForm({ onAnalyze, loading, initialValue = "" }) {
  const [complaint, setComplaint] = useState(initialValue);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!complaint.trim() || loading) return;
    onAnalyze(complaint);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up">
      <div className="glass-bright rounded-3xl p-8 glow-blue">

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl">
            📝
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Describe Your Complaint</h2>
            <p className="text-slate-400 text-sm">Supports English, Hindi, Tamil, Telugu & more</p>
          </div>
        </div>

        <div className={`relative mt-6 rounded-2xl transition-all duration-300 ${focused ? "ring-2 ring-indigo-500/60" : ""}`}>
          <textarea
            rows={6}
            placeholder={"Example:\n\nYesterday I lost ₹5000 from my SBI account through Google Pay.\nI never approved the transaction."}
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 resize-none focus:outline-none text-slate-200 placeholder:text-slate-600 font-mono-jet text-sm leading-7"
          />
          <div className="absolute bottom-3 right-4 text-xs text-slate-600 font-mono-jet">
            {complaint.length} chars
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !complaint.trim()}
          className={`
            w-full mt-5 py-4 rounded-2xl font-display font-bold text-lg tracking-wide
            transition-all duration-300 relative overflow-hidden
            ${loading || !complaint.trim()
              ? "bg-white/5 text-slate-600 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white hover:scale-[1.02] hover:shadow-2xl glow-blue animate-gradient-x"
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing with AI Agents...
            </span>
          ) : (
            "🚀 Launch AI Investigation"
          )}
        </button>
      </div>
    </form>
  );
}
