"use client";

import { useEffect, useRef } from "react";
import type { ProjectFiles, DevicePreview } from "@/types";

interface PreviewFrameProps {
  files: ProjectFiles;
  device: DevicePreview;
}

const sizes: Record<DevicePreview, { width: string; height: string }> = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "1024px" },
  mobile: { width: "375px", height: "667px" },
};

function buildSrcDoc(files: ProjectFiles): string {
  const html = files["index.html"] || "";
  const css = files["styles.css"] || "";
  const js = files["script.js"] || "";

  if (/<link[^>]+href=["']styles\.css["']/i.test(html)) {
    return html.replace(
      /<link[^>]+href=["']styles\.css["'][^>]*>/i,
      `<style>${css}</style>`,
    );
  }
  if (/<script[^>]+src=["']script\.js["']/i.test(html)) {
    return html
      .replace(/<style>[\s\S]*?<\/style>/i, `<style>${css}</style>`)
      .replace(
        /<script[^>]+src=["']script\.js["'][^>]*><\/script>/i,
        `<script>${js}<\/script>`,
      );
  }
  return html
    .replace(/<head>/i, `<head><style>${css}</style>`)
    .replace(/<body[^>]*>/i, (m) => `${m}<script>${js}<\/script>`);
}

export default function PreviewFrame({ files, device }: PreviewFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const size = sizes[device];

  useEffect(() => {
    if (ref.current) {
      ref.current.srcdoc = buildSrcDoc(files);
    }
  }, [files]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_70%)]">
      <div
        className="relative bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/40 transition-all duration-300"
        style={{
          width: size.width,
          maxWidth: "100%",
          height:
            device === "desktop"
              ? "100%"
              : size.height,
          maxHeight: device === "desktop" ? "100%" : "90vh",
          aspectRatio: device === "desktop" ? "auto" : undefined,
        }}
      >
        <iframe
          ref={ref}
          title="Preview"
          className="w-full h-full bg-white"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}
