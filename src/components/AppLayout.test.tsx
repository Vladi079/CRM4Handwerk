import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/auth-context'
import { AppLayout } from './AppLayout'

const authValue: AuthContextValue = {
  session: null,
  user: { email: 'demo@crm4handwerk.de' } as User,
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}

function renderLayout() {
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<h1>Dashboard</h1>} />
            <Route path="kunden" element={<h1>Kunden</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

// The burger menu is the only navigation on phones and tablets, so opening it
// and following a link has to work — including closing itself afterwards.
describe('AppLayout burger menu', () => {
  it('opens the menu and navigates, then closes itself', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Menü öffnen' }))

    const menu = await screen.findByRole('dialog')
    await user.click(within(menu).getByRole('link', { name: 'Kunden' }))

    expect(screen.getByRole('heading', { name: 'Kunden' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('offers sign-out inside the menu, where it is reachable on small screens', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Menü öffnen' }))
    const menu = await screen.findByRole('dialog')

    expect(within(menu).getByText('demo@crm4handwerk.de')).toBeInTheDocument()
    await user.click(within(menu).getByRole('button', { name: 'Abmelden' }))
    expect(authValue.signOut).toHaveBeenCalled()
  })
})
