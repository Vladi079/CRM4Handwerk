# Handwerk CRM

Kunden- und Auftragsverwaltung für kleine deutsche Handwerksbetriebe
(Elektriker, Installateure, Maler). Heute führen viele davon ihre Aufträge in
Excel-Tabellen oder auf Papier — diese Anwendung bildet den kompletten Ablauf
digital ab: **Anfrage → Angebot → Beauftragung → Erledigung → Bezahlung**.

<!-- TODO: Screenshot einfügen, sobald vorhanden (siehe docs/README.md). -->
<!-- ![Handwerk CRM – Kanban-Board](docs/screenshot.png) -->

> **Live-Demo:** _folgt nach dem Deployment_ <!-- TODO: Vercel-URL eintragen -->

Dies ist ein **Portfolio-Projekt**. Der Fokus liegt bewusst auf einem kleinen,
aber fertigen und gut begründbaren Umfang: Barrierefreiheit, Typsicherheit und
Tests sind kein Beiwerk, sondern der Kern.

## Funktionsumfang

- **Authentifizierung** — Registrierung und Login (E-Mail/Passwort), geschützte Routen
- **Dashboard** — vier Kennzahlen (offene Angebote, laufende Aufträge, überfällige
  Zahlungen, Monatsumsatz) und eine Liste überfälliger Aufträge
- **Kunden** — durchsuchbare Liste mit Privat/Firma-Filter, Anlegen/Bearbeiten im
  Dialog, Löschregel (Kunde mit Aufträgen ist nicht löschbar), Detailseite
- **Aufträge** — Kanban-Board **und** Tabellenansicht (umschaltbar) mit Filtern,
  Status-Automat, Detailseite mit Status-Zeitachse, Netto/MwSt./Brutto und Notizen
- **Einstellungen** — Firmendaten, Kleinunternehmer-Regelung (§19 UStG), Standard-MwSt.-Satz

Die gesamte Oberfläche ist **auf Deutsch**; Datumsangaben und Währung werden über
`Intl` lokalisiert (`1.234,56 €`, `dd.MM.yyyy`).

## Tech-Stack

| Bereich      | Wahl                           | Begründung (in einem Satz)                                         |
| ------------ | ------------------------------ | ------------------------------------------------------------------ |
| Build        | Vite                           | Schneller Dev-Server und Build, moderner SPA-Standard.             |
| Framework    | React + TypeScript (`strict`)  | Komponentenbasierte UI mit voller Typsicherheit, kein `any`.       |
| Routing      | React Router                   | Etabliertes clientseitiges Routing.                                |
| Styling      | Tailwind CSS                   | Utility-First: konsistent und ohne verwaiste CSS-Dateien.          |
| Komponenten  | shadcn/ui (Radix)              | Barrierefreie Primitive als eigener Code – kein Black-Box-Lock-in. |
| Backend      | Supabase (Postgres, Auth, RLS) | Datenbank, Auth und Datenisolation ohne eigenen Server.            |
| Server-State | TanStack Query                 | Caching, Ladezustände und optimistische Updates an einem Ort.      |
| Formulare    | react-hook-form + zod          | Performante Formulare mit typsicherer Validierung.                 |
| Unit-Tests   | Vitest + Testing Library       | Schnelle Unit- und Komponententests.                               |
| E2E / a11y   | Playwright (+ axe-core)        | End-to-End-Smoke-Test und automatischer Barrierefreiheits-Check.   |
| Qualität     | ESLint, Prettier, TS strict    | Einheitlicher Stil und statische Fehlererkennung.                  |
| CI           | GitHub Actions                 | Pipeline: Lint → Typecheck → Test → Build.                         |
| Deployment   | Vercel                         | Einfaches SPA-Hosting mit GitHub-Anbindung.                        |

> **Bewusste Abweichungen von der ursprünglichen Spezifikation** (jeweils
> abgestimmt): **React 19** statt 18 und **React Router v7** statt v6 – jeweils
> die aktuelle stabile Version, im v6-kompatiblen Stil verwendet; **Tailwind v4**;
> **ESLint** statt des Vite-Standard-Linters oxlint.

## Lokales Setup

### Voraussetzungen

- **Node.js ≥ 20**
- **Docker Desktop** (für die lokale Supabase-Datenbank)

