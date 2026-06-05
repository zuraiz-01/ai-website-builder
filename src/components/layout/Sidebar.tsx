"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusIcon,
  SparklesIcon,
  UserIcon,
} from "@/components/landing/Icons";
import { useAuth } from "@/context/AuthContext";
import type { SubscriptionPlan } from "@/types";

const links = [
  { href: "/dashboard", label: "Overview", icon: HomeIcon, exact: true },
  { href: "/dashboard/new", label: "New project", icon: PlusIcon },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
];

function planBadgeClasses(plan: SubscriptionPlan | undefined): string {
  if (plan === "pro")
    return "bg-violet-500/15 text-violet-300 border-violet-500/20";
  if (plan === "team")
    return "bg-cyan-500/15 text-cyan-300 border-cyan-500/20";
  return "bg-zinc-500/15 text-zinc-300 border-zinc-500/20";
}

function planLabel(plan: SubscriptionPlan | undefined): string {
  if (plan === "pro") return "Pro";
  if (plan === "team") return "Team";
  return "Free";
}

export default function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const plan = userProfile?.subscription.plan;
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/5 bg-background/40 backdrop-blur">
      <div className="h-16 px-5 flex items-center border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/30">
            <SparklesIcon className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            AI Website Builder
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((l) => {
          const Icon = l.icon;
          const active = l.exact
            ? pathname === l.href
            : pathname?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/5 space-y-3">
        {userProfile && (
          <div className="rounded-xl p-3 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                Plan
              </span>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold rounded-full border px-2 py-0.5 ${planBadgeClasses(plan)}`}
              >
                {planLabel(plan)}
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {(userProfile.subscription.usedGenerations ?? 0)} /{" "}
              {userProfile.subscription.generationLimit ?? 0} generations used
            </p>
            <Link
              href="/dashboard/profile"
              className="mt-2 inline-flex text-[11px] font-medium text-violet-300 hover:text-violet-200"
            >
              Manage plan →
            </Link>
          </div>
        )}
        <div className="rounded-xl p-3 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10">
          <p className="text-xs text-zinc-300 font-medium">Need more credits?</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Switch plans any time from your profile.
          </p>
        </div>
      </div>
    </aside>
  );
}
