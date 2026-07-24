import { isUeberfaellig } from '@/domain/faelligkeit'
import { euroToCents } from '@/domain/money'
import type { Auftrag } from '@/features/auftraege/auftraege-queries'

export interface DashboardStats {
  /** Jobs still in the quote stage. */
  offeneAngebote: number
  /** Commissioned or completed but not yet paid/closed. */
  laufendeAuftraege: number
  /** Completed jobs whose 14-day payment term has passed. */
  ueberfaelligeZahlungen: number
  /** Net revenue (in cents) from jobs marked paid in the current month. */
  umsatzMonatCents: number
}

/** Whether an ISO date ('YYYY-MM-DD') falls in the same month as `reference`. */
function isInMonth(isoDate: string | null, reference: Date): boolean {
  if (!isoDate) return false
  const [year, month] = isoDate.split('-').map(Number)
  return year === reference.getFullYear() && month === reference.getMonth() + 1
}

/** The overdue jobs, for the dashboard list. */
export function getUeberfaelligeAuftraege(
  auftraege: Auftrag[],
  today: Date,
): Auftrag[] {
  return auftraege.filter((auftrag) => isUeberfaellig(auftrag, today))
}

/** Compute the four dashboard KPIs from the job list. Pure: `today` is passed in. */
export function computeDashboardStats(
  auftraege: Auftrag[],
  today: Date,
): DashboardStats {
  return {
    offeneAngebote: auftraege.filter((a) => a.status === 'angebot').length,
    laufendeAuftraege: auftraege.filter(
      (a) => a.status === 'beauftragt' || a.status === 'erledigt',
    ).length,
    ueberfaelligeZahlungen: getUeberfaelligeAuftraege(auftraege, today).length,
    umsatzMonatCents: auftraege
      .filter(
        (a) => a.status === 'bezahlt' && isInMonth(a.bezahlt_datum, today),
      )
      .reduce((sum, a) => sum + euroToCents(a.betrag_netto), 0),
  }
}
