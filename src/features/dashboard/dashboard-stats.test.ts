import { computeDashboardStats } from './dashboard-stats'
import type { Auftrag } from '@/features/auftraege/auftraege-queries'

let counter = 0
function makeAuftrag(overrides: Partial<Auftrag> = {}): Auftrag {
  counter += 1
  return {
    id: `a${counter}`,
    owner_id: 'u1',
    kunde_id: 'k1',
    objekt_id: null,
    auftragsnummer: `2026-000${counter}`,
    titel: 'Auftrag',
    beschreibung: null,
    status: 'angebot',
    betrag_netto: 1000,
    mwst_satz: 19,
    angebot_datum: '2026-07-01',
    beauftragt_datum: null,
    erledigt_datum: null,
    bezahlt_datum: null,
    created_at: '2026-07-01T00:00:00Z',
    ...overrides,
  }
}

const TODAY = new Date(2026, 6, 24) // 24 July 2026

describe('computeDashboardStats', () => {
  it('counts open quotes', () => {
    const stats = computeDashboardStats(
      [
        makeAuftrag({ status: 'angebot' }),
        makeAuftrag({ status: 'angebot' }),
        makeAuftrag({ status: 'beauftragt' }),
      ],
      TODAY,
    )
    expect(stats.offeneAngebote).toBe(2)
  })

  it('counts running jobs (beauftragt or erledigt)', () => {
    const stats = computeDashboardStats(
      [
        makeAuftrag({ status: 'beauftragt' }),
        makeAuftrag({ status: 'erledigt', erledigt_datum: '2026-07-20' }),
        makeAuftrag({ status: 'angebot' }),
        makeAuftrag({ status: 'bezahlt' }),
      ],
      TODAY,
    )
    expect(stats.laufendeAuftraege).toBe(2)
  })

  it('counts overdue payments (completed past the 14-day term)', () => {
    const stats = computeDashboardStats(
      [
        // erledigt on 2026-07-01 → due 2026-07-15 → overdue on the 24th
        makeAuftrag({ status: 'erledigt', erledigt_datum: '2026-07-01' }),
        // erledigt on 2026-07-20 → due 2026-08-03 → not yet overdue
        makeAuftrag({ status: 'erledigt', erledigt_datum: '2026-07-20' }),
        // paid → never overdue
        makeAuftrag({ status: 'bezahlt', erledigt_datum: '2026-07-01' }),
      ],
      TODAY,
    )
    expect(stats.ueberfaelligeZahlungen).toBe(1)
  })

  it('sums net revenue for jobs paid in the current month only', () => {
    const stats = computeDashboardStats(
      [
        makeAuftrag({
          status: 'bezahlt',
          betrag_netto: 1000,
          bezahlt_datum: '2026-07-10',
        }),
        makeAuftrag({
          status: 'bezahlt',
          betrag_netto: 500.5,
          bezahlt_datum: '2026-07-24',
        }),
        // paid in June → excluded
        makeAuftrag({
          status: 'bezahlt',
          betrag_netto: 9999,
          bezahlt_datum: '2026-06-30',
        }),
        // completed but not paid → excluded
        makeAuftrag({ status: 'erledigt', betrag_netto: 8888 }),
      ],
      TODAY,
    )
    // (1000 + 500.50) € = 150050 cents
    expect(stats.umsatzMonatCents).toBe(150050)
  })
})
