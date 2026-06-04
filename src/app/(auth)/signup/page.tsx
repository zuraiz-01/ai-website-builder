"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth, describeAuthError } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isConfigured, user, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(name.trim(), email, password);
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
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-zinc-400">
        Start building websites with AI in minutes.
      </p>

      {!isConfigured && (
        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Firebase is not configured. Add the required env vars to{" "}
          <code className="font-mono">.env.local</code> to enable real signup.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Full name"
          type="text"
          name="name"
          autoComplete="name"
          required
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Use 6+ characters with a mix of letters and numbers."
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
          Create account
        </Button>

        <p className="text-[11px] text-center text-zinc-500">
          By signing up, you agree to our Terms and Privacy Policy.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-violet-300 hover:text-violet-200"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
