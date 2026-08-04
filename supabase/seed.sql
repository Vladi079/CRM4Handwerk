-- Seed for the public "Als Gast testen" (guest) login.
--
-- Creates a demo auth user (stable id) with sample customers and jobs across
-- all the interesting states, so the Kanban and dashboard look alive.
--
-- Runs automatically on `supabase db reset` (local). To enable the guest login
-- on the live site, apply this file once to the cloud database (SQL Editor).

-- ---------------------------------------------------------------------------
-- Demo auth user (idempotent). Only `id` is strictly required; we also set the
-- fields GoTrue needs for email/password sign-in and mark the email confirmed.
-- ---------------------------------------------------------------------------
-- The token columns must be '' (not NULL) or GoTrue fails login with
-- "Database error querying schema".
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change,
  phone_change_token,
  reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'demo@crm4handwerk.de',
  crypt('demo1234', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  ''
where
  not exists (
    select 1 from auth.users where id = '11111111-1111-1111-1111-111111111111'
  );

-- Email identity, required for password sign-in.
insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
select
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo@crm4handwerk.de"}'::jsonb,
  'email',
  now(),
  now()
where
  not exists (
    select 1 from auth.identities
    where user_id = '11111111-1111-1111-1111-111111111111'
      and provider = 'email'
  );

-- The handle_new_user trigger already created the profile; give it demo data.
update public.profiles
set firma_name = 'Demo Handwerk',
    kleinunternehmer = false,
    standard_mwst_satz = 19
where id = '11111111-1111-1111-1111-111111111111';

-- ---------------------------------------------------------------------------
-- Sample data (idempotent: clear the demo user's rows first). auftraege must go
-- before kunden because of the ON DELETE RESTRICT on auftraege.kunde_id.
-- ---------------------------------------------------------------------------
delete from public.auftraege
where owner_id = '11111111-1111-1111-1111-111111111111';
delete from public.kunden
where owner_id = '11111111-1111-1111-1111-111111111111';

insert into public.kunden (
  id, owner_id, typ, anrede, vorname, nachname, firma_name,
  email, telefon, strasse, plz, ort, notizen
) values
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'privat', 'Frau', 'Anna', 'Bauer', null,
    'anna.bauer@example.de', '030 1234567', 'Hauptstraße 12', '10115', 'Berlin', null
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'firma', null, 'Thomas', 'Müller', 'Müller Bau GmbH',
    'info@mueller-bau.de', '089 9876543', 'Industrieweg 5', '80331', 'München', 'Stammkunde'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'privat', 'Herr', 'Peter', 'Schmidt', null,
    null, null, 'Gartenweg 8', '50667', 'Köln', null
  );

-- Jobs across all interesting states. Dates are relative to today so the demo
-- always shows a current-month revenue and an overdue payment.
insert into public.auftraege (
  owner_id, kunde_id, auftragsnummer, titel, beschreibung, status,
  betrag_netto, mwst_satz,
  angebot_datum, beauftragt_datum, erledigt_datum, bezahlt_datum
) values
  -- Open quote
  (
    '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
    '2026-0001', 'Bad sanieren', 'Komplettsanierung Badezimmer, ca. 8 m².', 'angebot',
    4500, 19, current_date, null, null, null
  ),
  -- Running (commissioned)
  (
    '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
    '2026-0002', 'Elektroinstallation Neubau', 'Komplette Elektrik für ein Einfamilienhaus.', 'beauftragt',
    12000, 19, current_date - 20, current_date - 14, null, null
  ),
  -- Completed and OVERDUE (done 25 days ago -> due 11 days ago)
  (
    '11111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333',
    '2026-0003', 'Heizung warten', 'Jährliche Wartung der Gasheizung.', 'erledigt',
    250, 19, current_date - 40, current_date - 30, current_date - 25, null
  ),
  -- Paid this month (counts towards current-month revenue)
  (
    '11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
    '2026-0004', 'Malerarbeiten Wohnzimmer', 'Wände streichen, zwei Anstriche.', 'bezahlt',
    1200, 19, current_date - 30, current_date - 25, current_date - 15, current_date - 3
  ),
  -- Rejected quote
  (
    '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222',
    '2026-0005', 'Fassade streichen', null, 'abgelehnt',
    8000, 19, current_date - 10, null, null, null
  );
