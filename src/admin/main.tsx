import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import '../App.css'
import { AdminApp } from './AdminApp'

// The admin page is a separate entry (its own unlisted URL) but shares this site's storage with the
// main app, so it reads and writes the same player data on this device.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
