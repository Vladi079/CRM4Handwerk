import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fail loudly at startup if the environment is not configured, instead of
// producing confusing 401s later. See `.env.example` for how to fill these in.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase-Umgebungsvariablen fehlen. Bitte VITE_SUPABASE_URL und ' +
      'VITE_SUPABASE_ANON_KEY in einer .env-Datei setzen (siehe .env.example).',
  )
}

// Typed with <Database> so every query is checked against the schema. The anon
// key is safe to ship to the browser: Row Level Security is what protects data.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
