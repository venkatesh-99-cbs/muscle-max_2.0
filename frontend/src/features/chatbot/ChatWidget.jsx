import { useEffect, useRef, useState, useCallback } from "react";
import { askChatbot } from "../../services/chatbotApi";

const SUGGESTED_PROMPTS = [
  "What protein products do you have?",
  "What is your return & refund policy?",
  "How does shipping and delivery work?",
  "Can I stack Whey Protein with Creatine?",
];

const WIDGET_STYLES = `
  .mm-chat-toggle { position: fixed; right: 1.5rem; bottom: 1.5rem; z-index: 999; width: 3.8rem; height: 3.8rem; border: 1px solid rgba(251,191,36,.48); border-radius: 50%; background: var(--gradient-brand); color: #fff; box-shadow: 0 10px 28px rgba(0,0,0,.4), 0 0 0 5px rgba(249,115,22,.12); cursor: pointer; font-size: 1.35rem; transition: transform .18s ease, box-shadow .18s ease; }
  .mm-chat-toggle:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 15px 32px rgba(0,0,0,.5), 0 0 0 7px rgba(249,115,22,.14); }
  .mm-chat-toggle:focus-visible, .mm-chat-action:focus-visible, .mm-chat-close:focus-visible, .mm-chat-prompt:focus-visible { outline: 2px solid var(--brand-accent); outline-offset: 3px; }
  .mm-chat-panel { position: fixed; right: 1.5rem; bottom: 6.35rem; z-index: 998; width: min(25.5rem, calc(100vw - 2rem)); height: min(42rem, calc(100dvh - 8rem)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border-moderate); border-radius: var(--radius-xl); background: var(--bg-surface); box-shadow: 0 24px 60px rgba(0,0,0,.55); animation: mm-chat-in .22s ease-out both; }
  .mm-chat-header { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: 1rem 1.1rem; background: linear-gradient(110deg, var(--bg-elevated), #261b12); border-bottom: 1px solid var(--border-subtle); }
  .mm-chat-identity { display: flex; min-width: 0; align-items: center; gap: .7rem; }
  .mm-chat-mark { display: grid; width: 2.25rem; height: 2.25rem; flex: 0 0 auto; place-items: center; border-radius: var(--radius-md); background: var(--gradient-brand); color: #fff; font-weight: 900; box-shadow: 0 5px 14px rgba(249,115,22,.25); }
  .mm-chat-title { margin: 0; color: var(--text-primary); font-size: .95rem; font-weight: 800; letter-spacing: .01em; }
  .mm-chat-status { display: flex; align-items: center; gap: .35rem; margin: .13rem 0 0; color: var(--text-secondary); font-size: .7rem; }
  .mm-chat-status-dot { width: .4rem; height: .4rem; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 3px rgba(34,197,94,.12); }
  .mm-chat-close { width: 2rem; height: 2rem; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 1.35rem; line-height: 1; }
  .mm-chat-close:hover { background: rgba(255,255,255,.07); color: var(--text-primary); }
  .mm-chat-context { display: flex; align-items: flex-start; gap: .6rem; margin: .75rem .85rem 0; padding: .65rem .7rem; border: 1px solid rgba(251,146,60,.45); border-left: 3px solid var(--brand-primary); border-radius: var(--radius-md); background: rgba(249,115,22,.09); }
  .mm-chat-context-copy { min-width: 0; flex: 1; color: var(--text-secondary); font-size: .76rem; line-height: 1.35; }
  .mm-chat-context-label { display: block; margin-bottom: .14rem; color: var(--brand-accent); font-size: .65rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .mm-chat-dismiss { border: 0; background: transparent; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; line-height: 1; }
  .mm-chat-prompts { padding: .75rem .85rem .3rem; }
  .mm-chat-section-label { display: block; margin-bottom: .45rem; color: var(--text-muted); font-size: .66rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .mm-chat-prompt-row { display: flex; gap: .45rem; overflow-x: auto; padding-bottom: .35rem; scrollbar-width: thin; }
  .mm-chat-prompt { flex: 0 0 auto; border: 1px solid var(--border-moderate); border-radius: var(--radius-full); background: var(--bg-elevated); color: var(--text-secondary); cursor: pointer; padding: .38rem .65rem; font: inherit; font-size: .72rem; transition: border-color .16s ease, color .16s ease, background .16s ease; }
  .mm-chat-prompt:hover { border-color: var(--brand-primary); background: rgba(249,115,22,.08); color: var(--text-primary); }
  .mm-chat-thread { display: flex; min-height: 0; flex: 1; flex-direction: column; gap: .75rem; overflow-y: auto; padding: .85rem; }
  .mm-chat-message { display: flex; flex-direction: column; gap: .2rem; max-width: 92%; }
  .mm-chat-message--user { align-self: flex-end; align-items: flex-end; }
  .mm-chat-message--assistant { align-self: flex-start; }
  .mm-chat-speaker { color: var(--text-muted); font-size: .64rem; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
  .mm-chat-bubble { padding: .7rem .85rem; border: 1px solid var(--border-moderate); border-radius: var(--radius-lg); background: var(--bg-elevated); color: var(--text-primary); font-size: .84rem; line-height: 1.6; overflow-wrap: anywhere; }
  .mm-chat-bubble p { margin: 0 0 .4rem; }
  .mm-chat-bubble p:last-child { margin: 0; }
  .mm-chat-bubble ul { margin: .3rem 0; padding-left: 1.1rem; }
  .mm-chat-bubble li { margin-bottom: .2rem; }
  .mm-chat-message--user .mm-chat-bubble { border-color: transparent; border-bottom-right-radius: .35rem; background: var(--brand-primary); color: #fff; }
  .mm-chat-message--assistant .mm-chat-bubble { border-top-left-radius: .35rem; }
  .mm-chat-suggestions { display: flex; gap: .4rem; flex-wrap: wrap; margin-top: .45rem; }
  .mm-chat-suggestion { border: 1px solid rgba(249,115,22,.4); border-radius: var(--radius-full); background: rgba(249,115,22,.06); color: var(--brand-primary); cursor: pointer; padding: .3rem .65rem; font: inherit; font-size: .7rem; font-weight: 600; transition: background .15s ease, border-color .15s ease; }
  .mm-chat-suggestion:hover { background: rgba(249,115,22,.14); border-color: var(--brand-primary); }
  .mm-chat-sources { display: flex; gap: .4rem; flex-wrap: wrap; margin-top: .4rem; }
  .mm-chat-source { font-size: .68rem; color: var(--text-muted); background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: .2rem .5rem; }
  .mm-chat-typing { display: flex; align-items: center; gap: .45rem; color: var(--text-muted); font-size: .75rem; }
  .mm-chat-typing-dots { display: inline-flex; gap: .2rem; } .mm-chat-typing-dots i { width: .32rem; height: .32rem; border-radius: 50%; background: var(--brand-secondary); animation: mm-dot 1s infinite alternate; } .mm-chat-typing-dots i:nth-child(2) { animation-delay: .15s; } .mm-chat-typing-dots i:nth-child(3) { animation-delay: .3s; }
  .mm-chat-form { display: flex; gap: .5rem; padding: .75rem .85rem .85rem; border-top: 1px solid var(--border-subtle); background: var(--bg-elevated); }
  .mm-chat-input { min-width: 0; flex: 1; }
  .mm-chat-action { border: 0; border-radius: var(--radius-md); background: var(--brand-primary); color: #fff; cursor: pointer; padding: .55rem .8rem; font: inherit; font-size: .78rem; font-weight: 800; transition: background .16s ease, transform .16s ease; }
  .mm-chat-action:hover:not(:disabled) { background: var(--brand-primary-dark); transform: translateY(-1px); }
  .mm-chat-action:disabled, .mm-chat-prompt:disabled { cursor: not-allowed; opacity: .55; }
  @keyframes mm-chat-in { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes mm-dot { to { opacity: .35; transform: translateY(-2px); } }
  @media (max-width: 480px) { .mm-chat-toggle { right: 1rem; bottom: 1rem; } .mm-chat-panel { right: 1rem; bottom: 5.75rem; width: calc(100vw - 2rem); height: min(42rem, calc(100dvh - 7rem)); } }
  @media (prefers-reduced-motion: reduce) { .mm-chat-panel, .mm-chat-typing-dots i { animation: none; } .mm-chat-toggle, .mm-chat-action { transition: none; } }
`;

