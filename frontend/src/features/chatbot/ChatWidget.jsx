import { useEffect, useRef, useState, useCallback } from "react";
import { askChatbot } from "../../services/chatbotApi";
import { ChatIcon, XIcon, PackageIcon, AlertCircleIcon, BotIcon } from "../../components/common/Icons";

const SUGGESTED_PROMPTS = [
  "What protein products do you have?",
  "What is your return & refund policy?",
  "How does shipping and delivery work?",
  "Can I stack Whey Protein with Creatine?",
];

const WIDGET_STYLES = `
  .mm-chat-toggle {
    position: fixed;
    right: 1.5rem;
    bottom: 1.5rem;
    z-index: 999;
    width: 3.8rem;
    height: 3.8rem;
    border: 2px solid #84cc16;
    border-radius: 50%;
    background: #9ee600;
    color: #090d12;
    box-shadow: 0 10px 28px rgba(0,0,0,.5), 0 0 0 4px rgba(158,230,0,.22);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform .18s ease, box-shadow .18s ease;
  }
  .mm-chat-toggle:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 14px 34px rgba(0,0,0,.6), 0 0 0 6px rgba(158,230,0,.3);
  }
  .mm-chat-toggle:focus-visible, .mm-chat-action:focus-visible, .mm-chat-close:focus-visible, .mm-chat-prompt:focus-visible {
    outline: 2px solid #9ee600;
    outline-offset: 3px;
  }
  .mm-chat-panel {
    position: fixed;
    right: 1.5rem;
    bottom: 6.2rem;
    z-index: 998;
    width: min(26.5rem, calc(100vw - 2rem));
    height: min(42rem, calc(100dvh - 8rem));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #273142;
    border-radius: var(--radius-xl);
    background: #0d1117;
    box-shadow: 0 24px 60px rgba(0,0,0,.75);
    animation: mm-chat-in .22s ease-out both;
  }
  .mm-chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
    padding: 1rem 1.15rem;
    background: #161b22;
    border-bottom: 1px solid #262f3d;
  }
  .mm-chat-identity {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: .75rem;
  }
  .mm-chat-mark {
    display: grid;
    width: 2.35rem;
    height: 2.35rem;
    flex: 0 0 auto;
    place-items: center;
    border-radius: var(--radius-md);
    background: #9ee600;
    color: #090d12;
    font-weight: 900;
    box-shadow: 0 4px 12px rgba(158,230,0,.25);
  }
  .mm-chat-title {
    margin: 0;
    color: #f1f5f9;
    font-size: .95rem;
    font-weight: 800;
    letter-spacing: .01em;
  }
  .mm-chat-status {
    display: flex;
    align-items: center;
    gap: .35rem;
    margin: .15rem 0 0;
    color: #94a3b8;
    font-size: .72rem;
  }
  .mm-chat-status-dot {
    width: .45rem;
    height: .45rem;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 3px rgba(34,197,94,.18);
  }
  .mm-chat-close {
    width: 2rem;
    height: 2rem;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    font-size: 1.35rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  .mm-chat-close:hover {
    background: rgba(255,255,255,.08);
    color: #ffffff;
  }
  .mm-chat-context {
    display: flex;
    align-items: flex-start;
    gap: .6rem;
    margin: .75rem .85rem 0;
    padding: .65rem .75rem;
    border: 1px solid rgba(158,230,0,.4);
    border-left: 3px solid #9ee600;
    border-radius: var(--radius-md);
    background: rgba(158,230,0,.08);
  }
  .mm-chat-context-copy {
    min-width: 0;
    flex: 1;
    color: #e2e8f0;
    font-size: .76rem;
    line-height: 1.4;
  }
  .mm-chat-context-label {
    display: block;
    margin-bottom: .15rem;
    color: #a3e635;
    font-size: .65rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .mm-chat-dismiss {
    border: 0;
    background: transparent;
    color: #94a3b8;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
  }
  .mm-chat-dismiss:hover { color: #ffffff; }
  .mm-chat-prompts {
    padding: .75rem .9rem .35rem;
    background: #11151b;
    border-bottom: 1px solid #1f2733;
  }
  .mm-chat-section-label {
    display: block;
    margin-bottom: .45rem;
    color: #94a3b8;
    font-size: .66rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .mm-chat-prompt-row {
    display: flex;
    gap: .45rem;
    overflow-x: auto;
    padding-bottom: .35rem;
    scrollbar-width: thin;
  }
  .mm-chat-prompt {
    flex: 0 0 auto;
    border: 1px solid #2d3748;
    border-radius: var(--radius-full);
    background: #161b22;
    color: #cbd5e1;
    cursor: pointer;
    padding: .38rem .7rem;
    font: inherit;
    font-size: .72rem;
    transition: border-color .16s ease, color .16s ease, background .16s ease;
  }
  .mm-chat-prompt:hover {
    border-color: #9ee600;
    background: rgba(158,230,0,.1);
    color: #ffffff;
  }
  .mm-chat-thread {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    gap: .85rem;
    overflow-y: auto;
    padding: .95rem;
    background: #0d1117;
  }
  .mm-chat-message {
    display: flex;
    flex-direction: column;
    gap: .25rem;
    max-width: 90%;
  }
  .mm-chat-message--user {
    align-self: flex-end;
    align-items: flex-end;
  }
  .mm-chat-message--assistant {
    align-self: flex-start;
  }
  .mm-chat-speaker {
    color: #64748b;
    font-size: .64rem;
    font-weight: 800;
    letter-spacing: .07em;
    text-transform: uppercase;
  }
  .mm-chat-bubble {
    padding: .75rem .95rem;
    border-radius: 12px;
    font-size: .86rem;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
  .mm-chat-bubble p { margin: 0 0 .45rem; }
  .mm-chat-bubble p:last-child { margin: 0; }
  .mm-chat-bubble ul { margin: .35rem 0; padding-left: 1.2rem; }
  .mm-chat-bubble li { margin-bottom: .25rem; }
  .mm-chat-heading { margin: 0 0 .35rem; font-size: .9rem; font-weight: 700; color: #f1f5f9; }
  .mm-chat-message--assistant .mm-chat-bubble {
    background: #161b22;
    border: 1px solid #283344;
    color: #e2e8f0;
    border-top-left-radius: 3px;
  }
  .mm-chat-message--user .mm-chat-bubble {
    background: #1a2816;
    border: 1px solid rgba(158,230,0,.45);
    color: #f0fdf4;
    border-bottom-right-radius: 3px;
  }
  .mm-chat-note {
    margin-top: .75rem;
    padding: .75rem .85rem;
    background: rgba(158, 230, 0, 0.08);
    border-left: 3px solid #9ee600;
    border-radius: 4px;
    font-size: .82rem;
  }
  .mm-chat-note-header {
    display: flex;
    align-items: center;
    gap: .35rem;
    font-weight: 800;
    color: #a3e635;
    margin-bottom: .3rem;
    font-size: .72rem;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .mm-chat-note-body {
    color: #cbd5e1;
    line-height: 1.5;
  }
  .mm-chat-suggestions {
    display: flex;
    gap: .4rem;
    flex-wrap: wrap;
    margin-top: .45rem;
  }
  .mm-chat-suggestion {
    border: 1px solid #2d3748;
    border-radius: var(--radius-full);
    background: #161b22;
    color: #a3e635;
    cursor: pointer;
    padding: .32rem .7rem;
    font: inherit;
    font-size: .72rem;
    font-weight: 600;
    transition: background .15s ease, border-color .15s ease, color .15s ease;
  }
  .mm-chat-suggestion:hover {
    background: rgba(158,230,0,.14);
    border-color: #9ee600;
    color: #ffffff;
  }
  .mm-chat-sources {
    display: flex;
    gap: .4rem;
    flex-wrap: wrap;
    margin-top: .4rem;
  }
  .mm-chat-source {
    display: inline-flex;
    align-items: center;
    gap: .35rem;
    font-size: .7rem;
    color: #94a3b8;
    background: #161b22;
    border: 1px solid #262f3d;
    border-radius: var(--radius-sm);
    padding: .25rem .55rem;
  }
  .mm-chat-typing {
    display: flex;
    align-items: center;
    gap: .45rem;
    color: #94a3b8;
    font-size: .75rem;
  }
  .mm-chat-typing-dots { display: inline-flex; gap: .2rem; }
  .mm-chat-typing-dots i { width: .32rem; height: .32rem; border-radius: 50%; background: #9ee600; animation: mm-dot 1s infinite alternate; }
  .mm-chat-typing-dots i:nth-child(2) { animation-delay: .15s; }
  .mm-chat-typing-dots i:nth-child(3) { animation-delay: .3s; }
  .mm-chat-form {
    display: flex;
    gap: .55rem;
    padding: .85rem 1rem;
    border-top: 1px solid #232936;
    background: #161b22;
  }
  .mm-chat-input {
    min-width: 0;
    flex: 1;
    background: #0d1117 !important;
    border: 1px solid #30363d !important;
    color: #f1f5f9 !important;
    border-radius: 8px !important;
    padding: .55rem .85rem !important;
    font-size: .84rem !important;
  }
  .mm-chat-input:focus {
    border-color: #9ee600 !important;
    outline: none !important;
  }
  .mm-chat-action {
    border: 0;
    border-radius: 8px;
    background: #9ee600;
    color: #000000;
    cursor: pointer;
    padding: .55rem 1.05rem;
    font: inherit;
    font-size: .82rem;
    font-weight: 800;
    transition: background .16s ease, transform .16s ease;
  }
  .mm-chat-action:hover:not(:disabled) {
    background: #bbf73e;
    transform: translateY(-1px);
  }
  .mm-chat-action:disabled, .mm-chat-prompt:disabled {
    cursor: not-allowed;
    opacity: .5;
  }
  @keyframes mm-chat-in {
    from { opacity: 0; transform: translateY(12px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes mm-dot { to { opacity: .35; transform: translateY(-2px); } }
  @media (max-width: 480px) {
    .mm-chat-toggle { right: 1rem; bottom: 1rem; }
    .mm-chat-panel { right: 1rem; bottom: 5.75rem; width: calc(100vw - 2rem); height: min(42rem, calc(100dvh - 7rem)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .mm-chat-panel, .mm-chat-typing-dots i { animation: none; }
    .mm-chat-toggle, .mm-chat-action { transition: none; }
  }
`;

