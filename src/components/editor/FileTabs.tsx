"use client";

import { useState } from "react";
import type { DevicePreview, ProjectFile } from "@/types";

interface FileTabsProps {
  files: ProjectFile[];
  active: string;
  onChange: (path: string) => void;
}

const fileMeta: Record<string, { color: string; label: string }> = {
  "index.html": { color: "text-orange-300", label: "HTML" },
  "styles.css": { color: "text-cyan-300", label: "CSS" },
  "script.js": { color: "text-yellow-300", label: "JS" },
};

const fileOrder = ["index.html", "styles.css", "script.js"];

export default function FileTabs({ files, active, onChange }: FileTabsProps) {
  const tabs = fileOrder.filter((p) => files.some((f) => f.path === p));
  const current = tabs.includes(active) ? active : tabs[0] ?? "index.html";
  const [copied, setCopied] = useState<string | null>(null);

  const copyCurrent = async () => {
    const file = files.find((f) => f.path === current);
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.content ?? "");
      setCopied(current);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/5 bg-black/20">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((p) => {
          const meta = fileMeta[p] ?? {
            color: "text-zinc-300",
            label: p,
          };
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition ${
                current === p
                  ? "bg-white/10 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
            >
              <span className={meta.color}>●</span> {p}
            </button>
          );
        })}
        {tabs.length === 0 && (
          <span className="text-xs text-zinc-500 px-2">No files</span>
        )}
      </div>
      {tabs.length > 0 && (
        <button
          type="button"
          onClick={copyCurrent}
          className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-md border border-white/10 text-zinc-300 hover:bg-white/5 transition"
        >
          {copied === current ? "Copied ✓" : "Copy"}
        </button>
      )}
    </div>
  );
}

const deviceMeta: Record<DevicePreview, { label: string }> = {
  desktop: { label: "Desktop" },
  tablet: { label: "Tablet" },
  mobile: { label: "Mobile" },
};

interface DeviceToggleProps {
  device: DevicePreview;
  onChange: (d: DevicePreview) => void;
}

export function DeviceToggle({ device, onChange }: DeviceToggleProps) {
  return (
    <div className="hidden sm:flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
      {(Object.keys(deviceMeta) as DevicePreview[]).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition ${
            device === d
              ? "bg-white/10 text-zinc-100"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {deviceMeta[d].label}
        </button>
      ))}
    </div>
  );
}
