"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/ui/Loader";

export default function useRequireAuth() {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isConfigured) {
      router.replace("/login?error=not-configured");
      return;
    }
    if (!user) {
      router.replace("/login");
    }
  }, [user, loading, isConfigured, router]);

  return {
    ready: !loading && isConfigured && Boolean(user),
    user,
    loading,
    isConfigured,
  };
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, loading } = useRequireAuth();
  if (!ready) {
    return (
      <Loader
        fullScreen
        size="lg"
        label={loading ? "Checking your session..." : "Redirecting..."}
      />
    );
  }
  return <>{children}</>;
}
