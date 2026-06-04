import type { User as FirebaseUser } from "firebase/auth";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  provider: "password" | "google" | "github";
  createdAt: number;
  updatedAt: number;
}

export type AuthUser = FirebaseUser;

export type WebsiteType =
  | "portfolio"
  | "agency"
  | "saas"
  | "real-estate"
  | "restaurant"
  | "app"
  | "blog"
  | "ecommerce";

export type ProjectStatus = "draft" | "generating" | "generated" | "failed";

export type ProjectFile = {
  path: string;
  content: string;
};

export type ChatMessage = {
  id?: string;
  projectId: string;
  userId: string;
  role: "user" | "assistant" | "system";
  content: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  type: string;
  prompt: string;
  files: ProjectFile[];
  status: ProjectStatus;
  description?: string;
  errorMessage?: string;
  selectedModel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedAt?: any;
};

export type FirestoreProject = Project;

export type OpenRouterModel = {
  id: string;
  name: string;
  description?: string;
  contextLength?: number;
  isFree: boolean;
  promptPrice?: string;
  completionPrice?: string;
};

export type OpenRouterModelsSuccess = {
  success: true;
  models: OpenRouterModel[];
};

export type OpenRouterModelsError = {
  success: false;
  error: string;
};

export type OpenRouterModelsResponse =
  | OpenRouterModelsSuccess
  | OpenRouterModelsError;

export type DevicePreview = "desktop" | "tablet" | "mobile";

export interface GenerateRequest {
  projectId: string;
  title: string;
  type: string;
  prompt: string;
  model?: string;
}

export interface GenerateSuccessResponse {
  success: true;
  projectName: string;
  description: string;
  files: ProjectFile[];
}

export interface GenerateErrorResponse {
  success: false;
  error: string;
}

export type GenerateApiResponse =
  | GenerateSuccessResponse
  | GenerateErrorResponse;

export interface EditRequest {
  projectId: string;
  files: ProjectFile[];
  message: string;
  model?: string;
}

export interface EditSuccessResponse {
  success: true;
  projectName: string;
  description: string;
  files: ProjectFile[];
  reply: string;
}

export interface EditErrorResponse {
  success: false;
  error: string;
}

export type EditApiResponse = EditSuccessResponse | EditErrorResponse;
