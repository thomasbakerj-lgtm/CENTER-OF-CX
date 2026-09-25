import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

/* Prerendered pages arrive with their body in #root (prerender.mjs). That HTML is the page with no state: default
   inputs, no scenario, nothing on the rail. A tool page can open with state the build could not know (a scenario link
   in the query string, values another tool put on the rail, the review form's saved contact), and its first render
   would then differ from the HTML. Those pages render fresh, as every page did before prerendering; every other page
   hydrates. A URL outside the sitemap gets the empty shell and renders fresh too. */
const STATE_KEYS = ['coc:toolData', 'coc:contact']
function hasClientState() {
  if (!window.location.pathname.startsWith('/tools/')) return false
  if (window.location.search) return true
  try { return STATE_KEYS.some((k) => window.sessionStorage.getItem(k) != null) } catch { return false }
}

const root = document.getElementById('root')
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
if (root.hasChildNodes() && !hasClientState()) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
