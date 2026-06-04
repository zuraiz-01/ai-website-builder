import type { ProjectFile } from "@/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const DEFAULT_OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || "openrouter/free";

export const OPENROUTER_MODEL = DEFAULT_OPENROUTER_MODEL;

export const FALLBACK_OPENROUTER_MODEL_ID = "openrouter/free";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponse {
  id?: string;
  choices?: {
    message?: { role?: string; content?: string };
  }[];
  error?: { message?: string; code?: number | string };
}

export function getOpenRouterKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY;
  return key && key.length > 0 ? key : null;
}

export function isOpenRouterConfigured(): boolean {
  return getOpenRouterKey() !== null;
}

export class OpenRouterError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
  }
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: { model?: string; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new OpenRouterError(
      "OpenRouter API key is not configured. Set OPENROUTER_API_KEY on the server.",
      503,
    );
  }

  const referer =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const selectedModel =
    options.model && options.model.trim().length > 0
      ? options.model.trim()
      : OPENROUTER_MODEL;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": referer,
      "X-Title": "AI Website Builder",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: options.temperature ?? 0.7,
      ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new OpenRouterError(
      `OpenRouter request failed (${res.status}): ${errText.slice(0, 300)}`,
      res.status,
    );
  }

  const data = (await res.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenRouterError(
      "OpenRouter returned an empty response.",
      502,
    );
  }
  return content;
}

export function cleanJsonResponse(text: string): string {
  if (!text) return "";

  let cleaned = text.trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

function sanitizeJsonString(input: string): string {
  let inString = false;
  let escape = false;
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (escape) {
      escape = false;
      out += ch;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      out += ch;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }
    if (inString) {
      if (ch === "'") {
        out += "'";
        continue;
      }
      if (ch === "\n") {
        out += "\\n";
        continue;
      }
      if (ch === "\r") {
        out += "\\r";
        continue;
      }
      if (ch === "\t") {
        out += "\\t";
        continue;
      }
    }
    out += ch;
  }
  return out;
}

export interface AIWebsiteResponse {
  projectName: string;
  description: string;
  files: ProjectFile[];
}

export const REQUIRED_FILE_PATHS = [
  "index.html",
  "styles.css",
  "script.js",
] as const;
export type RequiredFilePath = (typeof REQUIRED_FILE_PATHS)[number];

const FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Website</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main>
    <h1>Your website is being prepared</h1>
    <p>The AI did not return valid code. Please try again with a clearer prompt.</p>
  </main>
  <script src="script.js"></script>
</body>
</html>`;

const FALLBACK_CSS = `body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 2rem; background: #0b0b0f; color: #e4e4e7; }
main { max-width: 640px; margin: 0 auto; text-align: center; }
h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
p { color: #a1a1aa; }`;

const FALLBACK_JS = "";

export function normalizePath(raw: string): string {
  if (!raw) return "";
  return String(raw)
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^src\//, "")
    .replace(/^public\//, "")
    .replace(/^\//, "")
    .toLowerCase()
    .trim();
}

export function normalizeFiles(
  rawFiles: unknown,
): { path: RequiredFilePath; content: string }[] {
  const out: Record<string, string> = {};
  if (Array.isArray(rawFiles)) {
    for (const f of rawFiles) {
      if (!f || typeof f !== "object") continue;
      const path = normalizePath(String((f as { path?: unknown }).path ?? ""));
      if (!path) continue;
      if (
        (REQUIRED_FILE_PATHS as readonly string[]).includes(path) === false
      ) {
        continue;
      }
      const content =
        typeof (f as { content?: unknown }).content === "string"
          ? ((f as { content: string }).content)
          : "";
      out[path] = content;
    }
  }

  return REQUIRED_FILE_PATHS.map((path) => {
    if (path === "index.html") {
      return { path, content: out[path] ?? FALLBACK_HTML };
    }
    if (path === "styles.css") {
      return { path, content: out[path] ?? FALLBACK_CSS };
    }
    return { path, content: out[path] ?? FALLBACK_JS };
  });
}

export function validateFiles(
  files: ProjectFile[],
): { path: RequiredFilePath; content: string }[] {
  return normalizeFiles(files);
}

export function parseWebsiteResponse(responseText: string): AIWebsiteResponse {
  const cleaned = cleanJsonResponse(responseText);
  const sanitized = sanitizeJsonString(cleaned);

  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitized);
  } catch (err) {
    console.error(
      "[openrouter] JSON parse failed. Cleaned text:",
      cleaned.slice(0, 500),
    );
    console.error("[openrouter] Sanitized text:", sanitized.slice(0, 500));
    console.error("[openrouter] Parse error:", err);
    return {
      projectName: "Untitled",
      description: "",
      files: normalizeFiles([]),
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      projectName: "Untitled",
      description: "",
      files: normalizeFiles([]),
    };
  }

  const obj = parsed as Record<string, unknown>;
  return {
    projectName:
      typeof obj.projectName === "string" ? obj.projectName : "Untitled",
    description: typeof obj.description === "string" ? obj.description : "",
    files: normalizeFiles(obj.files),
  };
}

export const parseAIWebsiteResponse = parseWebsiteResponse;
