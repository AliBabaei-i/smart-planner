import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config' 
import { initializeTheme } from './features/theme/themeSlice'

// ✅ اعمال تم قبل از رندر
initializeTheme()
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)