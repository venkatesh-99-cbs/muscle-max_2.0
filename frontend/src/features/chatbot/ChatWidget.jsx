import { useState, useRef, useEffect } from "react";
import { askChatbot } from "../../services/chatbotApi";

const SUGGESTED_PROMPTS = [
  "What protein products do you have?",
  "What is your return policy?",
  "How much is 100% Whey Isolate?",
  "Do you have vegan protein?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "Hello! I am your Muscle Max AI Assistant. Ask me anything about our supplements, prices, usage instructions, or store policies!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMessageId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askChatbot(q);
      const botAnswer = res.data?.answer || "I don't know based on the available Muscle Max information.";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "bot", text: botAnswer },
      ]);
    } catch (err) {
      console.error("Chatbot query failed", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          text: "I don't know based on the available Muscle Max information.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="chat-widget-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "1.75rem",
          right: "1.75rem",
          width: "3.75rem",
          height: "3.75rem",
          borderRadius: "var(--radius-full)",
          background: "var(--gradient-brand)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "var(--shadow-glow), 0 4px 20px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.75rem",
          zIndex: 999,
          transition: "transform var(--transition-base), box-shadow var(--transition-base)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        aria-label="Toggle Muscle Max AI Assistant"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Slide-Up Chat Panel */}
      {isOpen && (
        <div
          className="slide-up"
          style={{
            position: "fixed",
            bottom: "6rem",
            right: "1.75rem",
            width: "min(400px, calc(100vw - 2rem))",
            height: "min(560px, calc(100vh - 8rem))",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-moderate)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-lg), 0 0 50px rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            zIndex: 998,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "var(--bg-elevated)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  background: "var(--gradient-brand)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                }}
              >
                ⚡
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>Muscle Max AI</div>
                <div style={{ fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)" }} />
                  Grounded in Verified Store Data
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "1.1rem",
                cursor: "pointer",
                padding: "0.25rem",
              }}
            >
              ✕
            </button>
          </div>

          {/* Quick Prompts (visible when few messages) */}
          {messages.length <= 2 && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "var(--bg-card)",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-moderate)",
                    color: "var(--text-secondary)",
                    borderRadius: "var(--radius-full)",
                    padding: "0.3rem 0.75rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = "var(--brand-primary)";
                    e.currentTarget.style.borderColor = "var(--brand-primary)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-moderate)";
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Message Thread */}
          <div
            style={{
              flex: 1,
              padding: "1rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-lg)",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    background:
                      m.role === "user"
                        ? "var(--brand-primary)"
                        : "var(--bg-elevated)",
                    color: m.role === "user" ? "#fff" : "var(--text-primary)",
                    border:
                      m.role === "user"
                        ? "none"
                        : "1px solid var(--border-moderate)",
                    boxShadow: "var(--shadow-sm)",
                    wordBreak: "break-word",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.8125rem", padding: "0.5rem" }}>
                <div className="spinner spinner-sm" />
                <span>Consulting verified catalog & policies...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "0.75rem 1rem",
              background: "var(--bg-elevated)",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about supplements, price, dosage..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="form-input"
              style={{
                flex: 1,
                fontSize: "0.875rem",
                padding: "0.6rem 0.875rem",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn btn-primary btn-sm"
              style={{ padding: "0.6rem 1rem" }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
