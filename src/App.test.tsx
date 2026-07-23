import { render, screen } from '@testing-library/react'
import App from './App'

// Smoke test for Phase 1: proves Vitest + Testing Library + jsdom are wired up.
describe('App', () => {
  it('renders the application title', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Handwerk CRM' }),
    ).toBeInTheDocument()
  })
})
