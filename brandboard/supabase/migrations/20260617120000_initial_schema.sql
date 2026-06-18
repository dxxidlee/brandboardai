-- ============================================================================
-- Brandboard AI — Initial schema
-- Tables: profiles, projects, boards, assets, audit_results, canvas_items, jobs
-- Derived from PRD.md (Database Schema) and ARCHITECTURE.md (section 2).
-- This migration only creates structure. RLS, storage and the profile
-- bootstrap trigger live in later migrations.
-- ============================================================================

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()

-- Enums --------------------------------------------------------------------
create type public.project_input_type as enum ('company', 'url', 'concept', 'industry');
create type public.project_status     as enum ('draft', 'generating', 'ready', 'failed');
create type public.asset_type         as enum ('image', 'color', 'font', 'logo', 'note', 'reference');
create type public.asset_source       as enum ('brandfetch', 'serpapi', 'apify', 'unsplash', 'pexels', 'ai', 'user');
create type public.canvas_node_type   as enum ('image', 'color', 'text', 'note', 'section');
create type public.job_kind           as enum ('audit', 'moodboard');
create type public.job_status         as enum ('queued', 'running', 'succeeded', 'failed');

-- Shared trigger function: keep updated_at fresh ---------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles -----------------------------------------------------------------
-- One row per authenticated user. Mirrors auth.users (PRD `users`).
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text unique not null,
  name        text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Public profile per authenticated user, 1:1 with auth.users.';

-- projects -----------------------------------------------------------------
create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  title        text not null,
  description  text,
  input_prompt text,
  input_type   public.project_input_type not null default 'company',
  status       public.project_status     not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.projects is 'A brand research workspace owned by a user.';

create index projects_user_id_updated_at_idx
  on public.projects (user_id, updated_at desc);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- boards -------------------------------------------------------------------
create table public.boards (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  name         text not null default 'Untitled board',
  canvas_state jsonb not null default '{}'::jsonb,  -- viewport, zoom, sections
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.boards is 'An infinite canvas belonging to a project.';

create index boards_project_id_idx on public.boards (project_id);

create trigger boards_set_updated_at
  before update on public.boards
  for each row execute function public.handle_updated_at();

-- assets -------------------------------------------------------------------
create table public.assets (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  type          public.asset_type not null,
  title         text,
  url           text,
  source        public.asset_source not null default 'user',
  metadata_json jsonb not null default '{}'::jsonb, -- hex, tags, attribution, dims
  created_at    timestamptz not null default now()
);

comment on table public.assets is 'Research artifacts (images, colors, fonts, references) for a project.';

create index assets_project_id_type_idx on public.assets (project_id, type);

-- audit_results ------------------------------------------------------------
create table public.audit_results (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null unique references public.projects (id) on delete cascade,
  summary       text,
  mission       text,
  positioning   text,
  tone          text,                                  -- brand personality
  color_palette jsonb not null default '[]'::jsonb,    -- [{hex,name,role}]
  typography    jsonb not null default '[]'::jsonb,    -- [{family,role,source}]
  competitors   jsonb not null default '[]'::jsonb,    -- [{name,note,url}]
  insights      jsonb not null default '[]'::jsonb,    -- opportunities + recs
  created_at    timestamptz not null default now()
);

comment on table public.audit_results is 'One strategic brand report per project.';

-- canvas_items -------------------------------------------------------------
create table public.canvas_items (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references public.boards (id) on delete cascade,
  asset_id   uuid references public.assets (id) on delete set null,
  node_type  public.canvas_node_type not null default 'image',
  x          double precision not null default 0,
  y          double precision not null default 0,
  width      double precision not null default 200,
  height     double precision not null default 200,
  rotation   double precision not null default 0,
  z_index    integer not null default 0,
  notes      text,
  data       jsonb not null default '{}'::jsonb,       -- node-specific props
  created_at timestamptz not null default now()
);

comment on table public.canvas_items is 'Placement of an asset/node on a board canvas.';

create index canvas_items_board_id_idx on public.canvas_items (board_id);
create index canvas_items_asset_id_idx on public.canvas_items (asset_id);

-- jobs ---------------------------------------------------------------------
-- Tracks async AI generation runs (polling + Apify webhooks).
create table public.jobs (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  kind            public.job_kind   not null,
  status          public.job_status not null default 'queued',
  progress        integer not null default 0 check (progress between 0 and 100),
  step            text,
  error           text,
  external_run_id text,                                 -- Apify/3rd-party run id
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.jobs is 'Async generation job tracking for the AI pipeline.';

create index jobs_project_id_status_idx on public.jobs (project_id, status);
create index jobs_user_id_idx on public.jobs (user_id);

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function public.handle_updated_at();
