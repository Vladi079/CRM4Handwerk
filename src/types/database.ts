/**
 * Curated typed contract for the Supabase Postgres schema.
 *
 * Supabase's generator emits `string` for CHECK-constrained columns (typ,
 * anrede, status) and no convenience helpers, so we maintain this file by hand
 * to narrow those columns to unions and to export Tables<>/TablesInsert<> etc.
 *
 * To verify it still matches the database, run `npm run db:types` — it writes
 * the raw generated types to `database.generated.ts` (git-ignored) for you to
 * diff against this file. The compile-time guards in the domain tests catch any
 * union drift automatically.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          firma_name: string | null
          kleinunternehmer: boolean
          standard_mwst_satz: number
          created_at: string
        }
        Insert: {
          id: string
          firma_name?: string | null
          kleinunternehmer?: boolean
          standard_mwst_satz?: number
          created_at?: string
        }
        Update: {
          id?: string
          firma_name?: string | null
          kleinunternehmer?: boolean
          standard_mwst_satz?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      kunden: {
        Row: {
          id: string
          owner_id: string
          typ: KundeTyp
          firma_name: string | null
          anrede: Anrede | null
          vorname: string
          nachname: string
          email: string | null
          telefon: string | null
          strasse: string
          plz: string
          ort: string
          notizen: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          typ: KundeTyp
          firma_name?: string | null
          anrede?: Anrede | null
          vorname: string
          nachname: string
          email?: string | null
          telefon?: string | null
          strasse: string
          plz: string
          ort: string
          notizen?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          typ?: KundeTyp
          firma_name?: string | null
          anrede?: Anrede | null
          vorname?: string
          nachname?: string
          email?: string | null
          telefon?: string | null
          strasse?: string
          plz?: string
          ort?: string
          notizen?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kunden_owner_id_fkey'
            columns: ['owner_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      objekte: {
        Row: {
          id: string
          kunde_id: string
          bezeichnung: string
          strasse: string
          plz: string
          ort: string
          notizen: string | null
          created_at: string
        }
        Insert: {
          id?: string
          kunde_id: string
          bezeichnung: string
          strasse: string
          plz: string
          ort: string
          notizen?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          kunde_id?: string
          bezeichnung?: string
          strasse?: string
          plz?: string
          ort?: string
          notizen?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'objekte_kunde_id_fkey'
            columns: ['kunde_id']
            referencedRelation: 'kunden'
            referencedColumns: ['id']
          },
        ]
      }
      auftraege: {
        Row: {
          id: string
          owner_id: string
          kunde_id: string
          objekt_id: string | null
          auftragsnummer: string
          titel: string
          beschreibung: string | null
          status: AuftragStatus
          betrag_netto: number
          mwst_satz: number
          angebot_datum: string | null
          beauftragt_datum: string | null
          erledigt_datum: string | null
          bezahlt_datum: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          kunde_id: string
          objekt_id?: string | null
          auftragsnummer: string
          titel: string
          beschreibung?: string | null
          status?: AuftragStatus
          betrag_netto?: number
          mwst_satz?: number
          angebot_datum?: string | null
          beauftragt_datum?: string | null
          erledigt_datum?: string | null
          bezahlt_datum?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          kunde_id?: string
          objekt_id?: string | null
          auftragsnummer?: string
          titel?: string
          beschreibung?: string | null
          status?: AuftragStatus
          betrag_netto?: number
          mwst_satz?: number
          angebot_datum?: string | null
          beauftragt_datum?: string | null
          erledigt_datum?: string | null
          bezahlt_datum?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'auftraege_owner_id_fkey'
            columns: ['owner_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'auftraege_kunde_id_fkey'
            columns: ['kunde_id']
            referencedRelation: 'kunden'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'auftraege_objekt_id_fkey'
            columns: ['objekt_id']
            referencedRelation: 'objekte'
            referencedColumns: ['id']
          },
        ]
      }
      notizen: {
        Row: {
          id: string
          auftrag_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          auftrag_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          auftrag_id?: string
          text?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notizen_auftrag_id_fkey'
            columns: ['auftrag_id']
            referencedRelation: 'auftraege'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

/**
 * The string unions below are expressed as CHECK constraints in the database
 * (not Postgres enums), so we restate them here to keep the app strongly typed.
 * The domain layer (Phase 4) is the single source of truth for these values.
 */
export type KundeTyp = 'privat' | 'firma'
export type Anrede = 'Herr' | 'Frau' | 'Divers'
export type AuftragStatus =
  'angebot' | 'beauftragt' | 'erledigt' | 'bezahlt' | 'abgelehnt' | 'storniert'

// Convenience helpers, mirroring the ones Supabase's generator emits.
type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
