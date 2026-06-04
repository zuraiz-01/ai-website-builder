import Link from "next/link";
import { ArrowRightIcon } from "./Icons";

export default function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-cyan-500/5 to-pink-500/10 p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
              Ready to build your next website with{" "}
              <span className="text-gradient">AI?</span>
            </h2>
            <p className="mt-5 text-zinc-300 text-lg max-w-xl mx-auto">
              Start with a simple prompt and turn your idea into a complete
              website.
            </p>
            <div className="mt-9">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white"
              >
                Start Building Now
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
