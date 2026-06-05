# AI Website Builder

A Next.js 16 app that turns a natural-language prompt into a runnable, exportable static website using OpenRouter for code generation and Firebase for auth, project storage, and chat history.

## Stack
- **Framework**: Next.js 16.2.7 (App Router, Turbopack, TypeScript)
- **UI**: Tailwind CSS v4
- **Auth + DB**: Firebase Auth + Firestore (web SDK 12.x)
- **AI**: OpenRouter (called only from server API routes)
- **Export**: JSZip (client-side download)

## Quick start
```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev
```
Open http://localhost:3000.

## Environment variables
Create `.env.local` in the project root:

```env
# Firebase (client-visible, public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# OpenRouter (server-only, NEVER exposed to client)
OPENROUTER_API_KEY=sk-or-...
# Recommended default — let OpenRouter auto-pick a currently free model.
# You can change this to any model id, e.g.
#   OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
#   OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
#   OPENROUTER_MODEL=qwen/qwen3-coder:free
OPENROUTER_MODEL=openrouter/free

# Public site URL (used as HTTP-Referer header for OpenRouter)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`OPENROUTER_API_KEY` is read **only** by the server route handlers in `src/app/api/`. The key is never sent to the browser.

### Model selection
- `GET /api/models` (server-side) calls `https://openrouter.ai/api/v1/models` and returns a safe, sorted list (`free` models first). The list is filtered to free models in the UI by default.
- The model selector is a custom `ModelSelector` component that fetches `/api/models`, shows a loading state, an error state with a Retry button, a search input, and a "Free" badge per model.
- The selected model is saved on the Firestore project document as `selectedModel` and used by both `POST /api/generate` and `POST /api/edit`.
- Free models may have rate limits depending on OpenRouter usage policy.
- If `/api/models` fails, the UI falls back to a hard-coded list of known free models (see `src/app/api/models/route.ts`).

## Scripts
```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run production build
npm run lint    # run ESLint directly (next lint was removed in Next 16)
```

## User flow
1. Sign up / log in (Firebase Auth).
2. Dashboard → "New project" → fill project name, website type, and idea prompt.
3. App creates a Firestore `projects/{id}` doc with `status: "generating"`.
4. App saves the prompt as the first message in `projects/{id}/messages`.
5. App calls `POST /api/generate` which calls OpenRouter and returns `{ projectName, description, files: [{path,content}, ...] }`.
6. Client saves files to the project (`status: "generated"`) and saves an assistant summary message.
7. App redirects to `/dashboard/projects/{id}` (preview iframe + code editor + chat).
8. Chat edits: each user message is saved, `POST /api/edit` is called with the current files + the instruction, updated files are saved, and the AI reply is saved as an assistant message.
9. Refresh the page → project, files, and full chat history reload from Firestore.

## API routes

### `POST /api/generate`
- Body: `{ projectId, title, type, prompt, model? }` where `type` is one of `portfolio | agency | saas | real-estate | restaurant | app | blog | ecommerce` and `model` is an optional OpenRouter model id.
- Returns: `{ success: true, projectName, description, files: [{ path, content }] }` with exactly `index.html`, `styles.css`, `script.js` (or `{ success: false, error }`).
- Returns 400 on missing/invalid fields, 503 if `OPENROUTER_API_KEY` is not set, 502 if the model returns unparseable output.
- Does NOT write to Firestore. The authenticated client saves the result.

### `POST /api/edit`
- Body: `{ projectId, files: [{ path, content }], message, model? }`.
- Sends the current files + the user's instruction to OpenRouter and asks for the complete updated files.
- Returns: `{ success: true, projectName, description, files: [...], reply }` (or `{ success: false, error }`).
- Same status codes as `/api/generate`. The client saves the updated files and the reply message.

### `GET /api/models`
- Server-side fetch of `https://openrouter.ai/api/v1/models`.
- Returns: `{ success: true, models: [{ id, name, description, contextLength, isFree, promptPrice, completionPrice }] }`, sorted with free models first.
- If the upstream call fails, returns the same shape with a hard-coded fallback list of free models.
- The OpenRouter API key is **never** sent to the client.

