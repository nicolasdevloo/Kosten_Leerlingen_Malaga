import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from '@/App'
import '@/styles/index.css'

// HashRouter (in plaats van BrowserRouter) zodat elke route ook op statische hosting
// (GitHub Pages) werkt zonder server-side rewrites, en persoonlijke links (/#/y/token)
// altijd naar de juiste pagina laden, ook na een rechtstreeks bezoek of herlaad.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
