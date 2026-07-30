import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm **AgentBot**. Ask me anything about CasePilot, the 6 AI agents, or fraud complaint intelligence!" }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [unread,  setUnread]  = useState(1);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Call backend /chat ──────────────────────────────────────────────────────
  const callChat = async (history) => {
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.reply;
  };

  // ── Send typed message ──────────────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const reply = await callChat(newHistory);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Could not reach the backend. Make sure the server is running on port 8000." }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Send suggested question ─────────────────────────────────────────────────
  const sendQuestion = async (q) => {
    if (loading) return;
    const userMsg = { role: "user", content: q };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      const reply = await callChat(newHistory);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Could not reach the backend." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const renderText = (text) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        : part
    );

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
        style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.5)" }}
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center animate-bounce">
            {unread}
          </span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] rounded-3xl overflow-hidden animate-bounce-in"
          style={{
            background: "rgba(10,10,26,0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(99,102,241,0.3)",
            boxShadow: "0 24px 80px rgba(99,102,241,0.3)",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl animate-float">🤖</div>
            <div>
              <p className="font-display font-bold text-white text-sm">AgentBot</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-xs">Online · Powered by Groq</span>
              </div>
            </div>
            <button
              onClick={() => setMessages([{ role: "assistant", content: "👋 Hi! I'm **AgentBot**. Ask me anything about CasePilot or fraud complaints!" }])}
              className="ml-auto text-white/50 hover:text-white text-xs transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">🤖</div>
                )}
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-6 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
                    : "bg-white/8 text-slate-300 rounded-bl-sm border border-white/8"
                }`}>
                  {renderText(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0">🤖</div>
                <div className="bg-white/8 border border-white/8 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"  style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {["What is Intake Agent?", "How does risk scoring work?", "What is CasePilot?"].map((q) => (
                <button
                  key={q}
                  onClick={() => sendQuestion(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-white/8">
            <div className="flex items-end gap-2 bg-white/5 rounded-2xl border border-white/10 px-4 py-2.5 focus-within:border-indigo-500/50 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about CasePilot..."
                className="flex-1 bg-transparent text-slate-200 text-sm placeholder:text-slate-600 resize-none focus:outline-none leading-6 max-h-24 font-mono-jet"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  input.trim() && !loading
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 hover:scale-110 shadow-lg"
                    : "bg-white/5 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-center text-slate-700 text-xs mt-2 font-mono-jet">Enter to send · Shift+Enter for newline</p>
          </div>
        </div>
      )}
    </>
  );
}
