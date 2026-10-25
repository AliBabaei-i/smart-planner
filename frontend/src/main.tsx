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

// ✅ Dev cleanup (فقط اگر env فعال باشد)
if (import.meta.env.DEV && import.meta.env.VITE_UNREGISTER_SW === 'true') {
  console.log('🔧 Forcing SW cleanup...')
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister())
    })
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center h-screen">
            در حال بارگذاری...
          </div>
        }
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

// ✅ Dev Tools
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
  console.log(
    '💡 Dev Tools: window.store, window.persistor, window.resetPersist'
  )
}