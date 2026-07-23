import { generateAuftragsnummer, parseAuftragsnummer } from './auftragsnummer'

describe('parseAuftragsnummer', () => {
  it('splits a valid number into year and sequence', () => {
    expect(parseAuftragsnummer('2026-0007')).toEqual({
      year: 2026,
      sequence: 7,
    })
  })

  it('rejects malformed input', () => {
    expect(parseAuftragsnummer('bad')).toBeNull()
    expect(parseAuftragsnummer('2026-')).toBeNull()
    expect(parseAuftragsnummer('26-0001')).toBeNull()
    expect(parseAuftragsnummer('')).toBeNull()
  })
})

describe('generateAuftragsnummer', () => {
  const today = new Date(2026, 2, 15)

  it('starts at 0001 when there are no numbers yet', () => {
    expect(generateAuftragsnummer([], today)).toBe('2026-0001')
  })

  it('continues from the highest number of the current year', () => {
    expect(generateAuftragsnummer(['2026-0001', '2026-0002'], today)).toBe(
      '2026-0003',
    )
  })

  it('is not confused by the order of existing numbers', () => {
    expect(
      generateAuftragsnummer(['2026-0003', '2026-0001', '2026-0002'], today),
    ).toBe('2026-0004')
  })

  it('restarts the sequence in a new year', () => {
    expect(generateAuftragsnummer(['2025-0007', '2025-0008'], today)).toBe(
      '2026-0001',
    )
  })

  it('ignores other years and malformed entries', () => {
    expect(
      generateAuftragsnummer(['2025-0099', 'kaputt', '2026-0002'], today),
    ).toBe('2026-0003')
  })

  it('keeps at least four digits but grows beyond them', () => {
    expect(generateAuftragsnummer(['2026-9999'], today)).toBe('2026-10000')
  })
})
