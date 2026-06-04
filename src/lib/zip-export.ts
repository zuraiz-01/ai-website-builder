import JSZip from "jszip";
import type { ProjectFile } from "@/types";

const README = `# {title}

Generated with AI Website Builder.

## Files
- \`index.html\` — Page markup
- \`styles.css\` — Styles
- \`script.js\` — JavaScript

## How to run
Open \`index.html\` in any modern browser. No build step or server required.
`;

export function safeFilename(name: string): string {
  const cleaned = (name || "website")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return cleaned || "website";
}

export async function exportProjectAsZip(
  projectName: string,
  files: ProjectFile[],
): Promise<void> {
  const zip = new JSZip();

  let hasAny = false;
  for (const f of files) {
    if (f?.path && typeof f.content === "string" && f.content.length > 0) {
      zip.file(f.path, f.content);
      hasAny = true;
    }
  }

  if (!hasAny) {
    throw new Error("No files to export.");
  }

  const readme = README.replace("{title}", projectName || "Website");
  zip.file("README.md", readme);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFilename(projectName)}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
