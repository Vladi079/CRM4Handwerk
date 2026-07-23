import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './use-auth'

/**
 * Gate for authenticated routes. While the initial session resolves we show a
 * neutral placeholder (no flicker); after that, unauthenticated users are sent
 * to /login and authenticated ones see the nested routes via <Outlet>.
 */
export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex min-h-svh items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <span className="text-muted-foreground text-sm">Wird geladen …</span>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
