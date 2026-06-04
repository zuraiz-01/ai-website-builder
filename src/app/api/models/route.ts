import { NextResponse } from "next/server";
import type {
  OpenRouterModel,
  OpenRouterModelsResponse,
} from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

interface RawOpenRouterModel {
  id?: string;
  name?: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string | number;
    completion?: string | number;
  };
}

function isFreeModel(m: RawOpenRouterModel): boolean {
  if (m.id && m.id.includes(":free")) return true;
  const prompt = m.pricing?.prompt;
  const completion = m.pricing?.completion;
  const promptZero = String(prompt ?? "") === "0";
  const completionZero = String(completion ?? "") === "0";
  return promptZero && completionZero;
}

function toClientModel(m: RawOpenRouterModel): OpenRouterModel | null {
  if (!m.id) return null;
  return {
    id: m.id,
    name: m.name || m.id,
    description: m.description,
    contextLength:
      typeof m.context_length === "number" ? m.context_length : undefined,
    isFree: isFreeModel(m),
    promptPrice:
      m.pricing?.prompt !== undefined ? String(m.pricing.prompt) : undefined,
    completionPrice:
      m.pricing?.completion !== undefined
        ? String(m.pricing.completion)
        : undefined,
  };
}

// Fallback list (used ONLY if the OpenRouter models API fails).
// Marked clearly so users know these may be outdated.
const FALLBACK_FREE_MODELS: OpenRouterModel[] = [
  {
    id: "openrouter/free",
    name: "OpenRouter Free Router (auto-picks free models)",
    description:
      "Fallback: lets OpenRouter pick a currently available free model.",
    isFree: true,
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat v3 (free)",
    description: "Fallback: previous default; may be removed from OpenRouter.",
    isFree: true,
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Google Gemini 2.0 Flash (experimental, free)",
    description: "Fallback: fast Google model.",
    isFree: true,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Meta Llama 3.3 70B Instruct (free)",
    description: "Fallback: large open model.",
    isFree: true,
  },
  {
    id: "qwen/qwen-2.5-coder-32b-instruct:free",
    name: "Qwen 2.5 Coder 32B Instruct (free)",
    description: "Fallback: code-specialized model.",
    isFree: true,
  },
];

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const headers: Record<string, string> = {};
  if (apiKey && apiKey.length > 0) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  const referer =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  headers["HTTP-Referer"] = referer;
  headers["X-Title"] = "AI Website Builder";

  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      method: "GET",
      headers,
      // OpenRouter models list rarely changes; short cache is safe
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(
        "[/api/models] OpenRouter responded with",
        res.status,
        await res.text().catch(() => ""),
      );
      return NextResponse.json(
        {
          success: true,
          models: FALLBACK_FREE_MODELS,
        } satisfies OpenRouterModelsResponse,
        { status: 200 },
      );
    }

    const data = (await res.json()) as { data?: RawOpenRouterModel[] };
    if (!data || !Array.isArray(data.data)) {
      return NextResponse.json(
        {
          success: true,
          models: FALLBACK_FREE_MODELS,
        } satisfies OpenRouterModelsResponse,
        { status: 200 },
      );
    }

    const mapped = data.data
      .map(toClientModel)
      .filter((m): m is OpenRouterModel => m !== null);

    // Free models first; keep stable order within each group
    mapped.sort((a, b) => {
      if (a.isFree === b.isFree) return a.id.localeCompare(b.id);
      return a.isFree ? -1 : 1;
    });

    if (mapped.length === 0) {
      return NextResponse.json(
        {
          success: true,
          models: FALLBACK_FREE_MODELS,
        } satisfies OpenRouterModelsResponse,
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        models: mapped,
      } satisfies OpenRouterModelsResponse,
      { status: 200 },
    );
  } catch (err) {
    console.error("[/api/models] error:", err);
    return NextResponse.json(
      {
        success: true,
        models: FALLBACK_FREE_MODELS,
      } satisfies OpenRouterModelsResponse,
      { status: 200 },
    );
  }
}
