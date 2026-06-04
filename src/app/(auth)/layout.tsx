import Link from "next/link";
import { SparklesIcon } from "@/components/landing/Icons";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 bg-aurora pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />

      <header className="relative z-10 px-4 sm:px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/30">
            <SparklesIcon className="h-5 w-5 text-white" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            AI Website Builder
          </span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
