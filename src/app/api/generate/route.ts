import { NextResponse } from "next/server";
import {
  callOpenRouter,
  FALLBACK_OPENROUTER_MODEL_ID,
  parseWebsiteResponse,
  validateFiles,
  type OpenRouterMessage,
} from "@/lib/openrouter";
import type {
  GenerateApiResponse,
  ProjectFile,
  WebsiteType,
} from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES: ReadonlySet<WebsiteType> = new Set<WebsiteType>([
  "portfolio",
  "agency",
  "saas",
  "real-estate",
  "restaurant",
  "app",
  "blog",
  "ecommerce",
]);

const TYPE_CONTEXT: Record<WebsiteType, string> = {
  portfolio:
    "a modern portfolio website with hero, gallery, about, and contact",
  agency:
    "a bold agency website with hero, services grid, case studies, testimonials, and contact",
  saas: "a SaaS landing page with hero, features, pricing, FAQ, and CTA",
  "real-estate":
    "a real estate website with hero, listings, search, and inquiry form",
  restaurant:
    "a restaurant website with hero, menu, gallery, and reservation form",
  app: "an app landing page with hero, features, screenshots, and download CTAs",
  blog: "a blog with featured post grid, sidebar, and article layout",
  ecommerce:
    "an e-commerce storefront with hero, product grid, categories, and cart",
};

const SYSTEM_PROMPT = `You are an expert website generator.

Return ONLY valid JSON. No markdown. No code fences. No prose.

The JSON must match this exact structure:
{
  "projectName": "string",
  "description": "string",
  "files": [
    { "path": "index.html", "content": "string" },
    { "path": "styles.css", "content": "string" },
    { "path": "script.js", "content": "string" }
  ]
}

Rules:
- "index.html" must include full HTML5 markup with <!DOCTYPE html>, <html>, <head>, and <body>. It should link to "styles.css" with <link rel="stylesheet" href="styles.css"> and load "script.js" with <script src="script.js"></script> placed just before </body>.
- "styles.css" must include complete styling. Do not wrap CSS in <style> tags.
- "script.js" must include JavaScript only if needed, otherwise an empty string. Do not wrap JS in <script> tags.
- Use semantic HTML5, modern CSS (flexbox, grid, custom properties), and tasteful animations/hover states.
- Make the design modern, fully responsive (mobile, tablet, desktop), and production-quality.
- Use a real color palette and typography. Use real content, not lorem ipsum.
- Include navbar, hero, features/services, CTA, and contact/footer sections as appropriate to the type.
- Escape all double quotes inside string values correctly so the JSON parses.
- Return ONLY the JSON object. Nothing else.`;

export interface GenerateRequestBody {
  projectId?: string;
  title?: string;
  type?: string;
  prompt?: string;
  model?: string;
}

export async function POST(req: Request) {
  let body: GenerateRequestBody;
  try {
    body = (await req.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body.",
      } satisfies GenerateApiResponse,
      { status: 400 },
    );
  }

  const { projectId, title, type, prompt, model: rawModel } = body;

  const model =
    typeof rawModel === "string" && rawModel.trim().length > 0
      ? rawModel.trim()
      : FALLBACK_OPENROUTER_MODEL_ID;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required field: 'projectId'.",
      } satisfies GenerateApiResponse,
      { status: 400 },
    );
  }
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required field: 'title'.",
      } satisfies GenerateApiResponse,
      { status: 400 },
    );
  }
  if (
    !type ||
    typeof type !== "string" ||
    !VALID_TYPES.has(type as WebsiteType)
  ) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid 'type'. Must be one of: ${Array.from(VALID_TYPES).join(", ")}.`,
      } satisfies GenerateApiResponse,
      { status: 400 },
    );
  }
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing or too short 'prompt'. Describe your idea in at least 5 characters.",
      } satisfies GenerateApiResponse,
      { status: 400 },
    );
  }

  const messages: OpenRouterMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Project title: ${title.trim()}\nWebsite type: ${type} (${TYPE_CONTEXT[type as WebsiteType] ?? type})\n\nUser idea:\n${prompt.trim()}\n\nBuild the complete website now. Return ONLY the JSON object described in the system prompt.`,
    },
  ];

  try {
    const text = await callOpenRouter(messages, {
      temperature: 0.7,
      model,
    });
    const parsed = parseWebsiteResponse(text);
    const files: ProjectFile[] = validateFiles(parsed.files);

    if (
      !files.some(
        (f) => f.path === "index.html" && f.content.trim().length > 50,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI did not return a valid 'index.html'. Please try again with a clearer prompt.",
        } satisfies GenerateApiResponse,
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      projectName: parsed.projectName || title.trim(),
      description: parsed.description || "",
      files,
    } satisfies GenerateApiResponse);
  } catch (err) {
    const message = (err as Error).message || "Generation failed.";
    const status =
      typeof (err as { status?: number }).status === "number"
        ? (err as { status: number }).status
        : 500;
    console.error("[/api/generate] error:", message);

    const friendly =
      status === 503
        ? "AI generation isn't configured. Add OPENROUTER_API_KEY on the server."
        : status === 429
          ? "The AI provider is rate-limiting our key. Please try again in a moment."
          : status >= 500
            ? "The AI service returned an error. Please try again."
            : message;

    return NextResponse.json(
      { success: false, error: friendly } satisfies GenerateApiResponse,
      { status: status >= 400 && status < 600 ? status : 500 },
    );
  }
}
