import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthContext, type AuthActionResult } from './auth-context'

/** Translate the handful of Supabase auth errors we expect into German. */
function toGermanError(error: AuthError): string {
  // A retryable fetch error means we couldn't reach the backend at all
  // (status 0 / network failure) — a different problem than wrong credentials.
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
    return 'Keine Verbindung zur Datenbank. Läuft die lokale Supabase (npm run db:start)?'
  }

  const map: Record<string, string> = {
    'Invalid login credentials': 'E-Mail oder Passwort ist falsch.',
    'User already registered': 'Diese E-Mail ist bereits registriert.',
    'Email not confirmed': 'Bitte bestätige zuerst deine E-Mail-Adresse.',
  }
  return (
    map[error.message] ??
    'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.'
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Resolve the current session once on mount...
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // ...then keep it in sync with sign-in / sign-out events.
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn: async (
        email: string,
        password: string,
      ): Promise<AuthActionResult> => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        return { error: error ? toGermanError(error) : null }
      },
      signUp: async (
        email: string,
        password: string,
      ): Promise<AuthActionResult> => {
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error ? toGermanError(error) : null }
      },
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
