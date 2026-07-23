import { buildStatusUpdate } from './apply-status-change'
import type { Auftrag } from './auftrag-schema'

// Minimal Auftrag factory for these tests.
function makeAuftrag(overrides: Partial<Auftrag> = {}): Auftrag {
  return {
    id: 'a1',
    owner_id: 'u1',
    kunde_id: 'k1',
    objekt_id: null,
    auftragsnummer: '2026-0001',
    titel: 'Bad sanieren',
    beschreibung: null,
    status: 'angebot',
    betrag_netto: 1000,
    mwst_satz: 19,
    angebot_datum: '2026-01-01',
    beauftragt_datum: null,
    erledigt_datum: null,
    bezahlt_datum: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const TODAY = '2026-02-15'

describe('buildStatusUpdate', () => {
  it('stamps the target date on a forward transition', () => {
    const auftrag = makeAuftrag({ status: 'beauftragt' })
    expect(buildStatusUpdate(auftrag, 'erledigt', TODAY)).toEqual({
      status: 'erledigt',
      erledigt_datum: TODAY,
    })
  })

  it('does not overwrite an existing target date', () => {
    const auftrag = makeAuftrag({
      status: 'beauftragt',
      erledigt_datum: '2026-01-20',
    })
    expect(buildStatusUpdate(auftrag, 'erledigt', TODAY)).toEqual({
      status: 'erledigt',
    })
  })

  it('does not stamp a date for branch statuses', () => {
    const auftrag = makeAuftrag({ status: 'angebot' })
    expect(buildStatusUpdate(auftrag, 'abgelehnt', TODAY)).toEqual({
      status: 'abgelehnt',
    })
  })

  it('clears the current date on a reset', () => {
    const auftrag = makeAuftrag({
      status: 'erledigt',
      beauftragt_datum: '2026-01-10',
      erledigt_datum: '2026-01-20',
    })
    expect(buildStatusUpdate(auftrag, 'beauftragt', TODAY)).toEqual({
      status: 'beauftragt',
      erledigt_datum: null,
    })
  })

  it('rejects an illegal transition', () => {
    const auftrag = makeAuftrag({ status: 'angebot' })
    expect(buildStatusUpdate(auftrag, 'bezahlt', TODAY)).toBeNull()
    expect(buildStatusUpdate(auftrag, 'erledigt', TODAY)).toBeNull()
  })
})
