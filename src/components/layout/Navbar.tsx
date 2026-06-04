"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRightIcon, SparklesIcon } from "@/components/landing/Icons";
import { useAuth } from "@/context/AuthContext";

interface TopBarProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export default function TopBar({ title, subtitle, rightSlot }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
      router.push("/");
    } catch (e) {
      console.error(e);
      setSigningOut(false);
    }
  };

  const isEditor = pathname?.includes("/projects/");

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-3 min-w-0">
          {isEditor && (
            <Link
              href="/dashboard"
              className="text-zinc-400 hover:text-zinc-100 text-sm"
            >
              ← Back
            </Link>
          )}
          {!isEditor && (
            <Link href="/" className="md:hidden flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
                <SparklesIcon className="h-3.5 w-3.5 text-white" />
              </span>
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightSlot}
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-xs text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded-full hover:bg-white/5 transition"
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          ) : (
            <Link
              href="/signup"
              className="btn-primary inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
            >
              Get started
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
