import { useContext } from 'react'
import { AuthContext } from './auth-context'

/** Access the auth state. Throws if used outside <AuthProvider>. */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error(
      'useAuth muss innerhalb von <AuthProvider> verwendet werden.',
    )
  }
  return context
}
