import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/kunden', label: 'Kunden', end: false },
  { to: '/auftraege', label: 'Aufträge', end: false },
  { to: '/einstellungen', label: 'Einstellungen', end: false },
]

/** Shell for authenticated pages: a header with navigation, sign-out, content. */
export function AppLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold tracking-tight">Handwerk CRM</span>
            <nav
              className="flex items-center gap-1"
              aria-label="Hauptnavigation"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
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
