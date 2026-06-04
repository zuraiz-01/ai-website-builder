"use client";

import type { DevicePreview } from "@/types";

interface FileTabsProps {
  active: keyof import("@/types").ProjectFiles;
  onChange: (key: keyof import("@/types").ProjectFiles) => void;
  readOnly?: boolean;
}

const tabs: { key: keyof import("@/types").ProjectFiles; label: string; color: string }[] = [
  { key: "index.html", label: "index.html", color: "text-orange-300" },
  { key: "styles.css", label: "styles.css", color: "text-cyan-300" },
  { key: "script.js", label: "script.js", color: "text-yellow-300" },
];

export default function FileTabs({ active, onChange }: FileTabsProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap transition ${
            active === t.key
              ? "bg-white/10 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
          }`}
        >
          <span className={t.color}>●</span> {t.label}
        </button>
      ))}
    </div>
  );
}

const deviceMeta: Record<DevicePreview, { label: string; w: number }> = {
  desktop: { label: "Desktop", w: 0 },
  tablet: { label: "Tablet", w: 768 },
  mobile: { label: "Mobile", w: 375 },
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
