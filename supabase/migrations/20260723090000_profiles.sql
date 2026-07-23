-- Profiles extend Supabase's built-in auth.users with company-level settings.
-- One profile row per authenticated user, sharing the same id.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  firma_name text,
  -- §19 UStG (Kleinunternehmerregelung): when true, no VAT is charged.
  kleinunternehmer boolean not null default false,
  standard_mwst_satz numeric not null default 19,
  created_at timestamptz not null default now()
);

-- Row Level Security: enabled explicitly. With RLS on and no policy, every row
-- is denied by default; each policy below re-opens exactly one operation.
alter table public.profiles enable row level security;

-- RLS decides *which rows*; a GRANT is still needed for table access at all.
-- Logged-in users may read and change their own profile (no delete).
grant select, insert, update on public.profiles to authenticated;

-- A user may only ever read and write their own profile row. auth.uid() returns
-- the id of the currently authenticated user; wrapping it in a subselect lets
-- Postgres evaluate it once per query instead of once per row.
create policy "Profil lesen (eigenes)" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "Profil anlegen (eigenes)" on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Profil aendern (eigenes)" on public.profiles
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Deliberately no DELETE policy: a profile disappears only when its auth.users
-- row is deleted (via the cascade above), never on its own.

-- Automatically create the matching profile row when a new user signs up.
-- security definer lets the trigger insert into public.profiles regardless of
-- the caller; the empty search_path prevents search-path hijacking.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
