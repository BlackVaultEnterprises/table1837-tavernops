import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize error monitoring
if (import.meta.env.PROD) {
  import('./monitoring/sentry').then(({ initSentry }) => {
    initSentry();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)