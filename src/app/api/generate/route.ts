import { NextResponse } from "next/server";
import {
  callOpenRouter,
  extractFilesFromResponse,
  isOpenRouterConfigured,
} from "@/lib/openrouter";
import { DEMO_FILES } from "@/lib/demo-data";
import type {
  GenerateRequest,
  GenerateResponse,
  ProjectFiles,
  WebsiteType,
} from "@/types";

const TYPE_CONTEXT: Record<WebsiteType, string> = {
  portfolio: "a modern portfolio website with hero, gallery, about, and contact",
  agency: "a bold agency website with hero, services grid, case studies, and contact",
  saas: "a SaaS landing page with hero, features, pricing, and CTA",
  "real-estate": "a real estate website with hero, listings, search, and inquiry form",
  restaurant: "a restaurant website with hero, menu, gallery, and reservation form",
  app: "an app landing page with hero, features, screenshots, and download CTAs",
  blog: "a blog with featured post grid, sidebar, and article layout",
  ecommerce: "an e-commerce storefront with hero, product grid, and cart",
};

const SYSTEM_PROMPT = `You are an expert front-end developer. Generate a complete responsive website in pure HTML, CSS, and vanilla JavaScript (no frameworks, no build step). Use a modern dark theme by default with tasteful gradients. Keep the code production-ready and well-structured.

Return THREE fenced code blocks in this exact format:

\`\`\`file:index.html
...full HTML with linked stylesheet and script tags...
\`\`\`

\`\`\`file:styles.css
...all CSS...
\`\`\`

\`\`\`file:script.js
...all JavaScript...
\`\`\`

Do not include any prose outside the code blocks. Use semantic HTML. Make the layout fully responsive. Reference external files exactly as "styles.css" and "script.js" in the HTML.`;

export async function POST(req: Request) {
  let body: GenerateRequest & { mode?: string };
  try {
    body = (await req.json()) as GenerateRequest & { mode?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { prompt, type } = body;
  if (!prompt || !type) {
    return NextResponse.json(
      { error: "Missing required fields: 'prompt' and 'type'." },
      { status: 400 },
    );
  }

  if (!isOpenRouterConfigured()) {
    return NextResponse.json<GenerateResponse>(
      {
        files: DEMO_FILES,
        message:
          "OpenRouter isn't configured on the server, so this is demo content. Add OPENROUTER_API_KEY to your .env.local to enable real generation.",
      },
      { status: 200 },
    );
  }

  try {
    const userPrompt = `Website type: ${type} (${TYPE_CONTEXT[type] ?? type})\n\nUser idea: ${prompt}\n\nGenerate the website.`;

    const text = await callOpenRouter([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ]);

    const parsed = extractFilesFromResponse(text);

    if (!parsed["index.html"] || !parsed["styles.css"]) {
      return NextResponse.json(
        {
          error:
            "The model returned an unexpected response. Please try again with a clearer prompt.",
        },
        { status: 502 },
      );
    }

    const files: ProjectFiles = {
      "index.html": parsed["index.html"]!,
      "styles.css": parsed["styles.css"]!,
      "script.js": parsed["script.js"] ?? "",
    };

    return NextResponse.json<GenerateResponse>({
      files,
      message: "I've generated your website. Take a look at the preview.",
    });
  } catch (err) {
    const message = (err as Error).message || "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
