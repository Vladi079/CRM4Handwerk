/**
 * Money and VAT (Mehrwertsteuer).
 *
 * All arithmetic is done in integer cents to avoid floating-point drift; euros
 * only appear at the boundaries (parsing user input, formatting for display).
 */

/** Convert a euro amount to integer cents, rounded to the nearest cent. */
export function euroToCents(euro: number): number {
  return Math.round(euro * 100)
}

/** Convert integer cents back to a euro number. */
export function centsToEuro(cents: number): number {
  return cents / 100
}

/**
 * The effective VAT rate. A Kleinunternehmer (§19 UStG) never charges VAT, so
 * the rate is forced to 0 regardless of the stored value.
 */
export function effectiveMwstSatz(
  mwstSatz: number,
  kleinunternehmer: boolean,
): number {
  return kleinunternehmer ? 0 : mwstSatz
}

/** Gross (brutto) amount in cents: netto × (1 + satz/100), rounded to a cent. */
export function calculateBruttoCents(
  nettoCents: number,
  mwstSatz: number,
): number {
  return Math.round(nettoCents * (1 + mwstSatz / 100))
}

/** The VAT portion in cents (brutto − netto). */
export function calculateMwstCents(
  nettoCents: number,
  mwstSatz: number,
): number {
  return calculateBruttoCents(nettoCents, mwstSatz) - nettoCents
}
