import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/formatters'
import { getFaelligAm, isUeberfaellig } from '@/domain/faelligkeit'
import type { DatumField, Status } from '@/domain/status'
import { STATUS_DOT, STATUS_LABELS } from './auftrag-labels'
import type { Auftrag } from './auftraege-queries'

const MAIN_STEPS: { status: Status; datum: DatumField }[] = [
  { status: 'angebot', datum: 'angebot_datum' },
  { status: 'beauftragt', datum: 'beauftragt_datum' },
  { status: 'erledigt', datum: 'erledigt_datum' },
  { status: 'bezahlt', datum: 'bezahlt_datum' },
]

/** Format a local-midnight Date as dd.MM.yyyy via the shared ISO formatter. */
function formatDateObject(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return formatDate(`${date.getFullYear()}-${month}-${day}`)
}

export function AuftragStatusTimeline({
  auftrag,
  today,
}: {
  auftrag: Auftrag
  today: Date
}) {
  const ueberfaellig = isUeberfaellig(auftrag, today)
  const faelligAm = getFaelligAm(auftrag.erledigt_datum)
  const isBranch =
    auftrag.status === 'abgelehnt' || auftrag.status === 'storniert'

  return (
    <ol className="space-y-4">
      {MAIN_STEPS.map((step) => {
        const datum = auftrag[step.datum]
        const reached = datum !== null
        return (
          <li key={step.status} className="flex gap-3">
            <span
              className={cn(
                'mt-1 size-3 shrink-0 rounded-full border',
                reached ? 'border-primary bg-primary' : 'bg-background',
              )}
              aria-hidden
            />
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  !reached && 'text-muted-foreground',
                )}
              >
                {STATUS_LABELS[step.status]}
              </p>
              <p className="text-muted-foreground text-xs">
                {reached ? formatDate(datum) : 'ausstehend'}
              </p>
              {step.status === 'erledigt' && reached && faelligAm && (
                <p
                  className={cn(
                    'text-xs',
                    ueberfaellig
                      ? 'text-destructive font-medium'
                      : 'text-muted-foreground',
                  )}
                >
                  Zahlungsziel: {formatDateObject(faelligAm)}
                  {ueberfaellig && ' — überfällig'}
                </p>
              )}
            </div>
          </li>
        )
      })}

      {isBranch && (
        <li className="flex gap-3">
          <span
            className={cn(
              'mt-1 size-3 shrink-0 rounded-full',
              STATUS_DOT[auftrag.status],
            )}
            aria-hidden
          />
          <p className="text-sm font-medium">{STATUS_LABELS[auftrag.status]}</p>
        </li>
      )}
    </ol>
  )
}
