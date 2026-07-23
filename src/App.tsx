import { Button } from '@/components/ui/button'

/**
 * Placeholder shell for Phase 1 (scaffold + tooling).
 * It only exists to prove that Tailwind, shadcn/ui and the build pipeline
 * render correctly. Real routing and screens follow in later phases.
 */
function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Handwerk CRM</h1>
        <p className="text-muted-foreground max-w-md">
          Kunden- und Auftragsverwaltung für kleine Handwerksbetriebe. Das
          Grundgerüst steht — die Funktionen folgen Schritt für Schritt.
        </p>
      </div>
      <Button>Los geht’s</Button>
    </main>
  )
}

export default App
