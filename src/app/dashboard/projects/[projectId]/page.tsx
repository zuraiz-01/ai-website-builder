"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/layout/Navbar";
import PreviewFrame from "@/components/editor/PreviewFrame";
import ChatPanel from "@/components/editor/ChatPanel";
import FileTabs, { DeviceToggle } from "@/components/editor/FileTabs";
import Button from "@/components/ui/Button";
import {
  DownloadIcon,
  SparklesIcon,
  CodeIcon,
  EyeIcon,
} from "@/components/landing/Icons";
import { exportProjectAsZip } from "@/lib/zip-export";
import { DEMO_CHAT, DEMO_FILES, DEMO_PROJECTS } from "@/lib/demo-data";
import type {
  ChatMessage,
  DevicePreview,
  Project,
  ProjectFiles,
} from "@/types";

function findProject(id: string): Project | undefined {
  return DEMO_PROJECTS.find((p) => p.id === id);
}

export default function EditorPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params?.projectId ?? "";

  const project = useMemo(() => findProject(projectId), [projectId]);
  const initialFiles: ProjectFiles = project?.files ?? DEMO_FILES;

  const [files, setFiles] = useState<ProjectFiles>(initialFiles);
  const [activeTab, setActiveTab] =
    useState<keyof ProjectFiles>("index.html");
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [view, setView] = useState<"preview" | "code">("preview");
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_CHAT);
  const [chatLoading, setChatLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!project) {
      const t = setTimeout(() => router.push("/dashboard"), 1500);
      return () => clearTimeout(t);
    }
  }, [project, router]);

  if (!project) {
    return (
      <>
        <TopBar title="Project not found" />
        <div className="glass rounded-2xl p-10 text-center">
          <h2 className="text-lg font-semibold">Project not found</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Redirecting you to the dashboard...
          </p>
        </div>
      </>
    );
  }

  const saveIcon = <SparklesIcon className="h-3.5 w-3.5" />;
  const exportIcon = <DownloadIcon className="h-3.5 w-3.5" />;
  const previewIcon = <EyeIcon className="h-3.5 w-3.5" />;
  const codeIcon = <CodeIcon className="h-3.5 w-3.5" />;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    try {
      await exportProjectAsZip(project.name, files);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          type: project.type,
          name: project.name,
          mode: "edit",
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { files?: ProjectFiles; message?: string };
        if (data.files) setFiles(data.files);
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              data.message ??
              "I've updated the design based on your feedback. Take a look at the preview.",
            createdAt: Date.now(),
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content:
              "I'm running in demo mode, so I can't actually rewrite the code yet. Once OpenRouter is configured on the server, I'll make the changes here in real time.",
            createdAt: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Network error. Please try again in a moment.",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      <TopBar
        title={project.name}
        subtitle={`${project.type} · Updated ${new Date(project.updatedAt).toLocaleDateString()}`}
        rightSlot={
          <>
            <DeviceToggle device={device} onChange={setDevice} />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              leftIcon={saveIcon}
            >
              {saved ? "Saved ✓" : "Save"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExport}
              leftIcon={exportIcon}
            >
              Export ZIP
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-7rem)]">
        <div className="glass rounded-2xl overflow-hidden min-h-[400px] lg:min-h-0">
          <ChatPanel
            messages={messages}
            onSend={handleSend}
            loading={chatLoading}
          />
        </div>

        <div className="glass rounded-2xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">
          <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setView("preview")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                  view === "preview"
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {previewIcon}
                Preview
              </button>
              <button
                type="button"
                onClick={() => setView("code")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
                  view === "code"
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {codeIcon}
                Code
              </button>
            </div>
            <DeviceToggle device={device} onChange={setDevice} />
          </div>

          {view === "preview" ? (
            <div className="flex-1 min-h-0">
              <PreviewFrame files={files} device={device} />
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <FileTabs active={activeTab} onChange={setActiveTab} />
              <div className="flex-1 min-h-0 overflow-auto bg-black/30">
                <pre className="p-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                  {files[activeTab]}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
