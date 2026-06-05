"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import {
  createUserProfile,
  ensureUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserSubscription,
  type UpdateUserProfileInput,
} from "@/lib/firestore-service";
import type { SubscriptionPlan, UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfileData: (
    data: UpdateUserProfileInput,
  ) => Promise<UserProfile | null>;
  switchPlan: (plan: SubscriptionPlan) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function describeAuthError(code: string | undefined, fallback: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "An account with that email already exists.",
    "auth/invalid-email": "That email address looks invalid.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return (code && map[code]) || fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const profile = await ensureUserProfile(u.uid, {
            name: u.displayName || u.email?.split("@")[0] || "User",
            email: u.email || "",
            photoURL: u.photoURL,
          });
          setUserProfile(profile);
        } catch (e) {
          console.error("Failed to load user profile", e);
          setError("Could not load your profile. Try again later.");
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      if (!isFirebaseConfigured || !auth) {
        throw new Error(
          "Authentication isn't configured. Add Firebase env vars to .env.local.",
        );
      }
      if (!name.trim()) throw new Error("Please enter your name.");
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
        const profile = await createUserProfile(cred.user.uid, {
          name: name.trim(),
          email: cred.user.email || email,
          photoURL: cred.user.photoURL,
          provider: "password",
        });
        setUserProfile(profile);
        setUser(cred.user);
      }
    },
    [],
  );

  const login = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        "Authentication isn't configured. Add Firebase env vars to .env.local.",
      );
    }
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await fbSignOut(auth);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!auth?.currentUser) {
      setUserProfile(null);
      return null;
    }
    const fresh = await getUserProfile(auth.currentUser.uid);
    setUserProfile(fresh);
    return fresh;
  }, []);

  const updateProfileData = useCallback(
    async (data: UpdateUserProfileInput): Promise<UserProfile | null> => {
      if (!auth?.currentUser) return null;
      await updateUserProfile(auth.currentUser.uid, data);
      return refreshProfile();
    },
    [refreshProfile],
  );

  const switchPlan = useCallback(
    async (plan: SubscriptionPlan): Promise<UserProfile | null> => {
      if (!auth?.currentUser) return null;
      await updateUserSubscription(auth.currentUser.uid, plan);
      return refreshProfile();
    },
    [refreshProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userProfile,
      loading,
      error,
      isConfigured: isFirebaseConfigured,
      signup,
      login,
      logout,
      clearError,
      refreshProfile,
      updateProfileData,
      switchPlan,
    }),
    [
      user,
      userProfile,
      loading,
      error,
      signup,
      login,
      logout,
      clearError,
      refreshProfile,
      updateProfileData,
      switchPlan,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}

export { describeAuthError };
