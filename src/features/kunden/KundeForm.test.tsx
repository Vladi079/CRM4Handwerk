import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KundeForm } from './KundeForm'
import { emptyKundeFormValues, type KundeFormValues } from './kunde-schema'

// The real submit button lives in the dialog footer and targets the form by id,
// so the test renders an equivalent external submit button.
function renderForm(
  defaultValues: KundeFormValues,
  onSubmit = vi.fn<(values: KundeFormValues) => void>(),
) {
  render(
    <>
      <KundeForm
        formId="kunde-form"
        defaultValues={defaultValues}
        onSubmit={onSubmit}
      />
      <button type="submit" form="kunde-form">
        Speichern
      </button>
    </>,
  )
  return { onSubmit, user: userEvent.setup() }
}

describe('KundeForm', () => {
  it('zeigt Pflichtfeld-Fehler und ruft onSubmit nicht auf', async () => {
    const { onSubmit, user } = renderForm(emptyKundeFormValues)

    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(
      await screen.findByText('Bitte gib den Vornamen ein.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Bitte gib den Nachnamen ein.')).toBeInTheDocument()
    expect(screen.getByText('Bitte gib die Straße ein.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('verlangt einen Firmennamen bei Firmenkunden', async () => {
    const { onSubmit, user } = renderForm({
      ...emptyKundeFormValues,
      typ: 'firma',
      vorname: 'Anna',
      nachname: 'Bauer',
      strasse: 'Musterweg 1',
      plz: '10115',
      ort: 'Berlin',
    })

    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    expect(
      await screen.findByText(
        'Bei Firmenkunden ist der Firmenname erforderlich.',
      ),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('übergibt gültige Eingaben an onSubmit', async () => {
    const valid: KundeFormValues = {
      ...emptyKundeFormValues,
      vorname: 'Anna',
      nachname: 'Bauer',
      strasse: 'Musterweg 1',
      plz: '10115',
      ort: 'Berlin',
    }
    const { onSubmit, user } = renderForm(valid)

    await user.click(screen.getByRole('button', { name: 'Speichern' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(valid)
  })
})
