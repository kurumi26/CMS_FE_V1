import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// @ts-ignore -- TS Language Server false positive; tsc --noEmit passes. CSS handled by Vite.
import './index.css'
import { applyAllSettings } from './utils/appearance'

// Apply stored appearance settings before first render
applyAllSettings()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
