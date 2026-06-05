"use client";

import type { SubscriptionPlan, UserSubscription } from "@/types";
import UsageMeter, { planBadgeClass, subscriptionStartedLabel } from "./UsageMeter";
import { SparklesIcon } from "@/components/landing/Icons";

interface SubscriptionCardProps {
  subscription: UserSubscription;
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const used = Math.min(subscription.usedGenerations, subscription.generationLimit);
  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
            Current subscription
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white" />
            </span>
            <h3 className="text-2xl font-bold text-zinc-50">
              {subscription.plan === "free"
                ? "Free"
                : subscription.plan === "pro"
                  ? "Pro"
                  : "Team"}
            </h3>
            <span
              className={`text-[10px] uppercase tracking-wider font-semibold rounded-full border px-2 py-0.5 ${planBadgeClass(subscription.plan)}`}
            >
              {subscription.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <UsageMeter
          used={used}
          limit={subscription.generationLimit}
          label="Generations used"
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Project limit</span>
            <span className="font-mono text-zinc-200">
              {subscription.projectLimit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-violet-500/50 to-cyan-500/50" />
          </div>
          <p className="text-[11px] text-zinc-500">Slots reserved for your plan</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
        <span>
          Started:{" "}
          <span className="text-zinc-200">
            {subscriptionStartedLabel(subscription)}
          </span>
        </span>
        <span>·</span>
        <span>
          Status:{" "}
          <span className="text-zinc-200 capitalize">{subscription.status}</span>
        </span>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500 mb-2">
          Features included
        </p>
        <ul className="grid sm:grid-cols-2 gap-y-1.5 gap-x-3 text-sm text-zinc-300">
          {subscription.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="text-violet-300 mt-0.5">•</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] text-zinc-500 border-t border-white/5 pt-3">
        Payment is disabled for now. Plans can be changed manually for testing.
      </p>
    </div>
  );
}

export function planLabel(plan: SubscriptionPlan): string {
  if (plan === "pro") return "Pro";
  if (plan === "team") return "Team";
  return "Free";
}
