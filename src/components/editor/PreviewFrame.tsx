"use client";

import { useMemo } from "react";
import type { DevicePreview, ProjectFile } from "@/types";

type PreviewFrameProps = {
  files: ProjectFile[];
  device?: DevicePreview;
};

const sizes: Record<DevicePreview, { width: string; height: string }> = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "1024px" },
  mobile: { width: "375px", height: "667px" },
};

function normalizePath(path: string): string {
  return String(path ?? "")
    .replace(/\\/g, "/")
    .replace(/^\.?\//, "")
    .replace(/^src\//, "")
    .replace(/^public\//, "")
    .replace(/^\//, "")
    .trim()
    .toLowerCase();
}

function findFileContent(files: ProjectFile[], path: string): string {
  const want = normalizePath(path);
  if (!want) return "";
  const match = files.find((f) => normalizePath(f.path) === want);
  return match?.content ?? "";
}

function escapeForScriptBlock(code: string): string {
  return code
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/<!--/g, "<\\!--");
}

function escapeForStyleBlock(code: string): string {
  return code.replace(/<\/style>/gi, "<\\/style>");
}

// Strip <link rel="stylesheet" href="styles.css"> (and variants) so the
// iframe doesn't try to fetch a file that only exists in the project's
// virtual file system.
function stripLocalStylesheetLinks(html: string): string {
  return html.replace(
    /<link\b[^>]*\brel\s*=\s*["']?stylesheet["']?[^>]*\bhref\s*=\s*["']?styles\.css["']?[^>]*>/gi,
    "",
  );
}

// Strip <script src="script.js"> (and variants) so the iframe doesn't try
// to fetch the project's virtual JS file.
function stripLocalScriptTags(html: string): string {
  return html.replace(
    /<script\b[^>]*\bsrc\s*=\s*["']?script\.js["']?[^>]*>\s*<\/script>/gi,
    "",
  );
}

// Strip <link rel="stylesheet" href="styles.css"> (handled above) and any
// other link/script references that point at this Next.js app's dev
// resources (e.g. /_next/static/...). Such URLs only worked when the
// iframe was same-origin with the parent; with the locked-down sandbox
// they would just 404 and pollute the dev server log.
function stripAppResourceRefs(html: string): string {
  let out = html;
  out = out.replace(
    /<link\b[^>]*\bhref\s*=\s*["']?\/?_next\/[^"'\s>]*["']?[^>]*>/gi,
    "",
  );
  out = out.replace(
    /<script\b[^>]*\bsrc\s*=\s*["']?\/?_next\/[^"'\s>]*["']?[^>]*>\s*<\/script>/gi,
    "",
  );
  out = out.replace(
    /<link\b[^>]*\bhref\s*=\s*["']?\/?api\/[^"'\s>]*["']?[^>]*>/gi,
    "",
  );
  return out;
}

// Also drop any <base> tag the AI may have added — relative URLs would
// otherwise resolve against the parent app's origin and could navigate the
// iframe to a builder route.
function stripBaseTags(html: string): string {
  return html.replace(/<base\b[^>]*>/gi, "");
}

function injectIntoHtml(html: string, css: string, js: string): string {
  if (!html.trim()) return "";

  let out = stripBaseTags(
    stripAppResourceRefs(
      stripLocalStylesheetLinks(stripLocalScriptTags(html)),
    ),
  );

  const cssBlock = `<style>\n${escapeForStyleBlock(css)}\n</style>`;
  const jsBlock = `<script>\n${escapeForScriptBlock(js)}\n</script>`;

  if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `${cssBlock}</head>`);
  } else if (/<head[\s>]/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1>${cssBlock}</head>`);
  } else {
    out = `<head>${cssBlock}</head>${out}`;
  }

  if (/<\/body>/i.test(out)) {
    out = out.replace(/<\/body>/i, `${jsBlock}</body>`);
  } else {
    out = `${out}${jsBlock}`;
  }

  return out;
}

function buildSrcDoc(files: ProjectFile[]): string {
  const html = findFileContent(files, "index.html");
  const css = findFileContent(files, "styles.css");
  const js = findFileContent(files, "script.js");

  if (html.trim()) {
    return injectIntoHtml(html, css, js);
  }
  if (css.trim() || js.trim()) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview</title><style>${escapeForStyleBlock(css)}</style></head><body>${escapeForScriptBlock(js)}</body></html>`;
  }
  return "";
}

export default function PreviewFrame({ files, device = "desktop" }: PreviewFrameProps) {
  const size = sizes[device];
  const srcDoc = useMemo(() => buildSrcDoc(files), [files]);

  if (process.env.NODE_ENV === "development") {
    console.log(
      "[PreviewFrame] files:",
      files.map((f) => f.path),
      "| has html/css/js:",
      [
        findFileContent(files, "index.html").length > 0,
        findFileContent(files, "styles.css").length > 0,
        findFileContent(files, "script.js").length > 0,
      ],
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_70%)]">
      <div
        className="relative bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/40 transition-all duration-300"
        style={{
          width: size.width,
          maxWidth: "100%",
          height: device === "desktop" ? "100%" : size.height,
          maxHeight: device === "desktop" ? "100%" : "90vh",
        }}
      >
        {srcDoc ? (
          <iframe
            key={srcDoc.length}
            title="Website Preview"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="w-full h-full bg-white border-0"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2 bg-zinc-900/40 p-6">
            <p className="text-zinc-300 text-sm font-medium">
              No website files generated yet.
            </p>
            <p className="text-zinc-500 text-xs max-w-xs">
              The generated <code className="font-mono">index.html</code>,{" "}
              <code className="font-mono">styles.css</code>, and{" "}
              <code className="font-mono">script.js</code> will appear here
              once the AI finishes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
