"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import ModelSelector from "@/components/editor/ModelSelector";
import { SparklesIcon, BoltIcon } from "@/components/landing/Icons";
import { useAuth } from "@/context/AuthContext";
import {
  createProject,
  getUserProjects,
  incrementUserGenerationUsage,
  saveChatMessage,
  updateProjectFiles,
  updateProjectStatus,
} from "@/lib/firestore-service";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { WebsiteType } from "@/types";

const websiteTypes: {
  value: WebsiteType;
  label: string;
  description: string;
}[] = [
  {
    value: "portfolio",
    label: "Portfolio",
    description: "Personal or agency portfolio",
  },
  {
    value: "agency",
    label: "Agency",
    description: "Creative or marketing agency",
  },
  { value: "saas", label: "SaaS", description: "Software product landing" },
  {
    value: "real-estate",
    label: "Real Estate",
    description: "Listings and inquiries",
  },
  {
    value: "restaurant",
    label: "Restaurant",
    description: "Menus and reservations",
  },
  { value: "app", label: "App", description: "Mobile app launch page" },
  { value: "blog", label: "Blog", description: "Editorial and articles" },
  {
    value: "ecommerce",
    label: "E-commerce",
    description: "Storefront and products",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { user, userProfile, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState<WebsiteType>("portfolio");
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("openrouter/free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserProjects(user.uid)
      .then((list) => setProjectCount(list.length))
      .catch(() => setProjectCount(null));
  }, [user]);

  const sub = userProfile?.subscription;
  const usedGens = sub?.usedGenerations ?? 0;
  const genLimit = sub?.generationLimit ?? 3;
  const remainingGens = Math.max(0, genLimit - usedGens);
  const projectLimit = sub?.projectLimit ?? 3;
  const projectCountSafe = projectCount ?? 0;
  const remainingProjects = Math.max(0, projectLimit - projectCountSafe);
  const atGenerationLimit = remainingGens <= 0;
  const atProjectLimit = projectCount !== null && remainingProjects <= 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in to create a project.");
      return;
    }
    if (!isFirebaseConfigured) {
      setError(
        "Firebase is not configured. Add env vars to .env.local first.",
      );
      return;
    }
    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }
    if (prompt.trim().length < 10) {
      setError("Please describe your idea in at least 10 characters.");
      return;
    }
    if (atProjectLimit) {
      setError(
        "You have reached your project limit. Upgrade your plan from Profile page.",
      );
      return;
    }
    if (atGenerationLimit) {
      setError(
        "You have reached your generation limit. Upgrade your plan from Profile page.",
      );
      return;
    }

    setLoading(true);
    let projectId: string | null = null;
    try {
      projectId = await createProject(user.uid, {
        title: name.trim(),
        prompt: prompt.trim(),
        type,
        files: [],
        status: "generating",
        selectedModel,
      });

      // Refresh local project count after creation
      if (projectCount !== null) {
        setProjectCount(projectCount + 1);
      }

      await saveChatMessage(projectId, user.uid, {
        role: "user",
        content: prompt.trim(),
      }).catch((err) => {
        console.error("Failed to save user prompt message", err);
      });

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: name.trim(),
          type,
          prompt: prompt.trim(),
          model: selectedModel,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        projectName?: string;
        description?: string;
        files?: { path: string; content: string }[];
        error?: string;
      };

      if (
        res.ok &&
        data.success === true &&
        Array.isArray(data.files) &&
        data.files.length > 0
      ) {
        const files = data.files;

        await updateProjectFiles(projectId, user.uid, files);

        const assistantSummary =
          data.description?.trim() ||
          "I've generated your website. Take a look at the preview.";

        await saveChatMessage(projectId, user.uid, {
          role: "assistant",
          content: assistantSummary,
        }).catch((err) => {
          console.error("Failed to save assistant message", err);
        });

        // Increment generation usage AFTER successful generation
        incrementUserGenerationUsage(user.uid, 1)
          .then(() => refreshProfile())
          .catch((err) => console.error("Failed to increment usage", err));

        router.push(`/dashboard/projects/${projectId}`);
      } else {
        const errMsg =
          (data.success === false && data.error) ||
          "AI generation failed. Check OPENROUTER_API_KEY on the server and try again.";

        await updateProjectStatus(
          projectId,
          user.uid,
          "failed",
          errMsg,
        ).catch(() => undefined);

        await saveChatMessage(projectId, user.uid, {
          role: "assistant",
          content: `Generation failed: ${errMsg}`,
        }).catch(() => undefined);

        setError(errMsg);
      }
    } catch (err) {
      if (projectId) {
        await updateProjectStatus(
          projectId,
          user.uid,
          "failed",
          (err as Error).message,
        ).catch(() => undefined);
      }
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopBar
        title="New project"
        subtitle="Describe your idea and let AI build it"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="glass rounded-2xl p-6 sm:p-8 space-y-5"
          >
            <Input
              label="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My photography portfolio"
              required
            />

            <Select
              label="Website type"
              value={type}
              onChange={(e) => setType(e.target.value as WebsiteType)}
            >
              {websiteTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.description}
                </option>
              ))}
            </Select>

            <Textarea
              label="Describe your idea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A dark, minimal portfolio for a photographer based in Lisbon. Include a hero with a big headline, a 3-column gallery, an about section, and a contact form with email and Instagram links."
              rows={6}
              required
              hint="The more detail you provide, the better the result."
            />

            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1.5">
                AI model
              </label>
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                freeOnly
              />
              <p className="mt-1.5 text-xs text-zinc-500">
                Free models may have rate limits depending on OpenRouter usage policy.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-zinc-400 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span>
                  Plan:{" "}
                  <span className="font-semibold text-zinc-100">
                    {(sub?.plan ?? "free").toUpperCase()}
                  </span>
                </span>
                <Link
                  href="/dashboard/profile"
                  className="text-[11px] font-semibold uppercase tracking-wider text-violet-300 hover:text-violet-200"
                >
                  Manage plan →
                </Link>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>
                  Generations: {usedGens} / {genLimit}{" "}
                  <span
                    className={
                      atGenerationLimit ? "text-red-300" : "text-zinc-500"
                    }
                  >
                    ({remainingGens} left)
                  </span>
                </span>
                <span>
                  Projects: {projectCountSafe} / {projectLimit}{" "}
                  <span
                    className={
                      atProjectLimit ? "text-red-300" : "text-zinc-500"
                    }
                  >
                    ({remainingProjects} left)
                  </span>
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                leftIcon={<SparklesIcon className="h-4 w-4" />}
                disabled={
                  !isFirebaseConfigured || atProjectLimit || atGenerationLimit
                }
              >
                {loading
                  ? "Generating..."
                  : atProjectLimit
                    ? "Project limit reached"
                    : atGenerationLimit
                      ? "Generation limit reached"
                      : "Generate Website"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <BoltIcon className="h-3.5 w-3.5 text-white" />
              </span>
              <h3 className="text-sm font-semibold text-zinc-100">
                Tips for great results
              </h3>
            </div>
            <ul className="text-sm text-zinc-400 space-y-2.5">
              <li className="flex gap-2">
                <span className="text-violet-300">•</span>
                Mention color palette, mood, and visual style
              </li>
              <li className="flex gap-2">
                <span className="text-violet-300">•</span>
                List the sections you want (hero, gallery, pricing, etc.)
              </li>
              <li className="flex gap-2">
                <span className="text-violet-300">•</span>
                Specify the target audience and tone
              </li>
              <li className="flex gap-2">
                <span className="text-violet-300">•</span>
                Reference a brand or competitor you admire
              </li>
            </ul>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-2">
              What happens next?
            </h3>
            <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
              <li>A project is created in your dashboard</li>
              <li>Your prompt is saved as the first chat message</li>
              <li>AI generates HTML, CSS, and JS</li>
              <li>Files save to the project and the editor opens</li>
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
}
