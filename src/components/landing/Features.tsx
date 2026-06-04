import {
  SparklesIcon,
  EyeIcon,
  MessageIcon,
  DownloadIcon,
  FolderIcon,
  ShieldIcon,
} from "./Icons";

const features = [
  {
    icon: SparklesIcon,
    title: "AI Website Generation",
    description:
      "Generate complete websites from simple text prompts. Just describe your idea and watch the magic happen.",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: EyeIcon,
    title: "Live Preview",
    description:
      "Instantly preview your generated website in desktop, tablet, and mobile views in real-time.",
    accent: "from-cyan-500 to-blue-500",
  },
  {
    icon: MessageIcon,
    title: "Chat-Based Editing",
    description:
      "Tell the AI what to change and update your website in seconds with natural language.",
    accent: "from-pink-500 to-rose-500",
  },
  {
    icon: DownloadIcon,
    title: "Export Clean Code",
    description:
      "Download HTML, CSS, and JavaScript files as a ZIP. Production-ready, no bloat.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: FolderIcon,
    title: "Save Projects",
    description:
      "Keep all generated websites saved in your dashboard and revisit them anytime.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: ShieldIcon,
    title: "Firebase Powered",
    description:
      "Secure login, project storage, and fast cloud database support out of the box.",
    accent: "from-indigo-500 to-violet-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient">ship faster</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Powerful features that turn your ideas into production-ready websites
            in minutes, not days.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="glass card-hover group relative overflow-hidden rounded-2xl p-6"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.accent} shadow-lg mb-5`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {f.description}
                </p>
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/0 group-hover:bg-white/5 blur-2xl transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
