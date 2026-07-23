import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '@/features/auth/AuthPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { KundenListPage } from '@/features/kunden/KundenListPage'
import { KundeDetailPage } from '@/features/kunden/KundeDetailPage'
import { AuftraegeTablePage } from '@/features/auftraege/AuftraegeTablePage'

/**
 * Route table. Public /login sits outside the guard; everything else is nested
 * under <ProtectedRoute> (auth gate) and <AppLayout> (header shell).
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
          <Route path="/auftraege" element={<AuftraegeTablePage />} />
        </Route>
      </Route>

      {/* Unknown paths fall back to the dashboard (which itself guards auth). */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
