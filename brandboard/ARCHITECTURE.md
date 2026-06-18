# Brandboard AI — Architecture

> Technical architecture for the Brandboard AI MVP, derived from `PRD.md`.
> This document defines structure and contracts **before** any application code is written.

**Stack of record:** Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS · shadcn/ui · React Flow · TanStack Query · Supabase (Postgres + Auth + Storage) · OpenAI · Brandfetch · SerpAPI · Apify · Unsplash · Pexels · Vercel.

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Database Schema](#2-database-schema)
3. [API Architecture](#3-api-architecture)
4. [Component Hierarchy](#4-component-hierarchy)
5. [Page Hierarchy](#5-page-hierarchy)
6. [State Management Plan](#6-state-management-plan)
7. [Authentication Flow](#7-authentication-flow)
8. [External Integrations Plan](#8-external-integrations-plan)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)

---

## 1. Folder Structure

A modular, feature-oriented App Router layout. UI primitives live in `components/ui` (shadcn), feature components are colocated under `components/<feature>`, and all non-React logic lives under `lib/`.

```
brandboard/
├── app/                                  # Next.js App Router
│   ├── (marketing)/                      # Public, unauthenticated route group
│   │   ├── page.tsx                      # Landing page
│   │   ├── pricing/page.tsx
│   │   └── layout.tsx
│   ├── (auth)/                           # Auth route group
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (app)/                            # Authenticated app shell (protected)
│   │   ├── layout.tsx                    # Sidebar + topbar shell, session guard
│   │   ├── dashboard/page.tsx            # Recent projects, templates, new audit
│   │   ├── projects/
│   │   │   ├── page.tsx                  # All projects list
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx              # Project overview / audit report
│   │   │       └── boards/
│   │   │           └── [boardId]/page.tsx# Infinite canvas board editor
│   │   ├── new/page.tsx                  # New audit / moodboard prompt entry
│   │   └── settings/page.tsx
│   ├── api/                              # Route Handlers (REST-ish)
│   │   ├── audit/route.ts                # POST: kick off brand audit pipeline
│   │   ├── moodboard/route.ts            # POST: generate moodboard
│   │   ├── jobs/[jobId]/route.ts         # GET: poll async generation job
│   │   ├── assets/search/route.ts        # GET: image search proxy (Unsplash/Pexels)
│   │   ├── export/route.ts               # POST: PDF/PNG export
│   │   └── webhooks/apify/route.ts       # POST: Apify run completion webhook
│   ├── auth/
│   │   ├── callback/route.ts             # Supabase OAuth/email code exchange
│   │   └── signout/route.ts
│   ├── layout.tsx                        # Root layout (providers, theme, fonts)
│   ├── globals.css
│   ├── error.tsx
│   └── not-found.tsx
│
├── components/
│   ├── ui/                               # shadcn/ui primitives (button, card, dialog…)
│   ├── layout/                           # AppSidebar, TopBar, ThemeToggle, UserMenu
│   ├── dashboard/                        # ProjectGrid, ProjectCard, TemplateGallery
│   ├── audit/                            # AuditReport + section cards
│   ├── moodboard/                        # MoodboardPreview, ThemeGroup
│   ├── canvas/                           # ReactFlow wrapper, node types, toolbars
│   │   ├── nodes/                        # ImageNode, ColorNode, TextNode, NoteNode…
│   │   └── panels/                       # LeftAssetPanel, RightInsightsPanel
│   ├── prompt/                           # PromptInput, ExampleChips, GenerationStatus
│   ├── export/                           # ExportDialog, PresentationMode
│   └── common/                           # EmptyState, LoadingSkeletons, ErrorBoundary
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser client
│   │   ├── server.ts                     # Server client (RSC / route handlers)
│   │   ├── middleware.ts                 # Session refresh helper
│   │   └── admin.ts                      # Service-role client (server-only)
│   ├── ai/
│   │   ├── openai.ts                     # OpenAI client config
│   │   ├── agents/
│   │   │   ├── research-agent.ts         # Agent 1
│   │   │   ├── brand-strategist.ts       # Agent 2
│   │   │   └── moodboard-curator.ts      # Agent 3
│   │   ├── prompts.ts                    # System/prompt templates
│   │   └── schemas.ts                    # Zod schemas for structured AI output
│   ├── integrations/
│   │   ├── brandfetch.ts
│   │   ├── serpapi.ts
│   │   ├── apify.ts
│   │   ├── unsplash.ts
│   │   └── pexels.ts
│   ├── pipeline/
│   │   ├── audit-pipeline.ts             # Orchestrates agents + integrations
│   │   └── moodboard-pipeline.ts
│   ├── actions/                          # Server Actions
│   │   ├── projects.ts
│   │   ├── boards.ts
│   │   ├── canvas.ts
│   │   └── assets.ts
│   ├── queries/                          # TanStack Query keys + fetchers
│   ├── validators/                       # Zod input schemas (shared client/server)
│   ├── export/                           # PDF/PNG rendering utilities
│   └── utils/                            # cn(), formatters, constants, env
│
├── types/
│   ├── database.types.ts                 # Generated Supabase types
│   └── domain.ts                         # App-level domain types
│
├── hooks/                                # useCanvas, useDebounce, useJobPolling…
│
├── supabase/
│   ├── migrations/                       # SQL migrations (source of truth)
│   ├── seed.sql
│   └── config.toml
│
├── public/
├── middleware.ts                         # Auth/session middleware (root)
├── .env.local.example
├── tailwind.config.ts
├── components.json                       # shadcn config
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. Database Schema

Postgres (via Supabase). Every domain table carries `user_id` (directly or via FK chain) for Row-Level Security. The PRD's base columns are extended with status tracking, soft references, and indexing needed for the async generation pipeline.

### Entity Relationship Overview

```
auth.users (Supabase managed)
     │ 1
     │
     ▼ N
  profiles ──1───N── projects ──1───N── boards ──1───N── canvas_items
                         │ 1                                    │ N
                         ├───N── assets ───────────────────────┘ (asset_id FK)
                         ├───1── audit_results
                         └───1───N── jobs   (generation pipeline tracking)
```

### Tables

**profiles** — mirrors `auth.users` (PRD `users`), one row per authenticated user.

| column | type | notes |
|---|---|---|
| id | uuid PK | FK → `auth.users.id` (on delete cascade) |
| email | text | unique |
| name | text | |
| avatar_url | text | nullable |
| created_at | timestamptz | default now() |

**projects**

| column | type | notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid | FK → profiles.id, indexed |
| title | text | not null |
| description | text | nullable |
| input_prompt | text | original user prompt |
| input_type | text | enum: `company` \| `url` \| `concept` \| `industry` |
| status | text | enum: `draft` \| `generating` \| `ready` \| `failed` |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | trigger-maintained |

**boards**

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | FK → projects.id (cascade), indexed |
| name | text | not null |
| canvas_state | jsonb | viewport, zoom, section metadata |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | trigger-maintained |

**assets** — research artifacts (images, colors, fonts, references).

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | FK → projects.id (cascade), indexed |
| type | text | enum: `image` \| `color` \| `font` \| `logo` \| `note` \| `reference` |
| title | text | nullable |
| url | text | storage URL or external link |
| source | text | `brandfetch` \| `serpapi` \| `apify` \| `unsplash` \| `pexels` \| `ai` \| `user` |
| metadata_json | jsonb | hex value, tags, attribution, dimensions, etc. |
| created_at | timestamptz | default now() |

**audit_results** — one strategic report per project.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | FK → projects.id (cascade), unique |
| summary | text | |
| mission | text | |
| positioning | text | |
| tone | text | brand personality |
| color_palette | jsonb | [{hex, name, role}] |
| typography | jsonb | [{family, role, source}] |
| competitors | jsonb | [{name, note, url}] |
| insights | jsonb | opportunities + recommendations |
| created_at | timestamptz | default now() |

**canvas_items** — placement of assets on a board.

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| board_id | uuid | FK → boards.id (cascade), indexed |
| asset_id | uuid | FK → assets.id (set null), nullable for pure text notes |
| node_type | text | `image` \| `color` \| `text` \| `note` \| `section` |
| x | double precision | |
| y | double precision | |
| width | double precision | |
| height | double precision | |
| rotation | double precision | default 0 |
| z_index | integer | default 0 |
| notes | text | nullable |
| data | jsonb | node-specific props |
| created_at | timestamptz | default now() |

**jobs** — tracks async AI generation runs (powers polling + Apify webhooks).

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| project_id | uuid | FK → projects.id (cascade), indexed |
| user_id | uuid | FK → profiles.id |
| kind | text | `audit` \| `moodboard` |
| status | text | `queued` \| `running` \| `succeeded` \| `failed` |
| progress | integer | 0–100 |
| step | text | human-readable current stage |
| error | text | nullable |
| external_run_id | text | Apify/3rd-party run id |
| created_at / updated_at | timestamptz | |

### Indexes
- `projects(user_id, updated_at desc)` — dashboard listing
- `boards(project_id)`, `assets(project_id, type)`, `canvas_items(board_id)`
- `jobs(project_id, status)`

### Row-Level Security (enabled on all tables)
- **profiles:** `id = auth.uid()`.
- **projects:** `user_id = auth.uid()` for select/insert/update/delete.
- **boards / assets / audit_results:** access allowed when the parent `project.user_id = auth.uid()` (subquery/`EXISTS`).
- **canvas_items:** access via `board → project → user_id = auth.uid()`.
- **jobs:** `user_id = auth.uid()`.
- Service-role key (server-only) bypasses RLS for pipeline writes after authorizing the caller.

### Storage Buckets
- `assets` (private) — downloaded/processed images, logos. Served via signed URLs.
- `exports` (private) — generated PDFs/PNGs, short-lived signed URLs.
- `avatars` (public) — profile images.

---

## 3. API Architecture

Two complementary server surfaces:

- **Server Actions** for synchronous, mutation-style CRUD invoked directly from RSC/forms (projects, boards, canvas item persistence).
- **Route Handlers** (`app/api/*`) for the AI pipeline, long-running jobs, third-party proxies, webhooks, and export — anything needing explicit request/response semantics or external callbacks.

### Generation is asynchronous (job-based)

The PRD targets "time to first board under 60 seconds," but multi-agent + multi-API research can exceed serverless request limits. So generation is modeled as a **job**: the client kicks it off, then polls (TanStack Query) or subscribes via Supabase Realtime.

```
Client                  Route Handler            Pipeline (server)         Supabase
  │  POST /api/audit ───────►│                                                │
  │                          │ create project + job (queued) ───────────────►│
  │  ◄── { jobId, projectId }│                                                │
  │                          │ run pipeline (async) ──────►│                  │
  │                          │                             │ Agent1→APIs      │
  │                          │                             │ Agent2 (OpenAI)  │
  │                          │                             │ Agent3 (curate)  │
  │                          │                             │ write rows ─────►│
  │  GET /api/jobs/{id} ─────►│ read job status ──────────────────────────────►│
  │  ◄── { status, progress }│                                                │
  │  (status=succeeded → navigate to board)                                   │
```

### Endpoints

| Method | Path | Purpose | Auth |
|---|---|---|---|
| POST | `/api/audit` | Create project + enqueue audit pipeline | required |
| POST | `/api/moodboard` | Create project + enqueue moodboard pipeline | required |
| GET | `/api/jobs/[jobId]` | Poll job status/progress | required (owner) |
| GET | `/api/assets/search` | Proxy Unsplash/Pexels search (key hiding, caching) | required |
| POST | `/api/export` | Render board to PDF/PNG, return signed URL | required (owner) |
| POST | `/api/webhooks/apify` | Apify run-finished callback | signature-verified |
| GET | `/auth/callback` | Supabase code exchange | public |
| POST | `/auth/signout` | Clear session | required |

### Server Actions (in `lib/actions/`)

| Action | Purpose |
|---|---|
| `createProject`, `updateProject`, `deleteProject`, `duplicateProject` | Project CRUD (PRD: save/reopen/duplicate) |
| `createBoard`, `renameBoard`, `deleteBoard`, `saveCanvasState` | Board lifecycle |
| `upsertCanvasItem`, `deleteCanvasItem`, `bulkUpdateCanvasItems` | Canvas persistence (debounced batches) |
| `addAsset`, `removeAsset` | Manual asset management |

### Conventions
- All inputs validated with **Zod** (`lib/validators`) on the server boundary.
- Standard JSON error envelope: `{ error: { code, message } }`.
- Ownership checks via RLS (user-scoped client) + explicit guards in service-role paths.
- Rate limiting on generation + search endpoints (per-user token bucket).

---

## 4. Component Hierarchy

```
RootLayout (providers: Theme, QueryClient, Supabase, Toaster)
│
├── (marketing)
│   └── LandingPage → Hero · ExampleChips · FeatureGrid · CTA
│
├── (auth)
│   └── AuthLayout → AuthCard → { LoginForm | SignupForm | ForgotPasswordForm }
│
└── (app) AppShell
    ├── AppSidebar (nav, recent projects, new audit)
    ├── TopBar (search, ThemeToggle, UserMenu)
    │
    ├── DashboardPage
    │   ├── PromptInput + ExampleChips
    │   ├── ProjectGrid → ProjectCard*
    │   ├── SavedBoardsRow → BoardCard*
    │   └── TemplateGallery → TemplateCard*
    │
    ├── ProjectPage (Audit Report)
    │   └── AuditReport
    │       ├── BrandOverviewSection (logo, summary, mission, positioning)
    │       ├── VisualIdentitySection (ColorPalette, Typography, PhotographyStyle)
    │       ├── SocialPresenceSection
    │       ├── CompetitiveLandscapeSection → CompetitorCard*
    │       └── CreativeInsightsSection
    │
    └── BoardEditorPage
        ├── BoardHeader (title, save state, ExportButton, PresentButton)
        ├── LeftAssetPanel
        │   └── Tabs: Assets · Colors · Typography · Images · Notes
        │       └── DraggableAssetItem* (drag onto canvas)
        ├── InfiniteCanvas (React Flow)
        │   ├── CanvasToolbar (zoom, fit, add section/note)
        │   ├── nodes/ ImageNode · ColorNode · TextNode · NoteNode · SectionNode
        │   ├── SelectionToolbar (resize, rotate, delete, z-order)
        │   └── MiniMap · Controls · Background
        └── RightInsightsPanel
            └── BrandSummary · GeneratedRecommendations · ProjectInsights

Shared/overlay:
ExportDialog · PresentationMode · CommandPalette · ConfirmDialog ·
EmptyState · LoadingSkeletons · ErrorBoundary · Toasts
```

**Design principles:** server components for data fetching (reports, lists); client components only where interactivity is required (canvas, forms, panels). UI primitives stay in `components/ui` and are composed upward.

---

## 5. Page Hierarchy

| Route | Group | Rendering | Access | Purpose |
|---|---|---|---|---|
| `/` | marketing | Static/RSC | public | Landing + examples |
| `/pricing` | marketing | Static | public | Plans |
| `/login` | auth | Client form | public | Sign in |
| `/signup` | auth | Client form | public | Register |
| `/forgot-password` | auth | Client form | public | Reset |
| `/auth/callback` | — | Route handler | public | OAuth/email code exchange |
| `/dashboard` | app | RSC + client islands | protected | Recent projects, templates, new audit, search |
| `/new` | app | Client | protected | Prompt entry → triggers generation |
| `/projects` | app | RSC | protected | All projects |
| `/projects/[projectId]` | app | RSC | protected | Audit report / project overview |
| `/projects/[projectId]/boards/[boardId]` | app | Client (canvas) | protected | Infinite canvas editor |
| `/settings` | app | RSC + client | protected | Profile, theme, account |

**Navigation flow (PRD core user flow):**
`/new` (enter prompt) → POST `/api/audit` → job polling UI → on success → `/projects/[id]` (report) → "Open Board" → `/projects/[id]/boards/[id]` (edit canvas) → ExportDialog (export).

All `(app)` routes are gated by middleware + a server-side session check in `(app)/layout.tsx`.

---

## 6. State Management Plan

Layered by concern — no single global store; each tool fits its job.

| Layer | Tool | Responsibility |
|---|---|---|
| Server/remote state | **TanStack Query** | Projects, boards, assets, audit results, job polling. Caching, background refetch, optimistic updates. |
| Mutations / persistence | **Server Actions** | Writes; revalidate paths/queries afterward. |
| Canvas interaction state | **React Flow** (internal) + **Zustand** store | Nodes/edges, selection, viewport, drag/resize live state. Local-first for 60fps interactions. |
| Realtime job/progress | **Supabase Realtime** (or polling fallback) | Live generation progress; updates Query cache. |
| URL state | **Next.js searchParams / route params** | Active project, board, panel tab, selected node. Shareable + back-button friendly. |
| Local UI state | **React `useState`/`useReducer`** | Dialogs, panel toggles, form fields. |
| Theme | **next-themes** | Dark/light mode (PRD requirement). |
| Auth/session | **Supabase client + middleware** | Session hydrated server-side, exposed via context provider. |

### Canvas persistence strategy
- React Flow + Zustand hold live state for smooth editing.
- Changes are **debounced (~800ms)** and batched into `bulkUpdateCanvasItems` / `saveCanvasState`.
- "Saving…/Saved" indicator in `BoardHeader` reflects sync status.
- On load, `canvas_items` + `boards.canvas_state` hydrate the store.

### Query key conventions (`lib/queries`)
`['projects']`, `['project', id]`, `['boards', projectId]`, `['board', id]`, `['assets', projectId]`, `['job', jobId]`, `['audit', projectId]`.

---

## 7. Authentication Flow

Supabase Auth with email/password + OAuth (Google), using `@supabase/ssr` for cookie-based sessions across RSC, Route Handlers, and middleware.

```
                 ┌─────────────── Unauthenticated ───────────────┐
                 │                                                │
  Visit /dashboard ──► middleware checks session ──► none ──► redirect /login
                 │
  /login (email+pw or OAuth)
     │
     ├─ email/pw → supabase.auth.signInWithPassword
     └─ OAuth   → supabase.auth.signInWithOAuth ─► provider ─► /auth/callback
                                                                  │
                                                exchangeCodeForSession (set cookies)
                                                                  │
  on first sign-in: DB trigger creates profiles row from auth.users
                                                                  │
                                                       redirect → /dashboard
                 │
  Authenticated requests:
     • middleware.ts refreshes session cookie on every request
     • RSC/Route Handlers read session via lib/supabase/server.ts
     • RLS enforces per-user data access in Postgres
                 │
  Sign out → POST /auth/signout → supabase.auth.signOut → redirect /
```

**Key points**
- `middleware.ts` (root) calls the session-refresh helper and protects `(app)/*`.
- `(app)/layout.tsx` performs a server-side `getUser()` guard as defense-in-depth.
- Profile bootstrapping handled by a Postgres trigger (`on auth.users insert → insert into profiles`).
- Server-only secrets (service-role key, API keys) never reach the client; only `NEXT_PUBLIC_*` values are exposed.
- Authorization (ownership) is enforced primarily by RLS; service-role pipeline paths re-check `user_id`.

---

## 8. External Integrations Plan

All third-party calls are server-side only (keys hidden), wrapped in typed adapters under `lib/integrations/`, with timeouts, retries (exponential backoff), and graceful degradation (a failed source never fails the whole pipeline).

| Service | Role in pipeline | Used by | Key env | Failure mode |
|---|---|---|---|---|
| **OpenAI** | Brand analysis, summaries, strategic insights, image tagging; powers all 3 agents | Brand Strategist, Curator, Research | `OPENAI_API_KEY` | Retry; if down, mark job failed |
| **Brandfetch** | Logo, colors, fonts, company metadata | Research Agent | `BRANDFETCH_API_KEY` | Skip → fall back to AI/SerpAPI |
| **SerpAPI** | Web/search results for company info + competitors | Research Agent | `SERPAPI_API_KEY` | Skip → reduce competitor depth |
| **Apify** | Scrape Instagram/social/web (async actors) | Research Agent | `APIFY_TOKEN` | Async via webhook; optional |
| **Unsplash** | High-quality stock for moodboards | Curator, asset search | `UNSPLASH_ACCESS_KEY` | Fall back to Pexels |
| **Pexels** | Alternate/backup stock imagery | Curator, asset search | `PEXELS_API_KEY` | Fall back to Unsplash |

### Pipeline orchestration (`lib/pipeline/audit-pipeline.ts`)

```
1. Research Agent (Agent 1)
   ├─ Brandfetch  → logo, palette, fonts, metadata
   ├─ SerpAPI     → company facts, competitors
   ├─ Apify       → social presence (async; webhook updates job)
   └─ Unsplash/Pexels → candidate visual references
   → normalize into structured JSON (Zod-validated) → assets rows

2. Brand Strategist (Agent 2 / OpenAI)
   → positioning, audience, tone, competitive analysis,
     opportunities, recommendations (structured JSON)
   → audit_results row

3. Moodboard Curator (Agent 3 / OpenAI)
   → select + group references into themes, propose layout
   → board + canvas_items rows

Job progress updated at each step (queued→running→succeeded/failed).
```

### Integration safeguards
- **Caching:** image-search and Brandfetch responses cached (per query/domain) to cut cost + latency.
- **Rate limiting & quotas:** per-user limits on generation; centralized usage tracking.
- **Attribution:** Unsplash/Pexels attribution stored in `assets.metadata_json` (license compliance).
- **Apify async:** start actor run → store `external_run_id` on `jobs` → `/api/webhooks/apify` (signature-verified) resumes processing.
- **Structured output:** every AI/agent response parsed against Zod schemas (`lib/ai/schemas.ts`); invalid output triggers a single repair retry, then fails gracefully.
- **Env management:** all keys in `.env.local` (documented in `.env.local.example`); only `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public.

---

## 9. Cross-Cutting Concerns

- **TypeScript:** `strict: true`; DB types generated from Supabase (`types/database.types.ts`); shared Zod schemas infer both client and server types.
- **Validation:** Zod at every boundary (forms, actions, route handlers, AI output).
- **Error handling:** route-level `error.tsx`, `ErrorBoundary` around the canvas, typed error envelopes, toast notifications.
- **Theming:** `next-themes` dark/light, Tailwind tokens, shadcn/ui — Apple-quality polish per PRD.
- **Responsiveness:** dashboard/report fully responsive; canvas optimized for desktop with a usable tablet experience.
- **Performance:** RSC by default, client islands only where needed; debounced canvas saves; image optimization via `next/image` + signed Storage URLs.
- **Accessibility:** shadcn/Radix primitives, keyboard nav, focus management, ARIA on canvas controls.
- **Deployment:** Vercel; Supabase migrations in `supabase/migrations`; env configured per environment.
- **Scope discipline:** MVP (Features 1–5) only. V2 (collaboration, multiplayer, share links, plugins) and V3 (AI creative director, monitoring, forecasting) are explicitly out of scope until MVP completion.

---

*Next step: implement in the order — DB migrations & RLS → Supabase clients & auth → integration adapters → AI agents & pipeline → API/actions → UI (dashboard → report → canvas) → export.*
