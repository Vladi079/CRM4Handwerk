import type { Status } from './status'

/** Payment term: an invoice is due 14 days after the work is completed. */
const ZAHLUNGSZIEL_TAGE = 14

/** The minimal view of an Auftrag needed to judge its payment status. */
export interface FaelligkeitInput {
  status: Status
  /** ISO date 'YYYY-MM-DD', or null when not yet completed. */
  erledigt_datum: string | null
}

/** Parse an ISO date ('YYYY-MM-DD') to a local-midnight Date, or null. */
function parseIsoDate(value: string | null): Date | null {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

/** Strip the time part so comparisons are day-based. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** The due date: erledigt_datum + 14 days, or null if not completed. */
export function getFaelligAm(erledigtDatum: string | null): Date | null {
  const erledigt = parseIsoDate(erledigtDatum)
  return erledigt ? addDays(erledigt, ZAHLUNGSZIEL_TAGE) : null
}

/**
 * A job is überfällig when it is still in status `erledigt` (done but not paid)
 * and today is past its due date. `today` is injected so the logic stays pure
 * and testable — never call new Date() in here.
 */
export function isUeberfaellig(
  auftrag: FaelligkeitInput,
  today: Date,
): boolean {
  if (auftrag.status !== 'erledigt') return false
  const faellig = getFaelligAm(auftrag.erledigt_datum)
  if (!faellig) return false
  return startOfDay(today).getTime() > faellig.getTime()
}
