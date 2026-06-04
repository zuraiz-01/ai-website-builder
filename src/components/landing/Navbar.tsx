import Link from "next/link";
import { SparklesIcon } from "./Icons";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#templates", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl border-b border-white/5" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/30">
            <SparklesIcon className="h-5 w-5 text-white" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            AI Website Builder
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="hover:text-white transition-colors duration-200"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm text-zinc-300 hover:text-white transition-colors px-3 py-2"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
