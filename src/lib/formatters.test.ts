import { formatCurrency, formatDate } from './formatters'

// Intl separates the amount and the € sign with a (narrow) non-breaking space.
// In JS `\s` also matches those, so normalise every whitespace run to a plain
// space, letting the assertions read naturally.
const normalise = (value: string) => value.replace(/\s+/g, ' ')

describe('formatCurrency', () => {
  it('formats cents as German currency', () => {
    expect(normalise(formatCurrency(123456))).toBe('1.234,56 €')
    expect(normalise(formatCurrency(1999))).toBe('19,99 €')
    expect(normalise(formatCurrency(0))).toBe('0,00 €')
  })
})

describe('formatDate', () => {
  it('formats an ISO date as dd.MM.yyyy', () => {
    expect(formatDate('2026-01-05')).toBe('05.01.2026')
    expect(formatDate('2026-12-31')).toBe('31.12.2026')
  })

  it('returns an empty string for null or malformed input', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('')).toBe('')
  })
})
