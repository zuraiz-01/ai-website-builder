export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type WebsiteType =
  | "portfolio"
  | "agency"
  | "saas"
  | "real-estate"
  | "restaurant"
  | "app"
  | "blog"
  | "ecommerce";

export interface Project {
  id: string;
  name: string;
  type: WebsiteType;
  prompt: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  files?: ProjectFiles;
}

export interface ProjectFiles {
  "index.html": string;
  "styles.css": string;
  "script.js": string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export type DevicePreview = "desktop" | "tablet" | "mobile";

export interface GenerateRequest {
  prompt: string;
  type: WebsiteType;
  name: string;
}

export interface GenerateResponse {
  files: ProjectFiles;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
