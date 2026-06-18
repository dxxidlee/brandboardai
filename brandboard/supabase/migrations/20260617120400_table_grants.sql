-- ============================================================================
-- Brandboard AI — Table grants for Supabase API roles
-- RLS policies alone are not enough: the authenticated role must have table
-- privileges. Without these grants, inserts fail with:
--   permission denied for table projects (SQLSTATE 42501)
-- ============================================================================

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant all on all sequences in schema public to postgres, service_role;
grant usage, select on all sequences in schema public to authenticated;

grant execute on all functions in schema public to postgres, service_role;
grant execute on all functions in schema public to authenticated, anon;

alter default privileges for role postgres in schema public
  grant all on tables to postgres, service_role;

alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges for role postgres in schema public
  grant select on tables to anon;

alter default privileges for role postgres in schema public
  grant all on sequences to postgres, service_role;

alter default privileges for role postgres in schema public
  grant usage, select on sequences to authenticated;

alter default privileges for role postgres in schema public
  grant execute on functions to postgres, service_role;

alter default privileges for role postgres in schema public
  grant execute on functions to authenticated, anon;