### Schritte

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Lokale Supabase starten (lädt beim ersten Mal Docker-Images)
npm run db:start

# 3. Migrationen einspielen (Tabellen, RLS-Policies, Trigger)
npm run db:reset

# 4. Dev-Server starten
npm run dev
```

Danach die App unter **http://localhost:5173** öffnen und über den Tab
**Registrieren** ein Konto anlegen. Die lokale Supabase bestätigt E-Mails
automatisch – eine echte Adresse ist nicht nötig.

**Umgebungsvariablen:** Für die lokale Entwicklung ist keine `.env` erforderlich –
die App fällt auf die Standard-Werte der lokalen Supabase zurück. Für ein echtes
(Cloud-)Projekt `.env.example` nach `.env` kopieren und die Werte aus der
Supabase-Konsole eintragen.

## Skripte

| Skript                  | Zweck                                                      |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Dev-Server mit Hot Reload                                  |
| `npm run build`         | Typprüfung + Produktions-Build                             |
| `npm run preview`       | Produktions-Build lokal ansehen                            |
| `npm run typecheck`     | TypeScript ohne Emit prüfen                                |
| `npm run lint`          | ESLint                                                     |
| `npm run format`        | Prettier (schreibend)                                      |
| `npm run test`          | Unit-/Komponententests (Vitest)                            |
| `npm run test:coverage` | Tests mit Abdeckungsbericht                                |
| `npm run test:e2e`      | End-to-End- und a11y-Tests (Playwright)                    |
| `npm run db:start`      | Lokale Supabase starten                                    |
| `npm run db:reset`      | Datenbank zurücksetzen und Migrationen einspielen          |
| `npm run db:types`      | DB-Typen zum Abgleich generieren (`database.generated.ts`) |

## Tests

Die **reine Geschäftslogik** in `src/domain/` ist zu **100 %** abgedeckt
(Status-Automat, Geld/MwSt., Fälligkeit, Auftragsnummer). Dazu kommen
Komponententests für die Formulare und die Kanban-Karte sowie ein
End-to-End- und ein Barrierefreiheits-Smoke-Test.

```bash
npm run test          # Unit + Komponenten
npm run test:coverage # mit Abdeckung
npm run test:e2e      # End-to-End + a11y (Playwright)
```

## Projektstruktur

```
src/
  domain/          reine Geschäftslogik, ohne Framework-Importe, vollständig getestet
  lib/             Supabase-Client, Query-Client, Formatter
  components/ui/   shadcn/ui-Primitive
  components/      geteilte Komponenten (Layout, Formularfelder, Error Boundary)
  features/        feature-orientiert: auth, kunden, auftraege, dashboard, einstellungen
  routes/          Routentabelle
  types/           kuratierte Datenbank-Typen
