import Link from "next/link";
import { SparklesIcon } from "./Icons";

const footerLinks = [
  { href: "#features", label: "Features" },
  { href: "#templates", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 max-w-md">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/30">
                <SparklesIcon className="h-4 w-4 text-white" />
              </span>
              <span className="text-sm font-semibold">AI Website Builder</span>
            </Link>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
              Build stunning, responsive websites with AI in minutes. Powered
              by OpenRouter, secured by Firebase, designed for everyone.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-100 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-zinc-100 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>
            © {new Date().getFullYear()} AI Website Builder. All rights reserved.
          </p>
          <p>Built with Next.js, Tailwind CSS, and Firebase.</p>
        </div>
      </div>
    </footer>
  );
}
