import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

// Accessibility smoke test: scan the login screen (reachable without a backend)
// for automatically-detectable WCAG violations.
test('login page has no detectable accessibility violations', async ({
  page,
}) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'CRM4Handwerk' }),
  ).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  expect(results.violations).toEqual([])
})
