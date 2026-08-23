import { Suspense, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '@/features/auth/use-auth'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/kunden', label: 'Kunden', end: false },
  { to: '/auftraege', label: 'Aufträge', end: false },
  { to: '/einstellungen', label: 'Einstellungen', end: false },
]

/**
 * Shell for authenticated pages: a header with navigation, sign-out, content.
 * Below `lg` (phones and tablets) the navigation collapses into a burger menu.
 */
export function AppLayout() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-svh">
      <a
        href="#main-content"
        className="bg-background focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:px-4 focus:py-2 focus:ring-2"
      >
        Zum Inhalt springen
      </a>
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3 lg:gap-6">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Menü öffnen"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>CRM4Handwerk</SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col gap-1 px-4"
                  aria-label="Hauptnavigation"
                >
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) => navLinkClass(isActive, true)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
                <div className="mt-auto space-y-3 border-t p-4">
                  {user?.email && (
                    <p className="text-muted-foreground truncate text-sm">
                      {user.email}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => void signOut()}
                  >
                    Abmelden
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <span className="font-semibold tracking-tight">CRM4Handwerk</span>

            <nav
              className="hidden items-center gap-1 lg:flex"
              aria-label="Hauptnavigation"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => navLinkClass(isActive, false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* On small screens these live inside the burger menu instead. */}
          <div className="hidden items-center gap-3 lg:flex">
            {user?.email && (
              <span className="text-muted-foreground text-sm">
                {user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl p-4">
        <Suspense
          fallback={
            <div role="status" aria-live="polite">
              {/* Keeps exactly one <h1> in the document during route loads. */}
              <h1 className="sr-only">Seite wird geladen</h1>
              <p className="text-muted-foreground text-sm">Wird geladen …</p>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

function navLinkClass(isActive: boolean, mobile: boolean) {
  return cn(
    'rounded-md transition-colors',
    mobile ? 'px-3 py-2 text-base' : 'px-3 py-1.5 text-sm',
    isActive
      ? 'bg-muted text-foreground font-medium'
      : 'text-muted-foreground hover:text-foreground',
  )
}
