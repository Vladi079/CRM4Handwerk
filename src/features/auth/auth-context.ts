import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

/** Result of an auth action: `error` is a ready-to-display German message, or null. */
export interface AuthActionResult {
  error: string | null
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  /** True until the initial session has been resolved, to avoid UI flicker. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthActionResult>
  signUp: (email: string, password: string) => Promise<AuthActionResult>
  signOut: () => Promise<void>
}

// Undefined default lets `useAuth` detect usage outside the provider.
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
