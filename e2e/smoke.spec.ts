import { test, expect } from '@playwright/test'

// Smoke test: an unauthenticated visitor is guided to the login screen, which
// renders its heading and both auth tabs.
test('unauthenticated visitor lands on the login page', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Handwerk CRM' }),
  ).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Registrieren' })).toBeVisible()
})
