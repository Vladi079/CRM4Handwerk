-- Sites / properties where work happens. A customer may own several.
-- Objekte have NO owner_id: ownership is derived from the parent Kunde, so
-- the RLS policies below check the parent instead of a local column.

create table public.objekte (
  id uuid primary key default gen_random_uuid(),
  kunde_id uuid not null references public.kunden (id) on delete cascade,
  bezeichnung text not null,
  strasse text not null,
  plz text not null,
  ort text not null,
  notizen text,
  created_at timestamptz not null default now()
);

create index objekte_kunde_id_idx on public.objekte (kunde_id);

alter table public.objekte enable row level security;

-- "May I touch this Objekt?" == "Do I own its Kunde?". The EXISTS subquery is
-- itself run under RLS-free privileges of the policy, but only returns true when
-- the parent kunden row belongs to the current user.
create policy "Objekte lesen (ueber Kunde)" on public.objekte
  for select using (
    exists (
      select 1 from public.kunden k
      where k.id = objekte.kunde_id and k.owner_id = (select auth.uid())
    )
  );

create policy "Objekte anlegen (ueber Kunde)" on public.objekte
  for insert with check (
    exists (
      select 1 from public.kunden k
      where k.id = objekte.kunde_id and k.owner_id = (select auth.uid())
    )
  );

create policy "Objekte aendern (ueber Kunde)" on public.objekte
  for update using (
    exists (
      select 1 from public.kunden k
      where k.id = objekte.kunde_id and k.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.kunden k
      where k.id = objekte.kunde_id and k.owner_id = (select auth.uid())
    )
  );

create policy "Objekte loeschen (ueber Kunde)" on public.objekte
  for delete using (
    exists (
      select 1 from public.kunden k
      where k.id = objekte.kunde_id and k.owner_id = (select auth.uid())
    )
  );