supabase/migrations/  SQL-Migrationen (Schema, RLS, Trigger, GRANTs)
e2e/                  Playwright-Tests
```

## Architekturentscheidungen

Der Kern des Projekts. Jede Entscheidung ist als _Entscheidung → Begründung →
Trade-off_ formuliert.

### 1. Single-Page-App mit Vite statt Next.js

- **Entscheidung:** Reine Client-SPA mit Vite, kein Next.js.
- **Begründung:** Die App liegt vollständig hinter dem Login. Es gibt keinen
  Bedarf an SEO oder Server-Rendering, dafür aber an einer schnellen, einfachen
  Client-Anwendung.
- **Trade-off:** Kein serverseitiges Rendering und kein integriertes Backend-
  Framework; das Laden der Daten passiert im Client (hier bewusst über TanStack
  Query gelöst).

### 2. Reine Domänenschicht (`src/domain/`)

- **Entscheidung:** Die gesamte Geschäftslogik (Status-Automat, Geld/MwSt.,
  Fälligkeit, Auftragsnummer) liegt als pure TypeScript-Funktionen ohne React-
  oder Supabase-Importe vor und ist zu 100 % getestet.
- **Begründung:** Logik ohne Framework-Ballast ist trivial testbar, wiederverwendbar
  (UI **und** Datenzugriff nutzen dieselben Funktionen) und im Gespräch Zeile für
  Zeile erklärbar. `today` wird stets als Argument übergeben – nie `new Date()`
  im Inneren –, damit Zeitlogik deterministisch testbar bleibt.
- **Trade-off:** Etwas Mehraufwand an der Grenze (Mapping zwischen DB-Datensatz
  und Domänenfunktion) und die Disziplin, keine Logik in Komponenten sickern zu lassen.

### 3. Row Level Security für die Datenisolation

- **Entscheidung:** Der Zugriffsschutz liegt in der Datenbank: jede Tabelle hat
  RLS aktiviert und explizite Policies (direkt über `owner_id` oder abgeleitet
  über die Elternzeile), zusätzlich passende `GRANT`s.
- **Begründung:** Sicherheit gehört an die Datenquelle, nicht in die UI. Selbst
  mit dem öffentlichen anon-Key sieht ein Nutzer nur seine eigenen Zeilen – ein
  klares DSGVO-Argument.
- **Trade-off:** RLS **und** GRANT müssen beide gesetzt sein (RLS filtert Zeilen,
  GRANT erlaubt den Tabellenzugriff überhaupt); Policies wollen gepflegt und
  getestet sein und sind schwerer zu debuggen als App-seitige Prüfungen.

### 4. Geldbeträge als Ganzzahl-Cent

- **Entscheidung:** Sämtliche Geldarithmetik läuft in ganzen Cent; Euro-Werte
  existieren nur an den Rändern (Eingabe, Formatierung).
- **Begründung:** Fließkomma-Euro verliert Cent (`0.1 + 0.2 !== 0.3`). Mit
  Integer-Cent bleibt jede Berechnung exakt – explizit mit Werten wie `19,99` und
  `0.1 + 0.2` getestet.
- **Trade-off:** Umrechnung an den Grenzen nötig; die Datenbank speichert Euro
  als `numeric`, für Berechnungen wird nach Cent konvertiert.

### 5. Tastaturbedienbares Kanban-Board

- **Entscheidung:** Statuswechsel auf dem Board laufen über ein Dropdown-Menü pro
  Karte; Drag-and-drop (natives HTML5) ist nur eine ergänzende Maus-Verbesserung.
- **Begründung:** Barrierefreiheit ist nicht verhandelbar – das Board muss voll
  per Tastatur bedienbar sein. Das Dropdown bietet zudem **nur** die vom Status-
  Automaten erlaubten Übergänge an; ungültige Wechsel sind gar nicht wählbar.
- **Trade-off:** Zwei Interaktionswege müssen gepflegt werden, und natives DnD ist
  einfacher/weniger flüssig als eine spezialisierte Bibliothek (bewusst vermieden,
  um die Abhängigkeitsliste schlank zu halten).

### 6. Server-State mit TanStack Query

- **Entscheidung:** Laden, Caching und Mutationen laufen über TanStack Query in
  Feature-Hooks; Statuswechsel nutzen optimistische Updates mit Rollback.
- **Begründung:** Kein Wildwuchs aus `useEffect`/`useState` für Datenabruf; die
  UI fühlt sich schnell an, bleibt bei Fehlern aber korrekt (Rollback).
- **Trade-off:** Eine zusätzliche Abstraktion mit eigener Lernkurve.

### 7. Kuratierte statt roh generierter Datenbank-Typen

- **Entscheidung:** `src/types/database.ts` wird gepflegt und verengt die per
  CHECK-Constraint definierten Spalten (`status`, `typ`, `anrede`) zu String-
  Unions; die Generierung dient nur dem Abgleich (`database.generated.ts`).
- **Begründung:** Der Supabase-Generator liefert für CHECK-Spalten nur `string`.
  Die engeren Typen machen die App sicherer, und Typ-Ebenen-Prüfungen fangen ein
  Auseinanderdriften von Schema und Domäne automatisch beim Kompilieren ab.
- **Trade-off:** Manuelle Pflege der Typdatei statt reiner Generierung.

### 8. shadcn/ui statt Komponenten-Bibliothek

- **Entscheidung:** UI-Primitive per shadcn/ui in den eigenen Code kopiert
  (auf Radix-Basis), statt eine fertige Bibliothek einzubinden.
- **Begründung:** Voller Zugriff auf den Komponenten-Code, keine Versions- oder
  Design-Lock-ins, und die Barrierefreiheit von Radix „for free".
- **Trade-off:** Die Komponenten liegen im Projekt und werden selbst gewartet.

## Lizenz

Portfolio-Projekt – Verwendung des Codes zu Lern- und Bewerbungszwecken.
