import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppRoutes } from '@/routes/AppRoutes'
import { queryClient } from '@/lib/queryClient'

/**
 * App composition root: TanStack Query (server state) and auth state wrap the
 * router, and a route-level error boundary keeps a broken screen from blanking
 * the whole app.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
