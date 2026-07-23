import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuftragForm, type KundeOption } from './AuftragForm'
import {
  emptyAuftragFormValues,
  type AuftragFormValues,
} from './auftrag-schema'

const kundenOptions: KundeOption[] = [{ value: 'k1', label: 'Anna Bauer' }]

function renderForm(
  defaultValues: AuftragFormValues,
  onSubmit = vi.fn<(values: AuftragFormValues) => void>(),
) {
  render(
    <>
      <AuftragForm
        formId="auftrag-form"
        defaultValues={defaultValues}
        kundenOptions={kundenOptions}
        onSubmit={onSubmit}
      />
      <button type="submit" form="auftrag-form">
        Speichern
      </button>
    </>,
  )
  return { onSubmit, user: userEvent.setup() }
}

describe('AuftragForm', () => {
  it('verlangt Kunde und Titel', async () => {
    const { onSubmit, user } = renderForm(emptyAuftragFormValues)

    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(
      await screen.findByText('Bitte wähle einen Kunden.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Bitte gib einen Titel ein.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('lehnt einen ungültigen Betrag ab', async () => {
    const { onSubmit, user } = renderForm({
      ...emptyAuftragFormValues,
      kunde_id: 'k1',
      titel: 'Bad sanieren',
      betrag_netto: 'abc',
    })

    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(await screen.findByText(/gültigen Betrag/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('übergibt gültige Eingaben an onSubmit', async () => {
    const valid: AuftragFormValues = {
      kunde_id: 'k1',
      titel: 'Bad sanieren',
      beschreibung: '',
      betrag_netto: '1234,56',
      mwst_satz: '19',
    }
    const { onSubmit, user } = renderForm(valid)

    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(valid)
  })
})
