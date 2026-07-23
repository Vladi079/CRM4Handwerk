import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches render errors in the routed tree so a single broken screen can't take
 * down the whole app with a blank page. React only supports error boundaries as
 * class components, which is why this one isn't a function component.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // A real app would forward this to an error-reporting service.
    console.error('Unerwarteter Fehler:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">Etwas ist schiefgelaufen</h1>
          <p className="text-muted-foreground max-w-md">
            Es ist ein unerwarteter Fehler aufgetreten. Bitte lade die Seite
            neu.
          </p>
          <Button onClick={() => window.location.reload()}>
            Seite neu laden
          </Button>
        </main>
      )
    }

    return this.props.children
  }
}
