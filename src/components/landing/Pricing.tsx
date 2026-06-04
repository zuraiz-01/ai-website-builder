import Link from "next/link";
import { CheckIcon } from "./Icons";

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Perfect for trying out the platform.",
    features: ["3 AI generations", "Live preview", "Export ZIP"],
    cta: "Start Free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "per month",
    description: "For builders shipping websites regularly.",
    features: [
      "Unlimited projects",
      "More AI generations",
      "Chat-based editing",
      "Priority features",
    ],
    cta: "Upgrade Soon",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Team",
    price: "Custom",
    cadence: "per team",
    description: "For agencies and product teams.",
    features: [
      "Team collaboration",
      "Shared projects",
      "Advanced deployment",
    ],
    cta: "Contact Us",
    href: "/signup",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Simple, transparent <span className="text-gradient">pricing</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-lg">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                p.highlighted
                  ? "glass border-violet-500/40 shadow-2xl shadow-violet-500/20"
                  : "glass card-hover"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-zinc-100">{p.name}</h3>
              <p className="text-sm text-zinc-400 mt-1">{p.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-50">
                  {p.price}
                </span>
                <span className="text-sm text-zinc-500">{p.cadence}</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-zinc-300 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                      <CheckIcon className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={p.href}
                className={`mt-7 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  p.highlighted
                    ? "btn-primary text-white"
                    : "btn-secondary text-zinc-100"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
