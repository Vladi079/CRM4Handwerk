import { test, expect } from '@playwright/test'

// Phase 1 smoke test: the app builds, serves and renders its title.
test('start page shows the app title', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Handwerk CRM' }),
  ).toBeVisible()
})
