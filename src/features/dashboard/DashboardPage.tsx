import { useAuth } from '@/features/auth/use-auth'

/** Placeholder landing for authenticated users. The real KPIs arrive in Phase 8. */
export function DashboardPage() {
  const { user } = useAuth()

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Willkommen</h1>
      <p className="text-muted-foreground">
        Angemeldet als {user?.email}. Das Dashboard folgt in einer späteren
        Phase.
      </p>
    </section>
  )
}
