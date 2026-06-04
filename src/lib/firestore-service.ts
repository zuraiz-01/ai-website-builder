import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import { db as firestore } from "./firebase";
import type {
  ChatMessage,
  FirestoreProject,
  ProjectFile,
  ProjectStatus,
  UserProfile,
} from "@/types";

function requireDb(): Firestore {
  if (!firestore) {
    throw new Error(
      "Firestore is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.",
    );
  }
  return firestore;
}

function tsToMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : Date.now();
  }
  return Date.now();
}

function projectFromDoc(
  id: string,
  data: Record<string, unknown>,
): FirestoreProject {
  return {
    id,
    userId: (data.userId as string) ?? "",
    title: (data.title as string) ?? "Untitled project",
    prompt: (data.prompt as string) ?? "",
    type: (data.type as string) ?? "portfolio",
    files: Array.isArray(data.files)
      ? (data.files as ProjectFile[])
      : [],
    status: (data.status as ProjectStatus) ?? "draft",
    errorMessage: data.errorMessage as string | undefined,
    description: data.description as string | undefined,
    selectedModel: data.selectedModel as string | undefined,
    createdAt: data.createdAt ? tsToMillis(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? tsToMillis(data.updatedAt) : undefined,
  };
}

function messageFromDoc(
  id: string,
  data: Record<string, unknown>,
  projectId: string,
): ChatMessage {
  return {
    id,
    projectId,
    userId: (data.userId as string) ?? "",
    role:
      (data.role as "user" | "assistant" | "system" | undefined) ?? "assistant",
    content: (data.content as string) ?? "",
    createdAt: tsToMillis(data.createdAt),
  };
}

export async function createUserProfile(
  uid: string,
  data: {
    name: string;
    email: string;
    photoURL?: string | null;
    provider?: UserProfile["provider"];
  },
): Promise<UserProfile> {
  const database = requireDb();
  const ref = doc(database, "users", uid);
  const now = Date.now();
  const profile: UserProfile = {
    uid,
    name: data.name,
    email: data.email,
    photoURL: data.photoURL ?? null,
    provider: data.provider ?? "password",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return profile;
}

export async function getUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const database = requireDb();
  const snap = await getDoc(doc(database, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    name: (data.name as string) ?? "",
    email: (data.email as string) ?? "",
    photoURL: (data.photoURL as string | null) ?? null,
    provider: (data.provider as UserProfile["provider"]) ?? "password",
    createdAt: tsToMillis(data.createdAt),
    updatedAt: tsToMillis(data.updatedAt),
  };
}

export async function ensureUserProfile(
  uid: string,
  fallback: { name: string; email: string; photoURL?: string | null },
): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) return existing;
  return createUserProfile(uid, fallback);
}

export interface CreateProjectInput {
  title: string;
  prompt: string;
  type: string;
  description?: string;
  files?: ProjectFile[];
  status?: ProjectStatus;
  errorMessage?: string;
  selectedModel?: string;
}

export async function createProject(
  userId: string,
  input: CreateProjectInput,
): Promise<string> {
  const database = requireDb();
  const ref = await addDoc(collection(database, "projects"), {
    userId,
    title: input.title.trim(),
    prompt: input.prompt.trim(),
    type: input.type,
    description: input.description ?? null,
    files: input.files ?? [],
    status: input.status ?? "draft",
    errorMessage: input.errorMessage ?? null,
    selectedModel: input.selectedModel ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

async function getProjectOrThrow(
  projectId: string,
  userId: string,
): Promise<void> {
  const database = requireDb();
  const snap = await getDoc(doc(database, "projects", projectId));
  if (!snap.exists() || snap.data().userId !== userId) {
    throw new Error("Project not found or access denied.");
  }
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: Partial<
    Pick<
      FirestoreProject,
      | "title"
      | "prompt"
      | "files"
      | "status"
      | "errorMessage"
      | "type"
      | "description"
      | "selectedModel"
    >
  >,
): Promise<void> {
  await getProjectOrThrow(projectId, userId);
  const database = requireDb();
  const ref = doc(database, "projects", projectId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function updateProjectFiles(
  projectId: string,
  userId: string,
  files: ProjectFile[],
): Promise<void> {
  await getProjectOrThrow(projectId, userId);
  const database = requireDb();
  const ref = doc(database, "projects", projectId);
  await updateDoc(ref, {
    files,
    status: "generated",
    errorMessage: null,
    updatedAt: serverTimestamp(),
  });
}

export async function updateProjectStatus(
  projectId: string,
  userId: string,
  status: ProjectStatus,
  errorMessage?: string,
): Promise<void> {
  await getProjectOrThrow(projectId, userId);
  const database = requireDb();
  const ref = doc(database, "projects", projectId);
  await updateDoc(ref, {
    status,
    errorMessage: errorMessage ?? null,
    updatedAt: serverTimestamp(),
  });
}

export async function getProjectById(
  projectId: string,
  userId: string,
): Promise<FirestoreProject | null> {
  const database = requireDb();
  const snap = await getDoc(doc(database, "projects", projectId));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.userId !== userId) return null;
  return projectFromDoc(snap.id, data);
}

export async function getUserProjects(
  userId: string,
): Promise<FirestoreProject[]> {
  const database = requireDb();
  try {
    const q = query(
      collection(database, "projects"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => projectFromDoc(d.id, d.data()));
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "failed-precondition") {
      const q = query(
        collection(database, "projects"),
        where("userId", "==", userId),
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => projectFromDoc(d.id, d.data()));
      list.sort((a, b) => b.updatedAt - a.updatedAt);
      return list;
    }
    throw err;
  }
}

export async function deleteProject(
  projectId: string,
  userId: string,
): Promise<void> {
  await getProjectOrThrow(projectId, userId);
  const database = requireDb();
  await deleteDoc(doc(database, "projects", projectId));
}

export interface SaveChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function saveChatMessage(
  projectId: string,
  userId: string,
  message: SaveChatMessageInput,
): Promise<ChatMessage> {
  await getProjectOrThrow(projectId, userId);
  const database = requireDb();
  const ref = await addDoc(
    collection(database, "projects", projectId, "messages"),
    {
      userId,
      role: message.role,
      content: message.content,
      createdAt: serverTimestamp(),
    },
  );
  return {
    id: ref.id,
    projectId,
    userId,
    role: message.role,
    content: message.content,
    createdAt: Date.now(),
  };
}

export async function getProjectMessages(
  projectId: string,
  userId: string,
): Promise<ChatMessage[]> {
  await getProjectOrThrow(projectId, userId);
  const database = requireDb();
  try {
    const q = query(
      collection(database, "projects", projectId, "messages"),
      orderBy("createdAt", "asc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) =>
      messageFromDoc(d.id, d.data(), projectId),
    );
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === "failed-precondition") {
      const q = query(
        collection(database, "projects", projectId, "messages"),
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) =>
        messageFromDoc(d.id, d.data(), projectId),
      );
      list.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
      return list;
    }
    throw err;
  }
}
