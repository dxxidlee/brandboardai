-- ============================================================================
-- Brandboard AI — Seed data (optional, for local development)
-- Mirrors the mocked frontend data so a freshly migrated DB shows real content.
--
-- Because every row is owned by a user (FK -> profiles -> auth.users), this
-- seed attaches to the FIRST existing auth user. If no user exists yet it
-- prints a notice and does nothing — create an account, then re-run:
--   psql "$DATABASE_URL" -f supabase/seed.sql
-- The seed is idempotent: it clears any prior seeded projects for that user.
-- ============================================================================

do $$
declare
  v_user      uuid;
  v_airbnb    uuid;
  v_board     uuid;
  v_img_asset uuid;
begin
  select id into v_user from auth.users order by created_at asc limit 1;

  if v_user is null then
    raise notice 'Brandboard seed skipped: no auth.users row found. Create a user first.';
    return;
  end if;

  -- Ensure a profile exists for this user.
  insert into public.profiles (id, email, name)
  select v_user, u.email, coalesce(u.raw_user_meta_data ->> 'name', 'David Lee')
  from auth.users u where u.id = v_user
  on conflict (id) do nothing;

  -- Make the seed idempotent: remove previously seeded demo projects.
  delete from public.projects
  where user_id = v_user
    and title in ('Airbnb', 'Sweetgreen', 'Japanese Luxury Skincare');

  -- ---- Project: Airbnb (audit) -------------------------------------------
  insert into public.projects (user_id, title, description, input_prompt, input_type, status)
  values (v_user, 'Airbnb', 'Full brand audit — travel & hospitality', 'Audit Airbnb', 'company', 'ready')
  returning id into v_airbnb;

  insert into public.audit_results
    (project_id, summary, mission, positioning, tone, color_palette, typography, competitors, insights)
  values (
    v_airbnb,
    'Airbnb is a global travel marketplace connecting hosts and guests through unique stays and experiences, centered on belonging and human warmth.',
    'Create a world where anyone can belong anywhere.',
    'A community-driven alternative to traditional hospitality, trading uniformity for character and connection.',
    'Warm, welcoming, adventurous, human, inclusive',
    '[{"hex":"#FF5A5F","name":"Rausch","role":"Primary"},{"hex":"#FF385C","name":"Beri","role":"Accent"},{"hex":"#484848","name":"Hof","role":"Text"}]'::jsonb,
    '[{"family":"Cereal","role":"Display","source":"Custom typeface"},{"family":"Cereal","role":"Body","source":"Custom typeface"}]'::jsonb,
    '[{"name":"Booking.com","note":"Breadth and price-led convenience"},{"name":"Vrbo","note":"Whole-home family vacations"},{"name":"Marriott","note":"Trusted premium hospitality"}]'::jsonb,
    '[{"tag":"Opportunity","title":"Lean into experiences","body":"Experiences differentiate Airbnb from pure-play booking sites."},{"tag":"Strength","title":"Iconic, ownable color","body":"The Rausch coral is instantly recognizable."}]'::jsonb
  );

  insert into public.assets (project_id, type, title, url, source, metadata_json)
  values
    (v_airbnb, 'logo',  'Airbnb logo',  'https://images.unsplash.com/photo-1501785888041-af3ef285b470', 'brandfetch', '{}'::jsonb),
    (v_airbnb, 'color', 'Rausch',       null, 'brandfetch', '{"hex":"#FF5A5F"}'::jsonb),
    (v_airbnb, 'image', 'Mountain retreat', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', 'unsplash', '{}'::jsonb)
  returning id into v_img_asset;

  insert into public.boards (project_id, name, canvas_state)
  values (v_airbnb, 'Moodboard v1', '{"zoom":1,"viewport":{"x":0,"y":0}}'::jsonb)
  returning id into v_board;

  insert into public.canvas_items (board_id, asset_id, node_type, x, y, width, height, rotation, z_index, notes)
  values
    (v_board, v_img_asset, 'image', 90, 100, 220, 150, -2, 1, null),
    (v_board, null,        'note',  340, 80, 230, 160, -1, 2, 'Lean into warm, tactile materials and authentic photography.');

  -- ---- Project: Japanese Luxury Skincare (moodboard) ---------------------
  insert into public.projects (user_id, title, description, input_prompt, input_type, status)
  values (
    v_user,
    'Japanese Luxury Skincare',
    'Moodboard — minimalist wellness concept',
    'Japanese-inspired luxury skincare brand',
    'concept',
    'ready'
  );

  raise notice 'Brandboard seed complete for user %', v_user;
end $$;
