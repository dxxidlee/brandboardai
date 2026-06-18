-- ============================================================================
-- Brandboard AI — Storage buckets & policies
-- Buckets (ARCHITECTURE.md section 2):
--   assets   (private)  downloaded/processed images, logos    -> signed URLs
--   exports  (private)  generated PDFs/PNGs                    -> signed URLs
--   avatars  (public)   profile images
-- Convention: object paths are prefixed with the owner's user id:
--   "{auth.uid()}/<rest-of-path>"  -> first path segment = owner.
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('assets',  'assets',  false),
  ('exports', 'exports', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- assets (private) ---------------------------------------------------------
create policy "Users can read their own assets"
  on storage.objects for select
  using (
    bucket_id = 'assets'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own assets"
  on storage.objects for insert
  with check (
    bucket_id = 'assets'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own assets"
  on storage.objects for update
  using (
    bucket_id = 'assets'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own assets"
  on storage.objects for delete
  using (
    bucket_id = 'assets'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- exports (private) --------------------------------------------------------
create policy "Users can read their own exports"
  on storage.objects for select
  using (
    bucket_id = 'exports'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can create their own exports"
  on storage.objects for insert
  with check (
    bucket_id = 'exports'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own exports"
  on storage.objects for delete
  using (
    bucket_id = 'exports'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

-- avatars (public read, owner write) ---------------------------------------
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
