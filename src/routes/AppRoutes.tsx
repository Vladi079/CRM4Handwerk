import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '@/features/auth/AuthPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'

// Feature pages are code-split so the initial bundle stays small; each route
// loads its chunk on demand behind the Suspense fallback below.
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  })),
)
const KundenListPage = lazy(() =>
  import('@/features/kunden/KundenListPage').then((m) => ({
    default: m.KundenListPage,
  })),
)
const KundeDetailPage = lazy(() =>
  import('@/features/kunden/KundeDetailPage').then((m) => ({
    default: m.KundeDetailPage,
  })),
)
const AuftraegePage = lazy(() =>
  import('@/features/auftraege/AuftraegePage').then((m) => ({
    default: m.AuftraegePage,
  })),
)
const AuftragDetailPage = lazy(() =>
  import('@/features/auftraege/AuftragDetailPage').then((m) => ({
    default: m.AuftragDetailPage,
  })),
)
const EinstellungenPage = lazy(() =>
  import('@/features/einstellungen/EinstellungenPage').then((m) => ({
    default: m.EinstellungenPage,
  })),
)

/**
 * Route table. Public /login sits outside the guard; everything else is nested
 * under <ProtectedRoute> (auth gate) and <AppLayout> (header shell). The Suspense
 * boundary for the lazy pages lives inside AppLayout, so the header and <main>
 * landmark stay mounted while a page chunk loads.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/kunden" element={<KundenListPage />} />
          <Route path="/kunden/:id" element={<KundeDetailPage />} />
          <Route path="/auftraege" element={<AuftraegePage />} />
          <Route path="/auftraege/:id" element={<AuftragDetailPage />} />
          <Route path="/einstellungen" element={<EinstellungenPage />} />
        </Route>
      </Route>

      {/* Unknown paths fall back to the dashboard (which itself guards auth). */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
