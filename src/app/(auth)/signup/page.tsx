"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { auth, isFirebaseConfigured } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFirebaseConfigured || !auth) {
      setError(
        "Authentication isn't configured yet. Add Firebase env vars to enable signup.",
      );
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user && name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      router.push("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      const map: Record<string, string> = {
        "auth/email-already-in-use": "An account with that email already exists.",
        "auth/invalid-email": "That email address looks invalid.",
        "auth/weak-password": "Password is too weak. Use at least 6 characters.",
      };
      setError(map[code ?? ""] ?? (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-7 sm:p-9 shadow-2xl shadow-violet-500/10">
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-zinc-400">
        Start building websites with AI in minutes.
      </p>

      {!isFirebaseConfigured && (
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

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
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
