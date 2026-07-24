import { Skeleton } from '@/components/ui/skeleton'
import { EinstellungenForm } from './EinstellungenForm'
import { useProfile } from './profile-queries'

export function EinstellungenPage() {
  const { data: profile, isLoading, isError } = useProfile()

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          Die Einstellungen konnten nicht geladen werden. Läuft die Datenbank?
        </p>
      ) : isLoading || !profile ? (
        <Skeleton className="h-64 max-w-lg" />
      ) : (
        <EinstellungenForm key={profile.id} profile={profile} />
      )}
    </section>
  )
}