function normaliseContext(detail) {
  if (typeof detail === "string") return { prompt: detail, label: "Suggested question" };
  if (!detail || typeof detail !== "object") return null;
  const prompt = detail.prompt || detail.question || detail.hint || detail.text;
  if (typeof prompt !== "string" || !prompt.trim()) return null;
  return { prompt: prompt.trim(), label: detail.label || detail.source || "Suggested question" };
}

function renderFormattedInline(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/**
 * Renders the LLM answer text as proper JSX:
 * - Parses Markdown bold formatting (**text**)
 * - Renders **Note:** sections as distinct callout banners
 * - Converts "• item" and "- item" lines into <li> list items
 * - Preserves \n line breaks
 */
function renderAnswerText(text) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, pi) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Check if this paragraph is a Note callout
    if (trimmed.startsWith("**Note:**") || trimmed.startsWith("Note:") || trimmed.startsWith("**Important Note:**")) {
      const noteContent = trimmed
        .replace(/^\*\*Important Note:\*\*\s*/i, "")
        .replace(/^\*\*Note:\*\*\s*/i, "")
        .replace(/^Note:\s*/i, "");

      return (
        <div key={pi} className="mm-chat-note">
          <div className="mm-chat-note-header">
            <AlertCircleIcon size={14} color="#a3e635" />
            <span>Note</span>
          </div>
          <div className="mm-chat-note-body">
            {renderFormattedInline(noteContent)}
          </div>
        </div>
      );
    }

    const lines = trimmed.split("\n");
    const isList = lines.some((l) => l.trim().startsWith("•") || l.trim().startsWith("-") || /^\d+\.\s/.test(l.trim()));

    if (isList) {
      return (
        <ul key={pi}>
          {lines.map((line, li) => {
            const clean = line.replace(/^[\s•\-\d\.]+\s*/, "").trim();
            if (!clean) return null;
            return <li key={li}>{renderFormattedInline(clean)}</li>;
          })}
        </ul>
      );
    }

    if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
      const cleanHeader = trimmed.replace(/^#+\s*/, "");
      return <h4 key={pi} className="mm-chat-heading">{renderFormattedInline(cleanHeader)}</h4>;
    }

    return (
      <p key={pi}>
        {lines.map((l, li) => (
          <span key={li}>
            {renderFormattedInline(l)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
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
          text: "I don't know based on the available Muscle Max information.\n\n**Note:** Please ask questions about our products, dosage, ingredients, return policies, or store shipping.",
          suggestions: ["What products do you have?", "What is your return policy?"],
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

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
        {isOpen ? <XIcon size={22} color="#090d12" /> : <ChatIcon size={24} color="#090d12" />}
      </button>

      {isOpen && (
        <section id="musclemax-chat-panel" className="mm-chat-panel" aria-label="Muscle Max assistant">
          <header className="mm-chat-header">
            <div className="mm-chat-identity">
              <span className="mm-chat-mark" aria-hidden="true">
                <BotIcon size={20} color="#090d12" />
              </span>
              <div>
                <h2 className="mm-chat-title">Muscle Max Assistant</h2>
                <p className="mm-chat-status">
                  <span className="mm-chat-status-dot" aria-hidden="true" />
                  Store & Supplement AI
                </p>
              </div>
            </div>
            <button className="mm-chat-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">
              <XIcon size={18} color="#94a3b8" />
            </button>
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
              >
                <XIcon size={14} color="#94a3b8" />
              </button>
            </aside>
          )}

          <div className="mm-chat-prompts">
            <span className="mm-chat-section-label">Suggested Inquiries</span>
            <div className="mm-chat-prompt-row">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="mm-chat-prompt"
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <main className="mm-chat-thread" aria-live="polite" aria-busy={loading}>
            {messages.map((message) => (
              <article
                className={`mm-chat-message mm-chat-message--${message.role}`}
                key={message.id}
              >
                <span className="mm-chat-speaker">
                  {message.role === "user" ? "You" : "Muscle Max AI"}
                </span>
                <div className="mm-chat-bubble">
                  {renderAnswerText(message.text)}
                </div>

                {/* Source links */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mm-chat-sources" aria-label="Sources">
                    {message.sources.map((src, i) => (
                      <span key={i} className="mm-chat-source">
                        <PackageIcon size={12} color="#a3e635" />
                        <span>{src.title}{src.price ? ` — ₹${src.price}` : ""}</span>
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
              className="mm-chat-input"
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