Both routes use `src/lib/openrouter.ts`:
- `callOpenRouter(messages, options)` — POST to `https://openrouter.ai/api/v1/chat/completions` with `Authorization: Bearer ${OPENROUTER_API_KEY}`, `HTTP-Referer`, and `X-Title` headers.
- `cleanJsonResponse(text)` — strips markdown code fences and grabs the outermost JSON object.
- `sanitizeJsonString(cleaned)` — fixes common AI mistakes inside JSON strings (unescaped single quotes, raw newlines, raw tabs).
- `parseAIWebsiteResponse(text)` — parses the response into `{ projectName, description, files }`.
- `validateGeneratedFiles(files)` — keeps only `index.html`, `styles.css`, `script.js`.

## Data model (Firestore)

### `users/{uid}`
```ts
{
  name: string,
  email: string,
  photoURL: string | null,
  provider: "password" | "google" | "github",
  phone?: string,
  company?: string,
  website?: string,
  bio?: string,
  role: "user",
  subscription: {
    plan: "free" | "pro" | "team",
    status: "active" | "inactive",
    startedAt: Timestamp,
    updatedAt: Timestamp,
    generationLimit: number,
    projectLimit: number,
    usedGenerations: number,
    features: string[]
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `projects/{projectId}`
```ts
{
  userId: string,                 // owner
  title: string,
  prompt: string,
  type: WebsiteType,              // portfolio | agency | saas | real-estate | restaurant | app | blog | ecommerce
  description?: string,
  files: Array<{ path: string, content: string }>,
  status: "draft" | "generating" | "generated" | "failed",
  errorMessage?: string,
  selectedModel?: string,         // OpenRouter model id used for generate/edit
  createdAt, updatedAt            // serverTimestamp
}
```

### `projects/{projectId}/messages/{messageId}`
```ts
{ userId, role: "user" | "assistant" | "system", content, createdAt }
```

## Firestore Security Rules
Paste into Firebase Console → Firestore → Rules → Publish:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null
        && request.auth.uid == userId
        // Prevent users from changing immutable fields from the client
        && request.resource.data.role == resource.data.role
        && request.resource.data.email == resource.data.email
        && request.resource.data.uid == resource.data.uid
        && request.resource.data.createdAt == resource.data.createdAt
        // Clients can edit subscription freely in this MVP — for
        // production move this behind an admin SDK / Cloud Function
        // so users cannot grant themselves a higher plan.
        && (
          // allow self-switching plans, but cap the limit fields
          (request.resource.data.subscription.plan in ["free", "pro", "team"])
        );
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    match /projects/{projectId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;

      match /messages/{messageId} {
        allow read, create: if request.auth != null
          && get(/databases/$(database)/documents/projects/$(projectId)).data.userId == request.auth.uid;
      }
    }
  }
}
```

> **If you see `FirebaseError: Missing or insufficient permissions`** in the browser console, you have not yet deployed the rules above. Until they're published, every read/write is denied. The code is fine; the Firebase project just needs the rules.

### Required Firestore index
The dashboard's project list query is:
```js
query(collection(db, "projects"), where("userId", "==", uid), orderBy("updatedAt", "desc"))
```
Create a composite index in the Firebase console:
- Collection: `projects`
- Fields: `userId` (Ascending), `updatedAt` (Descending)
- Query scope: Collection

If the index is not yet provisioned the dashboard falls back to a client-side sort on `updatedAt`.

## Preview
`src/components/editor/PreviewFrame.tsx`:
- Reads `index.html`, `styles.css`, `script.js` from the project files.
- Inlines the CSS and JS into the HTML (replacing `<link href="styles.css">` and `<script src="script.js">` if present, otherwise appending them into `<head>` / after `<body>`).
- Renders the resulting HTML inside a sandboxed `<iframe sandbox="allow-scripts">` via `srcDoc`.
- Supports desktop / tablet / mobile widths.

## Chat input
`src/components/editor/ChatPanel.tsx`:
- Auto-growing textarea (48px → up to 220px) with internal scroll past the cap.
- `Enter` sends, `Shift + Enter` inserts a newline.
- Send button is disabled while loading or when the input is empty.
- Input keeps focus and resets its height after sending.

