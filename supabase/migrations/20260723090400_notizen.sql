-- Notes thread on a job. Like Objekte, ownership is derived from the parent
-- (here the Auftrag), so RLS checks the parent row.

create table public.notizen (
  id uuid primary key default gen_random_uuid(),
  auftrag_id uuid not null references public.auftraege (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index notizen_auftrag_id_idx on public.notizen (auftrag_id);

alter table public.notizen enable row level security;

create policy "Notizen lesen (ueber Auftrag)" on public.notizen
  for select using (
    exists (
      select 1 from public.auftraege a
      where a.id = notizen.auftrag_id and a.owner_id = (select auth.uid())
    )
  );

create policy "Notizen anlegen (ueber Auftrag)" on public.notizen
  for insert with check (
    exists (
      select 1 from public.auftraege a
      where a.id = notizen.auftrag_id and a.owner_id = (select auth.uid())
    )
  );

create policy "Notizen aendern (ueber Auftrag)" on public.notizen
  for update using (
    exists (
      select 1 from public.auftraege a
      where a.id = notizen.auftrag_id and a.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.auftraege a
      where a.id = notizen.auftrag_id and a.owner_id = (select auth.uid())
    )
  );

create policy "Notizen loeschen (ueber Auftrag)" on public.notizen
  for delete using (
    exists (
      select 1 from public.auftraege a
      where a.id = notizen.auftrag_id and a.owner_id = (select auth.uid())
    )
  );
