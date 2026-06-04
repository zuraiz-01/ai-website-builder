"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage } from "@/types";
import { SendIcon, SparklesIcon } from "@/components/landing/Icons";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void> | void;
  loading?: boolean;
  initialSuggestions?: string[];
}

const defaultSuggestions = [
  "Make the hero bigger and add a CTA",
  "Switch to a lighter color palette",
  "Add a testimonials section",
];

export default function ChatPanel({
  messages,
  onSend,
  loading = false,
  initialSuggestions = defaultSuggestions,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await onSend(text);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background/40">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
          <SparklesIcon className="h-3.5 w-3.5 text-white" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">AI Assistant</h3>
          <p className="text-[11px] text-zinc-500">
            Describe changes and the AI will update your site
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
        {messages.length === 0 && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500">Try asking:</p>
            {initialSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSend(s)}
                className="block w-full text-left text-sm text-zinc-300 glass rounded-xl px-3 py-2 hover:bg-white/10 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white"
                  : "bg-white/5 border border-white/10 text-zinc-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-slide-up">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-blink" />
              <span
                className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-blink"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-blink"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="p-3 border-t border-white/5 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e as unknown as FormEvent);
            }
          }}
          placeholder="Ask the AI to make changes..."
          rows={1}
          className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.03] text-zinc-100 placeholder-zinc-500 text-sm px-3.5 py-2.5 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none max-h-32"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-primary h-10 w-10 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
