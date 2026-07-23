import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuftragCard } from './AuftragCard'
import type { Auftrag } from './auftraege-queries'

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

function renderCard(auftrag: Auftrag) {
  const onChangeStatus = vi.fn<(auftrag: Auftrag, to: string) => void>()
  render(
    <AuftragCard
      auftrag={auftrag}
      kundeName="Anna Bauer"
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onChangeStatus={onChangeStatus}
    />,
  )
  return { onChangeStatus, user: userEvent.setup() }
}

describe('AuftragCard status actions', () => {
  it('offers only the transitions the state machine permits', async () => {
    const { user } = renderCard(makeAuftrag({ status: 'angebot' }))

    await user.click(screen.getByRole('button', { name: /Aktionen für/ }))

    // angebot → beauftragt | abgelehnt are allowed...
    expect(
      await screen.findByRole('menuitem', { name: 'Beauftragt' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Abgelehnt' }),
    ).toBeInTheDocument()
    // ...but skipping ahead is not offered.
    expect(
      screen.queryByRole('menuitem', { name: 'Bezahlt' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Erledigt' }),
    ).not.toBeInTheDocument()
  })

  it('reports the chosen transition', async () => {
    const auftrag = makeAuftrag({ status: 'angebot' })
    const { onChangeStatus, user } = renderCard(auftrag)

    await user.click(screen.getByRole('button', { name: /Aktionen für/ }))
    await user.click(
      await screen.findByRole('menuitem', { name: 'Beauftragt' }),
    )

    expect(onChangeStatus).toHaveBeenCalledWith(auftrag, 'beauftragt')
  })

  it('offers a reset for a terminal status', async () => {
    const { user } = renderCard(makeAuftrag({ status: 'bezahlt' }))

    await user.click(screen.getByRole('button', { name: /Aktionen für/ }))

    expect(
      await screen.findByRole('menuitem', { name: /Zurücksetzen: Erledigt/ }),
    ).toBeInTheDocument()
  })
})
