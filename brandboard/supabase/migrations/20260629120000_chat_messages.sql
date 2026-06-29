-- ============================================================================
-- Brandboard AI — chat_messages
-- Persists the follow-up conversation between a user and the AI strategist for
-- a given project. Access is scoped to the owning user via project ownership.
-- ============================================================================

-- chat_messages ------------------------------------------------------------
create table public.chat_messages (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  metadata_json jsonb not null default '{}'::jsonb,  -- model, tokens, sources
  created_at    timestamptz not null default now()
);

comment on table public.chat_messages is
  'Follow-up chat turns between a user and the AI strategist for a project.';

create index chat_messages_project_id_created_at_idx
  on public.chat_messages (project_id, created_at);

-- Row Level Security -------------------------------------------------------
alter table public.chat_messages enable row level security;

create policy "Users can view chat messages in their projects"
  on public.chat_messages for select
  using (public.is_project_owner(project_id));

create policy "Users can create chat messages in their projects"
  on public.chat_messages for insert
  with check (public.is_project_owner(project_id));

create policy "Users can update chat messages in their projects"
  on public.chat_messages for update
  using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

create policy "Users can delete chat messages in their projects"
  on public.chat_messages for delete
  using (public.is_project_owner(project_id));

-- Table grants (explicit; "grant on all tables" earlier doesn't cover new tables)
grant all on public.chat_messages to postgres, service_role;
grant select, insert, update, delete on public.chat_messages to authenticated;
grant select on public.chat_messages to anon;