function normaliseContext(detail) {
  if (typeof detail === "string") return { prompt: detail, label: "Suggested question" };
  if (!detail || typeof detail !== "object") return null;
  const prompt = detail.prompt || detail.question || detail.hint || detail.text;
  if (typeof prompt !== "string" || !prompt.trim()) return null;
  return { prompt: prompt.trim(), label: detail.label || detail.source || "Suggested question" };
}

/**
 * Renders the LLM answer text as proper JSX:
 * - Converts "• item" lines into <li> list items
 * - Preserves \n line breaks as <br>
 */
function renderAnswerText(text) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, pi) => {
    const lines = para.split("\n");
    const isList = lines.some((l) => l.trim().startsWith("•") || l.trim().startsWith("-"));
    if (isList) {
      return (
        <ul key={pi}>
          {lines.map((line, li) => {
            const clean = line.replace(/^[\s•\-]+/, "").trim();
            return clean ? <li key={li}>{clean}</li> : null;
          })}
        </ul>
      );
    }
    return <p key={pi}>{para}</p>;
  });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! Welcome to Muscle Max. I'm your dedicated AI supplement & store assistant. How can I help power your training today?",
      suggestions: SUGGESTED_PROMPTS,
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextSuggestion, setContextSuggestion] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const onContext = (event) => {
      const suggestion = normaliseContext(event.detail);
      if (!suggestion) return;
      setContextSuggestion(suggestion);
      setIsOpen(true);
    };
    window.addEventListener("musclemax:chat-context", onContext);
    return () => window.removeEventListener("musclemax:chat-context", onContext);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, loading]);

  const handleSend = useCallback(async (questionText) => {
    const question = (questionText || input).trim();
    if (!question || loading) return;
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", text: question, suggestions: [], sources: [] },
    ]);
    setInput("");
    setLoading(true);
    try {
      const response = await askChatbot(question);
      const data = response.data || {};
      const answer = data.answer || "I don't know based on the available Muscle Max information.";
      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      const sources = Array.isArray(data.sources) ? data.sources.filter((s) => s.title) : [];
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-assistant`, role: "assistant", text: answer, suggestions, sources },
      ]);
    } catch (error) {
      console.error("Chatbot query failed", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text: "I don't know based on the available Muscle Max information.",
          suggestions: ["What products do you have?", "What is your return policy?"],
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const askContextSuggestion = () => {
    if (!contextSuggestion) return;
    const { prompt } = contextSuggestion;
    setContextSuggestion(null);
    handleSend(prompt);
  };

  return (
    <>
      <style>{WIDGET_STYLES}</style>
      <button
        id="chat-widget-toggle"
        className="mm-chat-toggle"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close Muscle Max assistant" : "Open Muscle Max assistant"}
        aria-expanded={isOpen}
        aria-controls="musclemax-chat-panel"
      >
        {isOpen ? "×" : "✦"}
      </button>

      {isOpen && (
        <section id="musclemax-chat-panel" className="mm-chat-panel" aria-label="Muscle Max assistant">
          <header className="mm-chat-header">
            <div className="mm-chat-identity">
              <span className="mm-chat-mark" aria-hidden="true">M</span>
              <div>
                <h2 className="mm-chat-title">Muscle Max Assistant</h2>
                <p className="mm-chat-status">
                  <span className="mm-chat-status-dot" aria-hidden="true" />
                  AI Supplement Advisor
                </p>
              </div>
            </div>
            <button className="mm-chat-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">×</button>
          </header>

          {contextSuggestion && (
            <aside className="mm-chat-context" aria-label="Product suggestion">
              <div className="mm-chat-context-copy">
                <span className="mm-chat-context-label">{contextSuggestion.label}</span>
                {contextSuggestion.prompt}
              </div>
              <button
                className="mm-chat-dismiss"
                type="button"
                onClick={() => setContextSuggestion(null)}
                aria-label="Dismiss suggested question"
              >×</button>
            </aside>
          )}

          <main className="mm-chat-thread" aria-live="polite" aria-busy={loading}>
            {messages.map((message) => (
              <article
                className={`mm-chat-message mm-chat-message--${message.role}`}
                key={message.id}
              >
                <span className="mm-chat-speaker">
                  {message.role === "user" ? "You" : "Muscle Max"}
                </span>
                <div className="mm-chat-bubble">
                  {renderAnswerText(message.text)}
                </div>

                {/* Source links */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mm-chat-sources" aria-label="Sources">
                    {message.sources.map((src, i) => (
                      <span key={i} className="mm-chat-source">
                        📦 {src.title}{src.price ? ` — ₹${src.price}` : ""}
                      </span>
                    ))}
                  </div>
                )}

                {/* Follow-up suggestion chips */}
                {message.role === "assistant" && message.suggestions && message.suggestions.length > 0 && (
                  <div className="mm-chat-suggestions" aria-label="Follow-up questions">
                    {message.suggestions.map((s) => (
                      <button
                        key={s}
                        className="mm-chat-suggestion"
                        type="button"
                        onClick={() => handleSend(s)}
                        disabled={loading}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {loading && (
              <div className="mm-chat-typing">
                <span className="mm-chat-typing-dots" aria-hidden="true">
                  <i /><i /><i />
                </span>
                Checking store information…
              </div>
            )}
            <div ref={messagesEndRef} />
          </main>

          <form
            className="mm-chat-form"
            onSubmit={(event) => { event.preventDefault(); handleSend(); }}
          >
            <input
              ref={inputRef}
              className="form-input mm-chat-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={loading}
              placeholder="Ask about a product, policy or dosage…"
              aria-label="Ask Muscle Max a question"
            />
            <button className="mm-chat-action" type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}
    </>
  );
}
