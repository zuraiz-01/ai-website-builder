"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFirebaseConfigured || !auth) {
      setError(
        "Authentication isn't configured yet. Add Firebase env vars to enable login.",
      );
      return;
    }
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const map: Record<string, string> = {
        "auth/invalid-email": "That email address looks invalid.",
        "auth/user-not-found": "No account found with that email.",
        "auth/wrong-password": "Incorrect password. Try again.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setError(map[code ?? ""] ?? (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-7 sm:p-9 shadow-2xl shadow-violet-500/10">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-zinc-400">
        Sign in to your account to continue building.
      </p>

      {!isFirebaseConfigured && (
        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Firebase is not configured. Add the required env vars to{" "}
          <code className="font-mono">.env.local</code> to enable real login.
          The form below is in demo mode.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-violet-300 hover:text-violet-200"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
