/// <reference types="vite/client" />

// Strongly type the environment variables the app relies on, so a missing or
// misspelled key is a compile-time error rather than an undefined at runtime.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
