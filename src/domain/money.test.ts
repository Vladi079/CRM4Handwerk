import {
  calculateBruttoCents,
  calculateMwstCents,
  centsToEuro,
  effectiveMwstSatz,
  euroToCents,
} from './money'

describe('euroToCents', () => {
  it('converts whole and fractional euros', () => {
    expect(euroToCents(100)).toBe(10000)
    expect(euroToCents(19.99)).toBe(1999)
    expect(euroToCents(0)).toBe(0)
  })

  it('avoids the classic floating-point errors', () => {
    // 0.1 + 0.2 === 0.30000000000000004 in IEEE-754.
    expect(euroToCents(0.1 + 0.2)).toBe(30)
    expect(euroToCents(19.99 * 1)).toBe(1999)
  })
})

describe('centsToEuro', () => {
  it('is the inverse of euroToCents', () => {
    expect(centsToEuro(1999)).toBe(19.99)
    expect(centsToEuro(10000)).toBe(100)
    expect(centsToEuro(0)).toBe(0)
  })
})

describe('effectiveMwstSatz', () => {
  it('keeps the rate for normal businesses', () => {
    expect(effectiveMwstSatz(19, false)).toBe(19)
    expect(effectiveMwstSatz(7, false)).toBe(7)
  })

  it('forces 0 for a Kleinunternehmer (§19 UStG)', () => {
    expect(effectiveMwstSatz(19, true)).toBe(0)
    expect(effectiveMwstSatz(7, true)).toBe(0)
  })
})

describe('calculateBruttoCents', () => {
  it('applies the standard German rates', () => {
    expect(calculateBruttoCents(10000, 19)).toBe(11900)
    expect(calculateBruttoCents(10000, 7)).toBe(10700)
    expect(calculateBruttoCents(10000, 0)).toBe(10000)
  })

  it('rounds to the nearest cent', () => {
    // 19.99 € net at 19 % = 23.7881 € → 23.79 €.
    expect(calculateBruttoCents(1999, 19)).toBe(2379)
  })
})

describe('calculateMwstCents', () => {
  it('returns the VAT portion only', () => {
    expect(calculateMwstCents(10000, 19)).toBe(1900)
    expect(calculateMwstCents(10000, 7)).toBe(700)
    expect(calculateMwstCents(10000, 0)).toBe(0)
    expect(calculateMwstCents(1999, 19)).toBe(380)
  })
})
