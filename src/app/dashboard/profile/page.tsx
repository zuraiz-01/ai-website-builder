"use client";

import { useCallback, useEffect, useState } from "react";
import TopBar from "@/components/layout/Navbar";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import ProfileForm from "@/components/profile/ProfileForm";
import SubscriptionCard from "@/components/profile/SubscriptionCard";
import PlanCard from "@/components/profile/PlanCard";
import { getPlanConfig, type PlanConfig } from "@/lib/firestore-service";
import { useAuth } from "@/context/AuthContext";
import type { SubscriptionPlan, UserProfile } from "@/types";
import { UserIcon } from "@/components/landing/Icons";

type Toast =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

export default function ProfilePage() {
  const { user, userProfile, refreshProfile, updateProfileData, switchPlan } =
    useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [switchingPlan, setSwitchingPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [toast, setToast] = useState<Toast>(null);
  const [confirmPlan, setConfirmPlan] = useState<SubscriptionPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(userProfile);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (userProfile) setProfile(userProfile);
    refreshProfile().then((p) => {
      if (p) setProfile(p);
    });
    /* eslint-enable react-hooks/set-state-in-effect */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashToast = useCallback((t: Toast) => {
    setToast(t);
    if (t) {
      window.setTimeout(() => setToast(null), 4000);
    }
  }, []);

  const handleSave = async (data: Parameters<typeof updateProfileData>[0]) => {
    setSavingProfile(true);
    try {
      const next = await updateProfileData(data);
      if (next) setProfile(next);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSwitch = async (plan: SubscriptionPlan) => {
    setConfirmPlan(null);
    if (!user) return;
    setSwitchingPlan(plan);
    try {
      const next = await switchPlan(plan);
      if (next) setProfile(next);
      const label = getPlanConfig(plan).label;
      flashToast({
        kind: "success",
        message: `Subscription changed to ${label} plan.`,
      });
    } catch (err) {
      flashToast({
        kind: "error",
        message:
          (err as Error).message || "Failed to switch plan. Please try again.",
      });
    } finally {
      setSwitchingPlan(null);
    }
  };

  if (!user) {
    return (
      <>
        <TopBar title="Profile" />
        <Loader fullScreen size="md" label="Loading profile..." />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <TopBar title="Profile" />
        <EmptyState
          icon={<UserIcon className="h-6 w-6" />}
          title="Profile not available"
          description="We couldn't load your profile. Try refreshing the page."
        />
      </>
    );
  }

  const sub = profile.subscription;
  const planList: SubscriptionPlan[] = ["free", "pro", "team"];

  return (
    <>
      <TopBar
        title="Profile & Subscription"
        subtitle="Manage your account and plan"
      />

      {toast && (
        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            toast.kind === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProfileForm
            profile={profile}
            onSave={async (data) => {
              try {
                await handleSave(data);
                flashToast({ kind: "success", message: "Profile updated." });
              } catch (err) {
                flashToast({
                  kind: "error",
                  message:
                    (err as Error).message || "Failed to save profile.",
                });
                throw err;
              }
            }}
            saving={savingProfile}
          />

          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Change subscription
              </h2>
              <p className="text-xs text-zinc-500">
                Switch plans any time. No payment required in this demo.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {planList.map((p) => (
                <PlanCard
                  key={p}
                  plan={p}
                  currentPlan={sub.plan}
                  onSelect={(plan) => setConfirmPlan(plan)}
                  loading={switchingPlan === p}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <SubscriptionCard subscription={sub} />
          <div className="glass rounded-2xl p-5 space-y-2 text-xs text-zinc-400">
            <p className="text-zinc-200 font-medium text-sm">Account info</p>
            <p>
              User ID:{" "}
              <span className="font-mono text-zinc-500 break-all">
                {profile.uid}
              </span>
            </p>
            <p>
              Created:{" "}
              <span className="text-zinc-200">
                {formatTimestamp(profile.createdAt)}
              </span>
            </p>
            <p>
              Updated:{" "}
              <span className="text-zinc-200">
                {formatTimestamp(profile.updatedAt)}
              </span>
            </p>
          </div>
        </aside>
      </div>

      {confirmPlan && (
        <ConfirmPlanModal
          plan={confirmPlan}
          currentPlan={sub.plan}
          onCancel={() => setConfirmPlan(null)}
          onConfirm={() => handleSwitch(confirmPlan)}
          loading={switchingPlan === confirmPlan}
        />
      )}
    </>
  );
}

function formatTimestamp(ts: unknown): string {
  if (!ts) return "—";
  let d: Date | null = null;
  if (typeof ts === "number") d = new Date(ts);
  else if (typeof ts === "string") d = new Date(ts);
  else if (ts && typeof ts === "object" && "toDate" in (ts as { toDate?: () => Date }))
    d = (ts as { toDate: () => Date }).toDate();
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function ConfirmPlanModal({
  plan,
  currentPlan,
  onCancel,
  onConfirm,
  loading,
}: {
  plan: SubscriptionPlan;
  currentPlan: SubscriptionPlan;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const cfg: PlanConfig = getPlanConfig(plan);
  const downgrading =
    planRank(plan) < planRank(currentPlan);
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="glass rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-zinc-500">
            Confirm plan change
          </p>
          <h3 className="text-lg font-semibold text-zinc-50 mt-1">
            Switch to {cfg.label}?
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            You currently have <span className="text-zinc-200 capitalize">{currentPlan}</span>{" "}
            ({planLimitLabel(currentPlan)}). Switching to {cfg.label} gives you{" "}
            {cfg.generationLimit} AI generations / month and {cfg.projectLimit}{" "}
            projects.
          </p>
          {downgrading && (
            <p className="text-xs text-amber-300 mt-2">
              This is a downgrade. Your existing used generations and projects
              are preserved.
            </p>
          )}
          <p className="text-[11px] text-zinc-500 mt-2">
            Payment is disabled for now. Plans can be changed manually for
            testing.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/20 hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Switching..." : `Switch to ${cfg.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function planRank(p: SubscriptionPlan): number {
  if (p === "pro") return 1;
  if (p === "team") return 2;
  return 0;
}

function planLimitLabel(p: SubscriptionPlan): string {
  if (p === "pro") return "50 generations / 50 projects";
  if (p === "team") return "200 generations / 200 projects";
  return "3 generations / 3 projects";
}
