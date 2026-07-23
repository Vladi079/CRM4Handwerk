/**
 * Auftragsnummer generation. Format: `YYYY-0001` — a 4-digit sequence that
 * restarts each calendar year, per user.
 *
 * Pure: the caller passes the existing numbers and the reference date, so there
 * is no hidden clock or database access.
 */

const SEQUENCE_PADDING = 4

/** Parse a number like '2026-0007' into its year and sequence, or null. */
export function parseAuftragsnummer(
  value: string,
): { year: number; sequence: number } | null {
  const match = /^(\d{4})-(\d+)$/.exec(value)
  if (!match) return null
  return { year: Number(match[1]), sequence: Number(match[2]) }
}

/**
 * The next Auftragsnummer for the year of `today`, given the user's existing
 * numbers. Continues from the highest number in that year, or starts at 1.
 * Numbers from other years and malformed entries are ignored.
 */
export function generateAuftragsnummer(
  existing: readonly string[],
  today: Date,
): string {
  const year = today.getFullYear()
  const highest = existing.reduce((max, value) => {
    const parsed = parseAuftragsnummer(value)
    if (parsed && parsed.year === year && parsed.sequence > max) {
      return parsed.sequence
    }
    return max
  }, 0)
  const next = String(highest + 1).padStart(SEQUENCE_PADDING, '0')
  return `${year}-${next}`
}