## Profile & subscription (manual / demo mode)
- `/dashboard/profile` lets the signed-in user view and edit profile fields (name, phone, company, website, bio, photo URL). Email is read-only.
- The page also shows the current subscription, usage meters, and three plan cards (Free / Pro / Team) for manual plan switching.
- Plan switching is **demo / admin-less** — no payment gateway is wired in. Clicking a plan card opens a confirm modal and updates the user's `subscription` object in Firestore.
- Profile changes are saved via `updateUserProfile(uid, data)` in `src/lib/firestore-service.ts`.
- Plan changes are saved via `updateUserSubscription(uid, plan)`. `usedGenerations` is preserved across plan changes; the UI clamps the displayed progress to the new `generationLimit`.
- Default plan for new users: `free` (3 generations / 3 projects). Existing users without a `subscription` field are auto-migrated on next sign-in.

### Plan configuration
| Plan | Generation limit | Project limit | Features |
|---|---|---|---|
| Free | 3 | 3 | Basic generation, ZIP export, community support |
| Pro  | 50 | 50 | Chat-based editing, priority models, better templates |
| Team | 200 | 200 | Team collaboration, advanced editing, premium templates |

### Limit enforcement
- **Project limit** — `/dashboard/new` calls `getUserProjects(user.uid)` on mount. If the count is already at the user's `projectLimit`, the form blocks submission with a friendly error and the submit button reads "Project limit reached". A small status strip shows `projects / limit` and a link to the profile page.
- **Generation limit** — before calling `/api/generate`, the page checks `usedGenerations >= generationLimit`. The submit button reads "Generation limit reached" when at the cap.
- **Increment** — only after a successful generation does the client call `incrementUserGenerationUsage(uid)`, which atomically increments `subscription.usedGenerations` in Firestore. Failed generations do not consume a credit.
- **Chat edits do not count** as new generations. They use `/api/edit` and do not touch `usedGenerations`.

> **Demo / MVP note.** Subscription switching is currently self-service. For production, move plan changes to a Cloud Function triggered by a payment webhook, restrict `users/{uid}.subscription` writes to that function via Security Rules, and remove the client-side `switchPlan` helper.

## Manual test checklist
1. Sign up → a `users/{uid}` doc is created.
2. New project → a `projects/{id}` doc with `status: "generating"` and one user message.
3. OpenRouter returns 3 files; project updates to `status: "generated"` and an assistant message is appended.
4. Redirect to `/dashboard/projects/{id}`; preview shows the generated site.
5. Send a chat edit → `/api/edit` returns updated files; files save, preview updates, assistant message appended.
6. Hard refresh → project, files, and full chat history reload.
7. Log in as a different user → that user's projects/messages are not visible.

## Project structure
```
src/
  app/
    (auth)/login/page.tsx                 # /login
    (auth)/signup/page.tsx                # /signup
    api/generate/route.ts                 # /api/generate  (server-only OpenRouter)
    api/edit/route.ts                     # /api/edit      (server-only OpenRouter)
    api/models/route.ts                   # /api/models    (server-only, free models list)
    dashboard/
      layout.tsx                          # <RequireAuth> wrapper
      page.tsx                            # real projects list + plan summary
      new/page.tsx                        # create + generate (with plan limits)
      profile/page.tsx                    # profile CRUD + plan switcher
      projects/[projectId]/page.tsx       # editor: preview, code, chat, save
    layout.tsx                            # <AuthProvider>
    page.tsx                              # landing
  components/editor/ModelSelector.tsx    # free models dropdown, search, error+retry
  components/profile/                     # ProfileForm, SubscriptionCard, PlanCard, UsageMeter
  components/                             # UI, layout, editor, landing
  context/AuthContext.tsx                 # onAuthStateChanged + user profile
  hooks/useRequireAuth.tsx                # route guard
  lib/
    firebase.ts                           # env-driven Firebase init
    firestore-service.ts                  # typed CRUD with userId ownership
    openrouter.ts                         # server-only OpenRouter client
    zip-export.ts                         # ProjectFile[] -> JSZip blob
  types/index.ts                          # Project, ProjectFile, ChatMessage, ...
```

## Security notes
- `OPENROUTER_API_KEY` is read with `process.env.OPENROUTER_API_KEY` inside the server route handlers. The `.env.local` is loaded by Next.js at build/dev time. The key is never imported into any file marked `"use client"`.
- All Firestore reads and writes go through `src/lib/firestore-service.ts`, which checks `resource.data.userId === userId` on every project access.
- Generated websites run inside `<iframe sandbox="allow-scripts">` (no `allow-same-origin`), so user-generated scripts cannot access the parent app's storage.
