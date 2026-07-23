import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CredentialsForm } from './CredentialsForm'

function setup(onSubmit = vi.fn().mockResolvedValue({ error: null })) {
  render(
    <CredentialsForm
      submitLabel="Anmelden"
      pendingLabel="Wird angemeldet …"
      passwordAutoComplete="current-password"
      onSubmit={onSubmit}
    />,
  )
  return { onSubmit, user: userEvent.setup() }
}

describe('CredentialsForm', () => {
  it('zeigt Validierungsfehler und ruft onSubmit nicht auf', async () => {
    const { onSubmit, user } = setup()

    await user.click(screen.getByRole('button', { name: 'Anmelden' }))

    expect(
      await screen.findByText('Bitte gib deine E-Mail-Adresse ein.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Das Passwort muss mindestens 6 Zeichen lang sein.'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('übergibt gültige Eingaben an onSubmit', async () => {
    const { onSubmit, user } = setup()

    await user.type(screen.getByLabelText('E-Mail'), 'anna@example.de')
    await user.type(screen.getByLabelText('Passwort'), 'geheim123')
    await user.click(screen.getByRole('button', { name: 'Anmelden' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'anna@example.de',
      password: 'geheim123',
    })
  })

  it('zeigt einen Serverfehler an', async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValue({ error: 'E-Mail oder Passwort ist falsch.' })
    const { user } = setup(onSubmit)

    await user.type(screen.getByLabelText('E-Mail'), 'anna@example.de')
    await user.type(screen.getByLabelText('Passwort'), 'geheim123')
    await user.click(screen.getByRole('button', { name: 'Anmelden' }))

    expect(
      await screen.findByText('E-Mail oder Passwort ist falsch.'),
    ).toBeInTheDocument()
  })
})
