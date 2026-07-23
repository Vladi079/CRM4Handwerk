import { getFaelligAm, isUeberfaellig } from './faelligkeit'

describe('getFaelligAm', () => {
  it('adds 14 days to the completion date', () => {
    expect(getFaelligAm('2026-01-01')).toEqual(new Date(2026, 0, 15))
  })

  it('handles month boundaries', () => {
    expect(getFaelligAm('2026-01-25')).toEqual(new Date(2026, 1, 8))
  })

  it('returns null without a completion date', () => {
    expect(getFaelligAm(null)).toBeNull()
    expect(getFaelligAm('')).toBeNull()
  })

  it('returns null for a malformed date string', () => {
    expect(getFaelligAm('kaputt')).toBeNull()
    expect(getFaelligAm('2026-13')).toBeNull()
  })
})

describe('isUeberfaellig', () => {
  const erledigt = { status: 'erledigt' as const, erledigt_datum: '2026-01-01' }
  // Due date is 2026-01-15.

  it('is false before the due date', () => {
    expect(isUeberfaellig(erledigt, new Date(2026, 0, 10))).toBe(false)
  })

  it('is false exactly on the due date', () => {
    expect(isUeberfaellig(erledigt, new Date(2026, 0, 15))).toBe(false)
  })

  it('is true the day after the due date', () => {
    expect(isUeberfaellig(erledigt, new Date(2026, 0, 16))).toBe(true)
  })

  it('ignores the time of day', () => {
    expect(isUeberfaellig(erledigt, new Date(2026, 0, 16, 23, 59))).toBe(true)
    expect(isUeberfaellig(erledigt, new Date(2026, 0, 15, 23, 59))).toBe(false)
  })

  it('is never overdue once paid', () => {
    expect(
      isUeberfaellig(
        { status: 'bezahlt', erledigt_datum: '2026-01-01' },
        new Date(2026, 5, 1),
      ),
    ).toBe(false)
  })

  it('is not overdue for statuses before completion', () => {
    expect(
      isUeberfaellig(
        { status: 'angebot', erledigt_datum: null },
        new Date(2026, 5, 1),
      ),
    ).toBe(false)
  })

  it('is not overdue when erledigt but the date is missing', () => {
    expect(
      isUeberfaellig(
        { status: 'erledigt', erledigt_datum: null },
        new Date(2026, 5, 1),
      ),
    ).toBe(false)
  })
})
