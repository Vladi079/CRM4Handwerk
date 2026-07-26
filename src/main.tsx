import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root-Element #root wurde nicht gefunden.')
}

// Report accessibility issues to the console during development only. The
// dynamic import and the DEV guard keep axe out of the production bundle.
async function enableAxeInDevelopment(): Promise<void> {
  if (!import.meta.env.DEV) return
  const [React, ReactDOM, axe] = await Promise.all([
    import('react'),
    import('react-dom'),
    import('@axe-core/react'),
  ])
  await axe.default(React, ReactDOM, 1000)
}
void enableAxeInDevelopment()

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
