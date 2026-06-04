"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/Navbar";
import EmptyState from "@/components/ui/EmptyState";
import { FolderIcon, PlusIcon, FolderPlusIcon } from "@/components/landing/Icons";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import type { Project, WebsiteType } from "@/types";

const typeLabels: Record<WebsiteType, string> = {
  portfolio: "Portfolio",
  agency: "Agency",
  saas: "SaaS",
  "real-estate": "Real Estate",
  restaurant: "Restaurant",
  app: "App",
  blog: "Blog",
  ecommerce: "E-commerce",
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<"all" | WebsiteType>("all");

  const projects = useMemo<Project[]>(() => DEMO_PROJECTS, []);
  const filtered = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.type === filter)),
    [projects, filter],
  );

  const stats = useMemo(
    () => ({
      total: projects.length,
      live: projects.length,
      drafts: 0,
      generations: 12,
    }),
    [projects],
  );

  return (
    <>
      <TopBar
        title="Welcome back"
        subtitle="Here's an overview of your projects"
        rightSlot={
          <Link
            href="/dashboard/new"
            className="btn-primary hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            New project
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Projects" value={stats.total} accent="violet" />
          <StatCard label="Live sites" value={stats.live} accent="cyan" />
          <StatCard label="AI generations" value={stats.generations} accent="pink" />
          <StatCard label="Drafts" value={stats.drafts} accent="amber" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Your projects</h2>
            <p className="text-sm text-zinc-500">
              Continue editing or start something new.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "portfolio", "agency", "saas", "real-estate", "restaurant", "app"] as const).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    filter === f
                      ? "bg-white/10 text-zinc-100 border border-white/15"
                      : "bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200"
                  }`}
                >
                  {f === "all" ? "All" : typeLabels[f as WebsiteType]}
                </button>
              ),
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FolderIcon className="h-6 w-6" />}
            title="No projects yet"
            description="Create your first AI-generated website in seconds."
            action={{
              label: "Create new project",
              onClick: () => {
                window.location.href = "/dashboard/new";
              },
            }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className="glass card-hover group rounded-2xl overflow-hidden block"
              >
                <div className="relative h-32 bg-gradient-to-br from-violet-500/15 via-cyan-500/10 to-pink-500/15 border-b border-white/5 flex items-center justify-center">
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="relative h-12 w-16 rounded-md bg-white/10 border border-white/15 flex flex-col p-1 gap-0.5">
                    <div className="h-1.5 w-8 rounded-sm bg-white/30" />
                    <div className="h-1 w-10 rounded-sm bg-white/20" />
                    <div className="h-1 w-6 rounded-sm bg-white/20" />
                    <div className="mt-auto h-3 w-full rounded-sm bg-gradient-to-r from-violet-400/60 to-cyan-400/60" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-300">
                      {typeLabels[p.type]}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {timeAgo(p.updatedAt)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1 truncate group-hover:text-white">
                    {p.name}
                  </h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {p.prompt}
                  </p>
                </div>
              </Link>
            ))}

            <Link
              href="/dashboard/new"
              className="glass card-hover group rounded-2xl border-2 border-dashed border-white/10 hover:border-violet-500/40 flex flex-col items-center justify-center text-center p-6 min-h-[220px]"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center mb-3 text-violet-300 group-hover:scale-110 transition">
                <FolderPlusIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-100">
                Create new project
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Generate a website with AI
              </p>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "violet" | "cyan" | "pink" | "amber";
}) {
  const accentMap = {
    violet: "from-violet-500/20 to-violet-500/0",
    cyan: "from-cyan-500/20 to-cyan-500/0",
    pink: "from-pink-500/20 to-pink-500/0",
    amber: "from-amber-500/20 to-amber-500/0",
  } as const;

  return (
    <div className="glass rounded-2xl p-4 relative overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-60 pointer-events-none`}
      />
      <div className="relative">
        <div className="text-2xl sm:text-3xl font-bold text-zinc-50">{value}</div>
        <div className="text-xs text-zinc-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
