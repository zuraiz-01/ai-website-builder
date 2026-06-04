"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/layout/Navbar";
import PreviewFrame from "@/components/editor/PreviewFrame";
import ChatPanel from "@/components/editor/ChatPanel";
import FileTabs, { DeviceToggle } from "@/components/editor/FileTabs";
import ModelSelector from "@/components/editor/ModelSelector";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import {
  DownloadIcon,
  SparklesIcon,
  CodeIcon,
  EyeIcon,
} from "@/components/landing/Icons";
import { exportProjectAsZip } from "@/lib/zip-export";
import {
  getProjectById,
  getProjectMessages,
  saveChatMessage,
  updateProject,
  updateProjectFiles,
  updateProjectStatus,
} from "@/lib/firestore-service";
import { useAuth } from "@/context/AuthContext";
import type {
  ChatMessage,
  DevicePreview,
  FirestoreProject,
  ProjectFile,
} from "@/types";

const EDITABLE_FILE_PATHS = ["index.html", "styles.css", "script.js"] as const;

function findFile(files: ProjectFile[], path: string): string {
  return files.find((f) => f.path === path)?.content ?? "";
}

function mergeFiles(
  existing: ProjectFile[],
  incoming: ProjectFile[],
): ProjectFile[] {
  const map = new Map<string, string>();
  for (const p of EDITABLE_FILE_PATHS) map.set(p, "");
  for (const f of existing) {
    if ((EDITABLE_FILE_PATHS as readonly string[]).includes(f.path)) {
      map.set(f.path, f.content);
    }
  }
  for (const f of incoming) {
    if ((EDITABLE_FILE_PATHS as readonly string[]).includes(f.path)) {
      map.set(f.path, f.content);
    }
  }
  return Array.from(map.entries()).map(([path, content]) => ({
    path,
    content,
  }));
}

