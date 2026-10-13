import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config' 
import { initializeTheme } from './features/theme/themeSlice'

initializeTheme()

// ✅ FIX: StrictMode فقط در production فعال باشه
// (در dev خاموشه تا از double-effect جلوگیری بشه)
const isDev = import.meta.env.DEV

ReactDOM.createRoot(document.getElementById('root')).render(
  isDev ? (
    <App />
  ) : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
)