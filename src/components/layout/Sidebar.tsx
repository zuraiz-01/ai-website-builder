"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusIcon,
  SparklesIcon,
} from "@/components/landing/Icons";

const links = [
  { href: "/dashboard", label: "Overview", icon: HomeIcon, exact: true },
  { href: "/dashboard/new", label: "New project", icon: PlusIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
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
      <div className="p-3 border-t border-white/5">
        <div className="rounded-xl p-3 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10">
          <p className="text-xs text-zinc-300 font-medium">Need more credits?</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Upgrade to Pro for unlimited AI generations.
          </p>
          <Link
            href="/#pricing"
            className="mt-2 inline-flex text-[11px] font-medium text-violet-300 hover:text-violet-200"
          >
            See plans →
          </Link>
        </div>
      </div>
    </aside>
  );
}
