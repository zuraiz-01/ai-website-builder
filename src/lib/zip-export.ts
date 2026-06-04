import JSZip from "jszip";
import type { ProjectFiles } from "@/types";

export async function exportProjectAsZip(
  projectName: string,
  files: ProjectFiles,
): Promise<void> {
  const zip = new JSZip();
  zip.file("index.html", files["index.html"]);
  zip.file("styles.css", files["styles.css"]);
  zip.file("script.js", files["script.js"]);

  const safeName =
    projectName.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "website";
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
