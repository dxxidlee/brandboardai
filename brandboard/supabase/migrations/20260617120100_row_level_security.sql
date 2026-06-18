-- ============================================================================
-- Brandboard AI — Row Level Security
-- Every table is user-scoped. Access flows from auth.uid():
--   profiles      : id          = auth.uid()
--   projects      : user_id     = auth.uid()
--   boards/assets/audit_results : parent project.user_id = auth.uid()
--   canvas_items  : board -> project.user_id = auth.uid()
--   jobs          : user_id     = auth.uid()
-- The service-role key bypasses RLS for the server-side pipeline.
-- ============================================================================

-- Ownership helpers (SECURITY DEFINER avoids recursive policy evaluation) ---
create or replace function public.is_project_owner(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = p_project_id
      and p.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_board_owner(p_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.boards b
    join public.projects p on p.id = b.project_id
    where b.id = p_board_id
      and p.user_id = (select auth.uid())
  );
$$;

-- Enable RLS ---------------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.projects      enable row level security;
alter table public.boards        enable row level security;
alter table public.assets        enable row level security;
alter table public.audit_results enable row level security;
alter table public.canvas_items  enable row level security;
alter table public.jobs          enable row level security;

-- profiles -----------------------------------------------------------------
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- projects -----------------------------------------------------------------
create policy "Users can view their own projects"
  on public.projects for select
  using ((select auth.uid()) = user_id);

create policy "Users can create their own projects"
  on public.projects for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using ((select auth.uid()) = user_id);

-- boards -------------------------------------------------------------------
create policy "Users can view boards in their projects"
  on public.boards for select
  using (public.is_project_owner(project_id));

create policy "Users can create boards in their projects"
  on public.boards for insert
  with check (public.is_project_owner(project_id));

create policy "Users can update boards in their projects"
  on public.boards for update
  using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

create policy "Users can delete boards in their projects"
  on public.boards for delete
  using (public.is_project_owner(project_id));

-- assets -------------------------------------------------------------------
create policy "Users can view assets in their projects"
  on public.assets for select
  using (public.is_project_owner(project_id));

create policy "Users can create assets in their projects"
  on public.assets for insert
  with check (public.is_project_owner(project_id));

create policy "Users can update assets in their projects"
  on public.assets for update
  using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

create policy "Users can delete assets in their projects"
  on public.assets for delete
  using (public.is_project_owner(project_id));

-- audit_results ------------------------------------------------------------
create policy "Users can view audit results in their projects"
  on public.audit_results for select
  using (public.is_project_owner(project_id));

create policy "Users can create audit results in their projects"
  on public.audit_results for insert
  with check (public.is_project_owner(project_id));

create policy "Users can update audit results in their projects"
  on public.audit_results for update
  using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

create policy "Users can delete audit results in their projects"
  on public.audit_results for delete
  using (public.is_project_owner(project_id));

-- canvas_items -------------------------------------------------------------
create policy "Users can view canvas items on their boards"
  on public.canvas_items for select
  using (public.is_board_owner(board_id));

create policy "Users can create canvas items on their boards"
  on public.canvas_items for insert
  with check (public.is_board_owner(board_id));

create policy "Users can update canvas items on their boards"
  on public.canvas_items for update
  using (public.is_board_owner(board_id))
  with check (public.is_board_owner(board_id));

create policy "Users can delete canvas items on their boards"
  on public.canvas_items for delete
  using (public.is_board_owner(board_id));

-- jobs ---------------------------------------------------------------------
create policy "Users can view their own jobs"
  on public.jobs for select
  using ((select auth.uid()) = user_id);

create policy "Users can create their own jobs"
  on public.jobs for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own jobs"
  on public.jobs for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own jobs"
  on public.jobs for delete
  using ((select auth.uid()) = user_id);
