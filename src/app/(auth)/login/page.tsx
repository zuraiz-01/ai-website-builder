"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth, describeAuthError } from "@/context/AuthContext";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isConfigured, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "not-configured"
      ? "Firebase isn't configured. Add NEXT_PUBLIC_FIREBASE_* env vars."
      : null,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(describeAuthError(code, (err as Error).message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-7 sm:p-9 shadow-2xl shadow-violet-500/10">
      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-sm text-zinc-400">
        Sign in to your account to continue building.
      </p>

      {!isConfigured && (
        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Firebase is not configured. Add the required env vars to{" "}
          <code className="font-mono">.env.local</code> to enable real login.
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          disabled={!isConfigured}
        >
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
