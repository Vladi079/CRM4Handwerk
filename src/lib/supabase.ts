import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Default to the standard local Supabase stack so the app runs with zero config
// (`supabase start` + `npm run dev`). These local defaults are public demo values,
// not secrets. Point at a real project by setting the vars in a `.env` file
// (see `.env.example`).
const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321'
const LOCAL_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? LOCAL_SUPABASE_URL
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? LOCAL_SUPABASE_ANON_KEY

if (!import.meta.env.VITE_SUPABASE_URL) {
  // Not an error — just a hint that we're talking to the local stack.
  console.warn(
    'VITE_SUPABASE_URL ist nicht gesetzt — verwende die lokale Supabase ' +
      '(http://127.0.0.1:54321). Für ein Cloud-Projekt .env anlegen (siehe .env.example).',
  )
}

// Typed with <Database> so every query is checked against the schema. The anon
// key is safe to ship to the browser: Row Level Security is what protects data.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
