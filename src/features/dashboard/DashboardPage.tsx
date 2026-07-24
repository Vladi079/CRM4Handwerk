import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { euroToCents } from '@/domain/money'
import { getFaelligAm } from '@/domain/faelligkeit'
import { kundeAnzeigename } from '@/domain/kunde'
import { formatCurrency, formatDateObject } from '@/lib/formatters'
import { useKunden } from '@/features/kunden/kunden-queries'
import {
  useAuftraege,
  type Auftrag,
} from '@/features/auftraege/auftraege-queries'
import {
  computeDashboardStats,
  getUeberfaelligeAuftraege,
} from './dashboard-stats'

export function DashboardPage() {
  const { data: auftraege, isLoading, isError } = useAuftraege()
  const { data: kunden } = useKunden()

  const stats = useMemo(
    () => computeDashboardStats(auftraege ?? [], new Date()),
    [auftraege],
  )
  const overdue = useMemo(
    () => getUeberfaelligeAuftraege(auftraege ?? [], new Date()),
    [auftraege],
  )
  const kundenById = useMemo(
    () => new Map((kunden ?? []).map((kunde) => [kunde.id, kunde])),
    [kunden],
  )
  const kundeName = (auftrag: Auftrag) => {
    const kunde = kundenById.get(auftrag.kunde_id)
    return kunde ? kundeAnzeigename(kunde) : '—'
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {isError ? (
        <p role="alert" className="text-destructive text-sm">
          Die Daten konnten nicht geladen werden. Läuft die Datenbank?
        </p>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Offene Angebote" value={stats.offeneAngebote} />
            <StatCard
              label="Laufende Aufträge"
              value={stats.laufendeAuftraege}
            />
            <StatCard
              label="Überfällige Zahlungen"
              value={stats.ueberfaelligeZahlungen}
              highlight={stats.ueberfaelligeZahlungen > 0}
            />
            <StatCard
              label="Umsatz (laufender Monat)"
              value={formatCurrency(stats.umsatzMonatCents)}
            />
          </div>

          <OverdueList auftraege={overdue} kundeName={kundeName} />
        </>
      )}
    </section>
  )
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            'text-3xl font-semibold tabular-nums',
            highlight && 'text-destructive',
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function OverdueList({
  auftraege,
  kundeName,
}: {
  auftraege: Auftrag[]
  kundeName: (auftrag: Auftrag) => string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Überfällige Zahlungen</CardTitle>
      </CardHeader>
      <CardContent>
        {auftraege.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Keine überfälligen Zahlungen. Alles im grünen Bereich.
          </p>
        ) : (
          <ul className="divide-y">
            {auftraege.map((auftrag) => {
              const faellig = getFaelligAm(auftrag.erledigt_datum)
              return (
                <li
                  key={auftrag.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/auftraege/${auftrag.id}`}
                      className="font-medium hover:underline"
                    >
                      {auftrag.titel}
                    </Link>
                    <p className="text-muted-foreground truncate text-sm">
                      {kundeName(auftrag)}
                      {faellig && ` · fällig war ${formatDateObject(faellig)}`}
                    </p>
                  </div>
                  <span className="tabular-nums">
                    {formatCurrency(euroToCents(auftrag.betrag_netto))}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
