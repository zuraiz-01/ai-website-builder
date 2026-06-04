import Link from "next/link";
import { ArrowRightIcon, PlayIcon, BoltIcon, CodeIcon, CheckIcon } from "./Icons";

const highlights = [
  "No credit card",
  "Free forever plan",
  "3 free generations",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-aurora pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
              Powered by OpenRouter AI
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Build Stunning{" "}
              <span className="text-gradient">Websites with AI</span> in Minutes
            </h1>

            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-zinc-400 leading-relaxed">
              Describe your idea, and our AI will generate a complete responsive
              website with clean code, live preview, and easy export.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white w-full sm:w-auto"
              >
                Start Building Free
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-zinc-100 w-full sm:w-auto"
              >
                <PlayIcon className="h-3.5 w-3.5" />
                View Demo
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start gap-x-6 gap-y-2 flex-wrap text-xs text-zinc-500">
              {highlights.map((h) => (
                <div key={h} className="flex items-center gap-1.5">
                  <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                  {h}
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative h-[460px] sm:h-[520px]">
      <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl animate-glow pointer-events-none" />
      <div
        className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-glow pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      <div className="absolute top-6 left-4 sm:left-8 right-12 sm:right-20 glass rounded-2xl p-4 shadow-2xl shadow-violet-500/10 animate-float z-20">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
          <span className="h-2 w-2 rounded-full bg-red-400/80" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
          <span className="h-2 w-2 rounded-full bg-green-400/80" />
          <span className="ml-2 font-mono">prompt.txt</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <BoltIcon className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm text-zinc-200 leading-relaxed">
            Create a modern portfolio website for a photographer with dark theme,
            gallery grid, and contact form.
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-mono">124 tokens</span>
          <span className="rounded-md bg-violet-500/20 px-2 py-1 text-violet-300 font-medium flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-blink" />
            Generating...
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 sm:right-8 left-16 sm:left-28 glass rounded-2xl p-4 shadow-2xl shadow-cyan-500/10 animate-float-slow z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Live Preview
          </div>
          <div className="flex gap-1">
            <span className="h-5 w-5 rounded bg-white/5" />
            <span className="h-5 w-5 rounded bg-white/5" />
            <span className="h-5 w-5 rounded bg-white/5" />
          </div>
        </div>
        <div className="rounded-lg overflow-hidden border border-white/10 bg-zinc-950">
          <div className="h-4 bg-white/5 flex items-center px-2 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="h-1.5 w-12 rounded-full bg-white/20" />
          </div>
          <div className="p-3 space-y-2">
            <div className="h-2 w-3/4 rounded bg-gradient-to-r from-violet-400/60 to-cyan-400/60" />
            <div className="h-1.5 w-full rounded bg-white/10" />
            <div className="h-1.5 w-5/6 rounded bg-white/10" />
            <div className="grid grid-cols-3 gap-1.5 pt-2">
              <div className="aspect-square rounded bg-gradient-to-br from-violet-500/30 to-transparent border border-white/5" />
              <div className="aspect-square rounded bg-gradient-to-br from-cyan-500/30 to-transparent border border-white/5" />
              <div className="aspect-square rounded bg-gradient-to-br from-pink-500/30 to-transparent border border-white/5" />
            </div>
            <div className="flex gap-1.5 pt-1">
              <div className="h-5 w-14 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" />
              <div className="h-5 w-14 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute top-44 right-0 sm:right-4 glass rounded-lg p-2.5 z-30 animate-float"
        style={{ animationDelay: "1s" }}
      >
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <CodeIcon className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-zinc-300">&lt;div /&gt;</span>
        </div>
      </div>

      <div
        className="absolute top-32 left-0 glass rounded-lg p-2.5 z-30 animate-float-slow"
        style={{ animationDelay: "2.5s" }}
      >
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-zinc-300">deployed</span>
        </div>
      </div>
    </div>
  );
}
