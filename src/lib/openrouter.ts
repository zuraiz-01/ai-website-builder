const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_MODEL = "deepseek/deepseek-chat-v3-0324:free";

export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: { role: "assistant"; content: string };
  }[];
}

export function getOpenRouterKey(): string | null {
  const key = process.env.OPENROUTER_API_KEY;
  return key && key.length > 0 ? key : null;
}

export function isOpenRouterConfigured(): boolean {
  return getOpenRouterKey() !== null;
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: { model?: string; temperature?: number } = {},
): Promise<string> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured on the server.");
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "AI Website Builder",
    },
    body: JSON.stringify({
      model: options.model ?? OPENROUTER_MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter request failed (${res.status}): ${errText.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }
  return content;
}

const FILE_BLOCK_RE = /```(?:file:)?([a-zA-Z0-9_.-]+)\s*\n([\s\S]*?)```/g;

export function extractFilesFromResponse(text: string): {
  "index.html"?: string;
  "styles.css"?: string;
  "script.js"?: string;
} {
  const out: Record<string, string> = {};
  let match: RegExpExecArray | null;
  FILE_BLOCK_RE.lastIndex = 0;
  while ((match = FILE_BLOCK_RE.exec(text)) !== null) {
    const name = match[1].trim().toLowerCase();
    const body = match[2].replace(/\n$/, "");
    if (name === "index.html" || name === "html") out["index.html"] = body;
    else if (name === "styles.css" || name === "css") out["styles.css"] = body;
    else if (name === "script.js" || name === "js" || name === "javascript")
      out["script.js"] = body;
  }
  return out;
}
