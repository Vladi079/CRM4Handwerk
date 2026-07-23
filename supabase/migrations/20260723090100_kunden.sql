-- Customers. Each row is owned directly by the user who created it.

create table public.kunden (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  -- 'privat' (private person) or 'firma' (company). CHECK instead of a Postgres
  -- enum: easier to read in the schema and to extend without an ALTER TYPE.
  typ text not null check (typ in ('privat', 'firma')),
  -- Required when typ = 'firma'. That conditional rule lives in the domain layer,
  -- because it depends on another column; the column itself stays nullable.
  firma_name text,
  anrede text check (anrede in ('Herr', 'Frau', 'Divers')),
  vorname text not null,
  nachname text not null,
  email text,
  telefon text,
  strasse text not null,
  plz text not null,
  ort text not null,
  notizen text,
  created_at timestamptz not null default now()
);

-- Index the foreign key we filter by in every policy and list query.
create index kunden_owner_id_idx on public.kunden (owner_id);

alter table public.kunden enable row level security;

create policy "Kunden lesen (eigene)" on public.kunden
  for select using ((select auth.uid()) = owner_id);

create policy "Kunden anlegen (eigene)" on public.kunden
  for insert with check ((select auth.uid()) = owner_id);

create policy "Kunden aendern (eigene)" on public.kunden
  for update using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Kunden loeschen (eigene)" on public.kunden
  for delete using ((select auth.uid()) = owner_id);
