import { NextResponse } from "next/server";
import {
  callOpenRouter,
  FALLBACK_OPENROUTER_MODEL_ID,
  parseWebsiteResponse,
  validateFiles,
  type OpenRouterMessage,
} from "@/lib/openrouter";
import type { EditApiResponse, ProjectFile } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_CHARS = 60_000;

const SYSTEM_PROMPT = `You are an expert front-end developer who edits existing static websites.

You will receive:
1. The current website files (index.html, styles.css, script.js).
2. A short instruction from the user describing what to change.

Return ONLY a single valid JSON object and NOTHING ELSE. No markdown. No code fences. No prose. The JSON must match:

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
- Return the COMPLETE updated content of EVERY file, even files that didn't change. Do not return diffs or partial files.
- Use ONLY plain HTML, CSS, and vanilla JavaScript. No frameworks. No build step.
- Reference the stylesheet as "styles.css" and the script as "script.js" in the HTML (relative paths).
- Preserve the existing look-and-feel unless the user explicitly asks to change it.
- Keep the site fully responsive.
- Escape all double quotes inside string values correctly so the JSON parses.
- Return ONLY the JSON object. Nothing else.`;

export interface EditRequestBody {
  projectId?: string;
  files?: { path?: string; content?: string }[];
  message?: string;
  model?: string;
}

function summarizeFiles(files: ProjectFile[]): string {
  return files
    .map((f) => {
      const content =
        f.content.length > MAX_FILE_CHARS
          ? `${f.content.slice(0, MAX_FILE_CHARS)}\n... (truncated)`
          : f.content;
      return `--- ${f.path} ---\n${content}\n`;
    })
    .join("\n");
}

export async function POST(req: Request) {
  let body: EditRequestBody;
  try {
    body = (await req.json()) as EditRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." } satisfies EditApiResponse,
      { status: 400 },
    );
  }

  const { projectId, files, message, model: rawModel } = body;

  const model =
    typeof rawModel === "string" && rawModel.trim().length > 0
      ? rawModel.trim()
      : FALLBACK_OPENROUTER_MODEL_ID;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required field: 'projectId'.",
      } satisfies EditApiResponse,
      { status: 400 },
    );
  }
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing or empty 'files' array.",
      } satisfies EditApiResponse,
      { status: 400 },
    );
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required field: 'message'.",
      } satisfies EditApiResponse,
      { status: 400 },
    );
  }

  const safeFiles: ProjectFile[] = files
    .filter(
      (f): f is { path: string; content: string } =>
        !!f && typeof f.path === "string" && typeof f.content === "string",
    )
    .map((f) => ({ path: f.path, content: f.content }));

  const messages: OpenRouterMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Current website files:\n\n${summarizeFiles(safeFiles)}\n\nUser instruction: ${message.trim()}\n\nReturn ONLY the updated JSON object.`,
    },
  ];

  try {
    const text = await callOpenRouter(messages, {
      temperature: 0.5,
      model,
    });
    const parsed = parseWebsiteResponse(text);
    const updated: ProjectFile[] = validateFiles(parsed.files);

    if (
      !updated.some(
        (f) => f.path === "index.html" && f.content.trim().length > 50,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI did not return a valid 'index.html'. Please try again with a clearer instruction.",
        } satisfies EditApiResponse,
        { status: 502 },
      );
    }

    const reply =
      parsed.description && parsed.description.trim().length > 0
        ? parsed.description.trim()
        : "I've updated the website based on your feedback.";

    return NextResponse.json({
      success: true,
      projectName: parsed.projectName || "",
      description: parsed.description || "",
      files: updated,
      reply,
    } satisfies EditApiResponse);
  } catch (err) {
    const message = (err as Error).message || "Edit failed.";
    const status =
      typeof (err as { status?: number }).status === "number"
        ? (err as { status: number }).status
        : 500;
    console.error("[/api/edit] error:", message);

    const friendly =
      status === 503
        ? "AI editing isn't configured. Add OPENROUTER_API_KEY on the server."
        : status === 429
          ? "The AI provider is rate-limiting our key. Please try again in a moment."
          : status >= 500
            ? "The AI service returned an error. Please try again."
            : message;

    return NextResponse.json(
      { success: false, error: friendly } satisfies EditApiResponse,
      { status: status >= 400 && status < 600 ? status : 500 },
    );
  }
}
