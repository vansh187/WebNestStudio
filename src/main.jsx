import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { captureUtmParams } from './lib/utm'
import { installPreloadErrorReload } from './lib/chunkReload'

captureUtmParams()
installPreloadErrorReload()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
