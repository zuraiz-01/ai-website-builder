const steps = [
  {
    n: "01",
    title: "Write your website idea",
    description:
      "Describe what you want to build in plain language. A portfolio, a SaaS landing page, a restaurant site — anything.",
  },
  {
    n: "02",
    title: "AI generates the design and code",
    description:
      "Our AI powered by OpenRouter crafts responsive HTML, CSS, and JS in seconds based on your prompt.",
  },
  {
    n: "03",
    title: "Preview and edit with chat",
    description:
      "See your site live across devices. Refine copy, swap colors, or add sections by simply asking the AI.",
  },
  {
    n: "04",
    title: "Export or deploy your website",
    description:
      "Download clean code as a ZIP, or deploy instantly. Your project stays saved in your dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            From idea to website in{" "}
            <span className="text-gradient">4 simple steps</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="glass card-hover relative rounded-2xl p-6 overflow-hidden"
            >
              <div className="text-5xl font-bold text-gradient leading-none mb-4">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {s.description}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-zinc-700 text-xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
