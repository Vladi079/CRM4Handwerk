-- Jobs. Owned directly by the user (owner_id), like Kunden.

create table public.auftraege (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  -- on delete restrict enforces the business rule "a Kunde with at least one
  -- Auftrag cannot be hard-deleted" at the database level, not just in the app.
  kunde_id uuid not null references public.kunden (id) on delete restrict,
  -- Optional site. If that site is deleted, keep the job but forget the link.
  objekt_id uuid references public.objekte (id) on delete set null,
  -- Format YYYY-0001, sequential per user. The value is computed in the pure
  -- domain layer (unit-tested); the DB only guarantees it is unique per owner.
  auftragsnummer text not null,
  titel text not null,
  beschreibung text,
  status text not null default 'angebot'
    check (
      status in (
        'angebot', 'beauftragt', 'erledigt', 'bezahlt', 'abgelehnt', 'storniert'
      )
    ),
  betrag_netto numeric not null default 0 check (betrag_netto >= 0),
  -- Standard German VAT rates: 19 %, reduced 7 %, or 0 % (Kleinunternehmer).
  mwst_satz numeric not null default 19 check (mwst_satz in (0, 7, 19)),
  angebot_datum date,
  beauftragt_datum date,
  erledigt_datum date,
  bezahlt_datum date,
  created_at timestamptz not null default now(),
  -- Two jobs of the same user can never share an Auftragsnummer.
  unique (owner_id, auftragsnummer)
);

create index auftraege_owner_id_idx on public.auftraege (owner_id);
create index auftraege_kunde_id_idx on public.auftraege (kunde_id);

alter table public.auftraege enable row level security;

-- RLS decides *which rows*; the GRANT is still needed for table access at all.
grant select, insert, update, delete on public.auftraege to authenticated;

create policy "Auftraege lesen (eigene)" on public.auftraege
  for select using ((select auth.uid()) = owner_id);

create policy "Auftraege anlegen (eigene)" on public.auftraege
  for insert with check ((select auth.uid()) = owner_id);

create policy "Auftraege aendern (eigene)" on public.auftraege
  for update using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Auftraege loeschen (eigene)" on public.auftraege
  for delete using ((select auth.uid()) = owner_id);
