"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { SparklesIcon, BoltIcon } from "@/components/landing/Icons";
import type { WebsiteType } from "@/types";

const websiteTypes: { value: WebsiteType; label: string; description: string }[] = [
  { value: "portfolio", label: "Portfolio", description: "Personal or agency portfolio" },
  { value: "agency", label: "Agency", description: "Creative or marketing agency" },
  { value: "saas", label: "SaaS", description: "Software product landing" },
  { value: "real-estate", label: "Real Estate", description: "Listings and inquiries" },
  { value: "restaurant", label: "Restaurant", description: "Menus and reservations" },
  { value: "app", label: "App", description: "Mobile app launch page" },
  { value: "blog", label: "Blog", description: "Editorial and articles" },
  { value: "ecommerce", label: "E-commerce", description: "Storefront and products" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<WebsiteType>("portfolio");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }
    if (prompt.trim().length < 10) {
      setError("Please describe your idea in at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Generation failed. Please try again.");
        return;
      }

      const data = (await res.json()) as { id?: string };
      const id = data.id || "demo-project";
      router.push(`/dashboard/projects/${id}`);
    } catch (err) {
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
              >
                {loading ? "Generating..." : "Generate Website"}
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
              <li>AI generates HTML, CSS, and JS</li>
              <li>You see a live preview in the editor</li>
              <li>Refine with chat, then export as ZIP</li>
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
}
