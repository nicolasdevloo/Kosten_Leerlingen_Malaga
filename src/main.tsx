import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from '@/App'
import '@/styles/index.css'

// Een nieuwe versie wordt op de achtergrond gedownload en geïnstalleerd (skipWaiting +
// clientsClaim), maar een tabblad of beginscherm-icoon dat al open was blijft gewoon de oude,
// al-geladen JS draaien tot er een echte herlaad gebeurt — zo bleven leerkrachten soms een
// allang-gefixte bug (bv. de PIN-vraag) blijven zien. Herlaad daarom automatisch zodra een
// nieuwe service worker het overneemt van een al actieve (dus niet bij de allereerste install).
let hadController = typeof navigator !== 'undefined' && !!navigator.serviceWorker?.controller
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (!hadController) {
    hadController = true
    return
  }
  window.location.reload()
})

registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (!registration) return
    registration.update()
    setInterval(() => registration.update(), 60 * 60 * 1000)
  }
})

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
