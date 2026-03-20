"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage, type ChatMessage } from "@/lib/api";

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Show me available slots for next week",
  "Who are the orthodontists?",
  "Book appointment with Dr. John Doe",
  "Cancel my appointment (patient 1000082)",
  "What specializations are available?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || sending) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const history: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(text.trim(), history);

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => {
    setMessages([]);
    setInput("");
    setError("");
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--fg)] flex items-center gap-2" style={{ fontFamily: "var(--font-head)" }}>
            <Sparkles className="w-5 h-5 text-[var(--teal-500)]" />
            AI Dental Assistant
          </h2>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Powered by Groq · Ask about appointments, bookings, and more
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--fg-muted)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-muted)] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> New Chat
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-white border border-[var(--border)] p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--teal-50)] flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-[var(--teal-500)]" />
            </div>
            <h3 className="font-semibold text-[var(--fg)] mb-1" style={{ fontFamily: "var(--font-head)" }}>
              How can I help you today?
            </h3>
            <p className="text-sm text-[var(--fg-muted)] mb-6 max-w-sm">
              I can help you book, cancel, or reschedule appointments, check availability, and more.
            </p>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-3 py-2 text-xs font-medium text-[var(--fg-muted)] bg-[var(--bg-soft)] border border-[var(--border)] rounded-xl hover:border-[var(--teal-300)] hover:bg-[var(--teal-50)] hover:text-[var(--teal-700)] transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[var(--teal-100)] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[var(--teal-600)]" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-[var(--teal-500)] text-white rounded-br-md"
                  : "bg-[var(--bg-soft)] border border-[var(--border)] text-[var(--fg)] rounded-bl-md"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={cn(
                "text-[10px] mt-1",
                msg.role === "user" ? "text-white/60" : "text-[var(--fg-dim)]"
              )}>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-[var(--teal-600)] flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--teal-100)] flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-[var(--teal-600)]" />
            </div>
            <div className="bg-[var(--bg-soft)] border border-[var(--border)] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--fg-dim)] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--fg-dim)] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[var(--fg-dim)] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm focus:outline-none focus:border-[var(--teal-500)] focus:ring-2 focus:ring-[var(--teal-500)]/20 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className={cn(
              "px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2",
              input.trim() && !sending
                ? "bg-[var(--teal-500)] text-white hover:bg-[var(--teal-600)] hover:-translate-y-0.5 hover:shadow-lg"
                : "bg-[var(--bg-muted)] text-[var(--fg-dim)] cursor-not-allowed"
            )}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-center text-[10px] text-[var(--fg-dim)] mt-2">
          AI responses may not always be accurate. Verify booking details.
        </p>
      </div>
    </div>
  );
}
