import Link from "next/link";
import {
  BriefcaseIcon,
  RocketIcon,
  HomeIcon,
  UtensilsIcon,
  MobileIcon,
  SparklesIcon,
} from "./Icons";

const templates = [
  {
    icon: BriefcaseIcon,
    name: "Portfolio Website",
    description: "Showcase your work with a clean, modern personal site.",
    gradient: "from-violet-500/20 via-violet-500/10 to-transparent",
  },
  {
    icon: RocketIcon,
    name: "Agency Website",
    description: "Bold design for creative agencies and studios.",
    gradient: "from-cyan-500/20 via-cyan-500/10 to-transparent",
  },
  {
    icon: SparklesIcon,
    name: "SaaS Landing Page",
    description: "High-converting landing for software products.",
    gradient: "from-pink-500/20 via-pink-500/10 to-transparent",
  },
  {
    icon: HomeIcon,
    name: "Real Estate Website",
    description: "Listings, search, and inquiry flows for properties.",
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
  },
  {
    icon: UtensilsIcon,
    name: "Restaurant Website",
    description: "Menus, reservations, and gallery for eateries.",
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
  },
  {
    icon: MobileIcon,
    name: "App Landing Page",
    description: "Mobile-first launch page for iOS and Android apps.",
    gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent",
  },
];

export default function Templates() {
  return (
    <section id="templates" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-pink-400 mb-3">
            Templates
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Start with a <span className="text-gradient">beautiful template</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Professionally designed starting points for any kind of website.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.name}
                className="glass card-hover group rounded-2xl overflow-hidden"
              >
                <div
                  className={`relative h-40 bg-gradient-to-br ${t.gradient} flex items-center justify-center border-b border-white/5`}
                >
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="relative h-14 w-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center">
                    <Icon className="h-6 w-6 text-zinc-100" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-zinc-100 mb-1">
                    {t.name}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    {t.description}
                  </p>
                  <Link
                    href="/signup"
                    className="block w-full text-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition px-4 py-2 text-sm font-medium text-zinc-100"
                  >
                    Use Template
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
