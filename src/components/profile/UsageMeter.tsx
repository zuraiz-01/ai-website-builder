"use client";

import type { SubscriptionPlan, UserSubscription } from "@/types";

interface UsageMeterProps {
  used: number;
  limit: number;
  label?: string;
}

export default function UsageMeter({
  used,
  limit,
  label = "Usage",
}: UsageMeterProps) {
  const safeLimit = Math.max(1, limit);
  const pct = Math.min(100, Math.round((used / safeLimit) * 100));
  const remaining = Math.max(0, limit - used);
  const isAtLimit = remaining <= 0;
  const isAlmost = !isAtLimit && pct >= 80;
  const barColor = isAtLimit
    ? "from-red-500 to-red-400"
    : isAlmost
      ? "from-amber-500 to-amber-400"
      : "from-violet-500 to-cyan-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span
          className={`font-mono ${isAtLimit ? "text-red-300" : "text-zinc-200"}`}
        >
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-zinc-500">
        {isAtLimit
          ? "Limit reached. Upgrade to keep going."
          : `${remaining} remaining`}
      </p>
    </div>
  );
}

export function subscriptionStartedLabel(sub?: UserSubscription | null): string {
  const ts = sub?.startedAt;
  if (!ts) return "—";
  let d: Date;
  if (typeof ts === "number") d = new Date(ts);
  else if (typeof ts === "string") d = new Date(ts);
  else if (ts && typeof ts === "object" && "toDate" in (ts as { toDate?: () => Date }))
    d = (ts as { toDate: () => Date }).toDate();
  else d = new Date();
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export function planBadgeClass(plan: SubscriptionPlan): string {
  switch (plan) {
    case "pro":
      return "bg-violet-500/15 text-violet-300 border-violet-500/20";
    case "team":
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/20";
    case "free":
    default:
      return "bg-zinc-500/15 text-zinc-300 border-zinc-500/20";
  }
}
