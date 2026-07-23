import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/use-auth'
import { Button } from '@/components/ui/button'

/** Shell for authenticated pages: a header with sign-out and the routed content. */
export function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <span className="font-semibold tracking-tight">Handwerk CRM</span>
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="text-muted-foreground hidden text-sm sm:inline">
                {user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  )
}
