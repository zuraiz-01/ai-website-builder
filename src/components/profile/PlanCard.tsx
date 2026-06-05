"use client";

import { getPlanConfig, type PlanConfig } from "@/lib/firestore-service";
import type { SubscriptionPlan } from "@/types";
import { planBadgeClass } from "./UsageMeter";
import { CheckIcon } from "@/components/landing/Icons";

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  loading?: boolean;
}

export default function PlanCard({
  plan,
  currentPlan,
  onSelect,
  loading = false,
}: PlanCardProps) {
  const cfg: PlanConfig = getPlanConfig(plan);
  const isCurrent = plan === currentPlan;
  const isPro = plan === "pro";
  return (
    <div
      className={`glass rounded-2xl p-6 flex flex-col gap-4 relative ${
        isPro ? "ring-1 ring-violet-500/40" : ""
      } ${isCurrent ? "border-violet-500/40" : ""}`}
    >
      {isPro && (
        <span className="absolute -top-2.5 right-4 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow">
          Most popular
        </span>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-zinc-50">{cfg.label}</h3>
        <span
          className={`text-[10px] uppercase tracking-wider font-semibold rounded-full border px-2 py-0.5 ${planBadgeClass(plan)}`}
        >
          {cfg.plan}
        </span>
      </div>
      <p className="text-xs text-zinc-500">
        {plan === "free"
          ? "Get started with the basics."
          : plan === "pro"
            ? "For solo founders and small teams."
            : "For agencies and larger teams."}
      </p>
      <div>
        <p className="text-3xl font-bold text-zinc-50">
          {cfg.generationLimit}
          <span className="text-sm font-normal text-zinc-400"> / month</span>
        </p>
        <p className="text-xs text-zinc-500">
          AI generations included · {cfg.projectLimit} projects
        </p>
      </div>
      <ul className="space-y-2 text-sm text-zinc-300 flex-1">
        {cfg.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-violet-500/15 text-violet-300 flex items-center justify-center">
              <CheckIcon className="h-2.5 w-2.5" />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => !isCurrent && !loading && onSelect(plan)}
        disabled={isCurrent || loading}
        className={`mt-2 w-full inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-200 px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed ${
          isCurrent
            ? "bg-white/5 border border-white/10 text-zinc-300"
            : isPro
              ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/20 hover:brightness-110"
              : "bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10 hover:border-white/20"
        }`}
      >
        {isCurrent
          ? "Current Plan"
          : loading
            ? "Switching..."
            : `Switch to ${cfg.label}`}
      </button>
    </div>
  );
}
