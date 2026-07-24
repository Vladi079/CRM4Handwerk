import { centsToEuro } from '@/domain/money'

// Locale formatting via Intl only — no manual string assembly. These live in
// lib/ (a presentation concern) rather than in the pure domain layer.

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

/** Format integer cents as German currency, e.g. 123456 → "1.234,56 €". */
export function formatCurrency(cents: number): string {
  return currencyFormatter.format(centsToEuro(cents))
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Format an ISO date ('YYYY-MM-DD') as dd.MM.yyyy, or '' when null. */
export function formatDate(isoDate: string | null): string {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return ''
  return dateFormatter.format(new Date(year, month - 1, day))
}

/** Format a Date object as dd.MM.yyyy using its local calendar day. */
export function formatDateObject(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return formatDate(`${date.getFullYear()}-${month}-${day}`)
}
