import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees after each test so they don't leak into the next one.
afterEach(() => {
  cleanup()
})

// jsdom doesn't implement these DOM APIs that Radix UI (dropdowns, selects)
// relies on. Stub them so those components can be exercised in tests.
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.hasPointerCapture = () => false
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.scrollIntoView = () => {}
}
