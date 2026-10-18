import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'

import App from './App'
import { store, persistor } from './app/store'
import { syncQueue, lastSync } from './services/syncQueue'
import './i18n/config'
import './index.css'

// ✅ Dev Tools: پاکسازی Service Worker در dev
if (import.meta.env.DEV) {
  console.log('🔧 Dev mode detected - cleaning up Service Workers...')
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister())
      console.log(`✅ Unregistered ${regs.length} Service Worker(s)`)
    })
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name))
      })
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<div className="flex items-center justify-center h-screen">در حال بارگذاری...</div>}
        persistor={persistor}
        onBeforeLift={() => {
          console.log('✅ Persist ready. State keys:')
          console.log(Object.keys(store.getState()))
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)

// ✅ Expose dev tools on window
if (import.meta.env.DEV) {
  ;(window as any).store = store
  ;(window as any).persistor = persistor
  ;(window as any).syncQueue = syncQueue
  ;(window as any).resetPersist = async () => {
    await persistor.purge()
    localStorage.clear()
    window.location.reload()
  }
  ;(window as any).getStorageInfo = async () => {
    const size = await syncQueue.size()
    return { queueSize: size, lastSync: lastSync.get() }
  }
  console.log('💡 Dev Tools Available: window.store, window.persistor, window.syncQueue, window.resetPersist, window.getStorageInfo')
}