export default function EditorPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params?.projectId ?? "";

  const [project, setProject] = useState<FirestoreProject | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [view, setView] = useState<"preview" | "code">("preview");
  const [activeTab, setActiveTab] = useState<string>("index.html");
  const [selectedModel, setSelectedModel] = useState<string>("openrouter/free");
  const [modelSaving, setModelSaving] = useState(false);

  const loadAll = useCallback(async () => {
    if (!user || !projectId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const proj = await getProjectById(projectId, user.uid);
      if (!proj) {
        setProject(null);
        setFiles([]);
        setMessages([]);
        setLoadError("Project not found or you don't have access.");
        return;
      }
      setProject(proj);
      setFiles(proj.files ?? []);
      setSelectedModel(proj.selectedModel ?? "openrouter/free");
      const list = await getProjectMessages(projectId, user.uid).catch(
        () => [],
      );
      setMessages(list);
    } catch (e) {
      console.error(e);
      setLoadError((e as Error).message || "Failed to load project.");
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (user && projectId) loadAll();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [user, projectId, loadAll]);

  const saveIcon = <SparklesIcon className="h-3.5 w-3.5" />;
  const exportIcon = <DownloadIcon className="h-3.5 w-3.5" />;
  const previewIcon = <EyeIcon className="h-3.5 w-3.5" />;
  const codeIcon = <CodeIcon className="h-3.5 w-3.5" />;

  const handleSave = async () => {
    if (!user || !project) return;
    setSaving(true);
    try {
      await updateProjectFiles(project.id, user.uid, files);
      setSavedAt(Date.now());
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setSelectedModel(newModel);
    if (!user || !project) return;
    if (project.selectedModel === newModel) return;
    setModelSaving(true);
    try {
      await updateProject(project.id, user.uid, {
        selectedModel: newModel,
      });
      setProject({ ...project, selectedModel: newModel });
    } catch (e) {
      console.error("Failed to save selectedModel", e);
    } finally {
      setModelSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportProjectAsZip(project?.title || "website", files);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (text: string) => {
    if (!user || !project) return;

    const localId = `local-${Date.now()}`;
    const localUserMsg: ChatMessage = {
      id: localId,
      projectId: project.id,
      userId: user.uid,
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, localUserMsg]);
    setChatLoading(true);

    const replaceUserMsg = (saved: ChatMessage | null) => {
      setMessages((m) => {
        const next = m.filter((x) => x.id !== localId);
        next.push(
          saved ?? {
            ...localUserMsg,
            id: `local-persisted-${Date.now()}`,
          },
        );
        return next;
      });
    };

    const appendAssistant = (saved: ChatMessage | null, content: string) => {
      const fallback: ChatMessage = {
        id: `local-a-${Date.now()}`,
        projectId: project.id,
        userId: user.uid,
        role: "assistant",
        content,
        createdAt: Date.now(),
      };
      setMessages((m) => [...m, saved ?? fallback]);
    };

    try {
      const savedUserMsg = await saveChatMessage(project.id, user.uid, {
        role: "user",
        content: text,
      }).catch(() => null);
      replaceUserMsg(savedUserMsg);

      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          files,
          message: text,
          model: selectedModel,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        projectName?: string;
        description?: string;
        files?: { path: string; content: string }[];
        reply?: string;
        error?: string;
      };

      if (
        res.ok &&
        data.success === true &&
        Array.isArray(data.files) &&
        data.files.length > 0
      ) {
        const nextFiles = mergeFiles(files, data.files);
        setFiles(nextFiles);
        await updateProjectFiles(project.id, user.uid, nextFiles).catch(
          (err) => {
            console.error("Failed to persist edited files", err);
          },
        );

        const replyText =
          data.reply?.trim() || "I've updated your site based on your feedback.";

        const savedAssistant = await saveChatMessage(project.id, user.uid, {
          role: "assistant",
          content: replyText,
        }).catch(() => null);

        appendAssistant(savedAssistant, replyText);
      } else {
        const replyText =
          (data.success === false && data.error) ||
          "AI editing isn't available right now. Add OPENROUTER_API_KEY on the server to enable edits.";

        await updateProjectStatus(
          project.id,
          user.uid,
          "failed",
          replyText,
        ).catch(() => undefined);

        const savedAssistant = await saveChatMessage(project.id, user.uid, {
          role: "assistant",
          content: replyText,
        }).catch(() => null);

        appendAssistant(savedAssistant, replyText);
      }
    } catch (e) {
      const replyText = `Network error: ${(e as Error).message}`;
      const savedAssistant = await saveChatMessage(project.id, user.uid, {
        role: "assistant",
        content: replyText,
      }).catch(() => null);
      appendAssistant(savedAssistant, replyText);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Loading project..." />
        <Loader fullScreen size="lg" label="Fetching your project..." />
      </>
    );
  }

  if (loadError || !project) {
    return (
      <>
        <TopBar title="Project not found" />
        <EmptyState
          icon={<CodeIcon className="h-6 w-6" />}
          title="Project not found"
          description={
            loadError ?? "This project may not exist or you don't have access."
          }
          action={{
            label: "Back to dashboard",
            onClick: () => router.push("/dashboard"),
          }}
        />
      </>
    );
  }

  const updatedLabel = project.updatedAt
    ? new Date(project.updatedAt).toLocaleString()
    : "—";

  const hasRealFiles = files.some(
    (f) => (f.path === "index.html" && f.content.trim().length > 0) ||
           (f.path === "styles.css" && f.content.trim().length > 0) ||
           (f.path === "script.js" && f.content.trim().length > 0),
  );

  return (
    <>
      <TopBar
        title={project.title}
        subtitle={`${project.type} · Updated ${updatedLabel}`}
        rightSlot={
          <>
            <DeviceToggle device={device} onChange={setDevice} />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              loading={saving}
              leftIcon={saveIcon}
              disabled={files.length === 0}
            >
              {saving ? "Saving..." : savedAt ? "Saved ✓" : "Save"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExport}
              leftIcon={exportIcon}
              disabled={files.length === 0}
            >
              Export ZIP
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-7rem)]">
        <div className="glass rounded-2xl overflow-hidden min-h-[400px] lg:min-h-0 flex flex-col">
          <div className="px-3 pt-3 pb-2 border-b border-white/5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                Model
              </span>
              {modelSaving && (
                <span className="text-[10px] text-zinc-500">saving...</span>
              )}
            </div>
            <ModelSelector
              value={selectedModel}
              onChange={handleModelChange}
              freeOnly
              compact
            />
            <p className="text-[10px] text-zinc-500">
              Using model: <span className="font-mono">{selectedModel}</span>
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <ChatPanel
              messages={messages}
              onSend={handleSend}
              loading={chatLoading}
            />
          </div>
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

          {!hasRealFiles ? (
            <div className="flex-1 min-h-0 flex items-center justify-center p-6">
              <EmptyState
                icon={<CodeIcon className="h-6 w-6" />}
                title="No website generated yet"
                description="Go back and generate your website."
                action={{
                  label: "Back to dashboard",
                  onClick: () => router.push("/dashboard"),
                }}
              />
            </div>
          ) : view === "preview" ? (
            <div className="flex-1 min-h-0">
              <PreviewFrame files={files} device={device} />
            </div>
          ) : (
            <CodeView
              files={files}
              active={activeTab}
              onChange={setActiveTab}
              onEdit={(path, content) => {
                setFiles((prev) =>
                  prev.map((f) => (f.path === path ? { ...f, content } : f)),
                );
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

function CodeView({
  files,
  active,
  onChange,
  onEdit,
}: {
  files: ProjectFile[];
  active: string;
  onChange: (path: string) => void;
  onEdit: (path: string, content: string) => void;
}) {
  const editableFiles = files.filter((f) =>
    (EDITABLE_FILE_PATHS as readonly string[]).includes(f.path),
  );
  const current =
    editableFiles.find((f) => f.path === active) ?? editableFiles[0];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <FileTabs files={editableFiles} active={active} onChange={onChange} />
      {current ? (
        <textarea
          value={findFile(files, current.path)}
          onChange={(e) => onEdit(current.path, e.target.value)}
          spellCheck={false}
          className="flex-1 min-h-0 w-full p-4 text-xs font-mono text-zinc-200 bg-black/30 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500/30 whitespace-pre"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
          No editable files
        </div>
      )}
    </div>
  );
}
