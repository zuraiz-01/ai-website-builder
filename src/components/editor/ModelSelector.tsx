"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { OpenRouterModel, OpenRouterModelsResponse } from "@/types";
import Loader from "@/components/ui/Loader";

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  freeOnly?: boolean;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
}

const FALLBACK_MODEL_ID = "openrouter/free";

export default function ModelSelector({
  value,
  onChange,
  freeOnly = true,
  placeholder = "Select a model",
  disabled = false,
  compact = false,
}: ModelSelectorProps) {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [fetched, setFetched] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/models", { method: "GET" });
      const data = (await res.json().catch(() => ({}))) as OpenRouterModelsResponse;
      if (data.success === true && Array.isArray(data.models)) {
        setModels(data.models);
        setError(null);
      } else {
        setError(
          (data.success === false && data.error) ||
            "Unable to load OpenRouter models.",
        );
      }
    } catch (e) {
      setError((e as Error).message || "Unable to load OpenRouter models.");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchModels();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visibleModels = useMemo(() => {
    let list = models;
    if (freeOnly) list = list.filter((m) => m.isFree);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [models, freeOnly, search]);

  const selected =
    models.find((m) => m.id === value) ??
    (value ? { id: value, name: value, isFree: false } : null);

  // If parent has no value and we have models, default to the first free one
  useEffect(() => {
    if (!fetched) return;
    if (value && value.length > 0) return;
    if (visibleModels.length === 0) return;
    onChange(visibleModels[0].id);
  }, [fetched, value, visibleModels, onChange]);

  if (loading) {
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-400 ${
          compact ? "h-9" : "h-10"
        }`}
      >
        <Loader size="sm" />
        <span>Loading models...</span>
      </div>
    );
  }

  if (error && models.length === 0) {
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </div>
        <button
          type="button"
          onClick={fetchModels}
          className="text-[11px] font-semibold uppercase tracking-wider underline text-zinc-300"
        >
          Retry
        </button>
        <input type="hidden" value={value || FALLBACK_MODEL_ID} readOnly />
      </div>
    );
  }

  return (
    <div className="space-y-1.5" ref={wrapRef}>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-zinc-100 text-sm px-3.5 transition hover:border-white/20 disabled:opacity-50 ${
            compact ? "py-1.5" : "py-2.5"
          } ${open ? "border-violet-500/60 ring-2 ring-violet-500/20" : ""}`}
        >
          <span className="flex items-center gap-2 min-w-0">
            {selected ? (
              <>
                <span className="truncate font-medium">{selected.name}</span>
                {selected.isFree && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5">
                    Free
                  </span>
                )}
                <span className="shrink-0 text-[10px] text-zinc-500 font-mono">
                  {selected.id}
                </span>
              </>
            ) : (
              <span className="text-zinc-500">{placeholder}</span>
            )}
          </span>
          <span className="text-zinc-500 text-xs">▾</span>
        </button>

        {open && (
          <div className="absolute z-30 mt-1.5 left-0 right-0 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="p-2 border-b border-white/5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full rounded-md border border-white/10 bg-white/[0.03] text-zinc-100 placeholder-zinc-500 text-xs px-2.5 py-1.5 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {visibleModels.length === 0 ? (
                <div className="p-3 text-xs text-zinc-500">No models match.</div>
              ) : (
                visibleModels.map((m) => {
                  const isActive = m.id === value;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onChange(m.id);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 hover:bg-white/5 transition ${
                        isActive ? "bg-violet-500/10" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm text-zinc-100 font-medium truncate">
                          {m.name}
                        </span>
                        {m.isFree && (
                          <span className="shrink-0 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5">
                            Free
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono truncate">
                        {m.id}
                        {m.contextLength
                          ? ` · ${m.contextLength.toLocaleString()} ctx`
                          : ""}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="px-3 py-2 border-t border-white/5 text-[10px] text-zinc-500">
              Free models may have rate limits depending on OpenRouter usage policy.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
