import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are AgentBot, a helpful AI assistant for AgentVerse — an AI-powered banking fraud grievance investigation system.

AgentVerse has 6 AI agents:
1. 📝 Intake Agent — extracts structured data (amount, bank, fraud type, channel, date) from complaints
2. 🏷️ Classification Agent — categorizes fraud type and routes to the right department
3. 🔍 Duplicate Agent — checks if a similar complaint already exists
4. 📄 Evidence Agent — evaluates evidence completeness and lists missing documents
5. ⚠️ Risk Agent — scores risk level (0-100) and recommends priority action
6. 🚦 Workflow Agent — assigns SLA, next steps, and closure status

Answer user questions about how the system works, what each agent does, how to submit complaints, and general banking fraud topics. Be concise, friendly, and helpful. Use emojis occasionally.`;

export default function Chatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hi! I'm **AgentBot**. Ask me anything about AgentVerse, the 6 AI agents, or banking fraud investigation!" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(1);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQuestion = async (q) => {
    if (loading) return;
    const userMsg = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, userMsg],
          max_tokens: 400, temperature: 0.7,
        }),
      });
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.filter((m) => m.role !== "system"),
            userMsg,
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection error. Please check your API key in the `.env` file." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown bold renderer
  const renderText = (text) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        : part
    );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 glow-blue"
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

      {/* Chat Window */}
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
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl animate-float">
              🤖
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">AgentBot</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/70 text-xs">Online · Powered by Groq</span>
              </div>
            </div>
            <button
              onClick={() => setMessages([{ role: "assistant", content: "👋 Hi! I'm **AgentBot**. Ask me anything about AgentVerse or banking fraud!" }])}
              className="ml-auto text-white/50 hover:text-white text-xs transition-colors"
              title="Clear chat"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-6 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
                      : "bg-white/8 text-slate-300 rounded-bl-sm border border-white/8"
                  }`}
                >
                  {renderText(msg.content)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                  🤖
                </div>
                <div className="bg-white/8 border border-white/8 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {["What is Intake Agent?", "How does risk scoring work?", "What is AgentVerse?"].map((q) => (
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
                placeholder="Ask anything about AgentVerse..."
                className="flex-1 bg-transparent text-slate-200 text-sm placeholder:text-slate-600 resize-none focus:outline-none leading-6 max-h-24 font-mono-jet"
                style={{ fieldSizing: "content" }}
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
