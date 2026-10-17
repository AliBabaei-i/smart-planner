import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { store, persistor } from './app/store.js'
import LoadingSpinner from './components/common/LoadingSpinner'

import './index.css'
import './i18n/config'

// ═══════════════════════════════════════════════
// ✅ Dev mode — Service Worker cleanup
// ═══════════════════════════════════════════════
if (import.meta.env.DEV) {
  console.log('🔧 Dev mode detected - cleaning up Service Workers...')
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) {
        console.log('✅ No Service Workers to unregister')
      } else {
        Promise.all(registrations.map(r => r.unregister())).then(() => {
          console.log(`✅ Unregistered ${registrations.length} Service Worker(s)`)
        })
      }
    })
  }
}

// ═══════════════════════════════════════════════
// ✅ IndexedDB migration (fire-and-forget)
// ═══════════════════════════════════════════════
import { syncQueue } from './services/syncQueue'
syncQueue.migrateFromLocalStorage().catch((err) => {
  console.error('Queue migration failed:', err)
})

// ═══════════════════════════════════════════════
// ✅ Dev Tools — window helpers
// ═══════════════════════════════════════════════
import {
  getStorageInfo,
  forceMigration,
  clearPersistStorage
} from './app/persistStorage'

if (import.meta.env.DEV) {
  window.getStorageInfo = getStorageInfo
  window.forceMigration = forceMigration
  window.clearPersistStorage = clearPersistStorage
  window.syncQueue = syncQueue

  // ✅ پاک کردن کلیدهای قدیمی localStorage (helper)
  window.cleanupOldStorage = () => {
    const keys = [
      'smart-planner-sync-queue',
      'smart-planner-habits',
      'smart-planner-notes',
      'smart-planner-goals',
      'smart-planner-growth',
      'smart-planner-finance',
      'smart-planner-tasks',
      'smart-planner-projects',
      'smart-planner-dashboard',
      'smart-planner-achievements'
    ]
    let count = 0
    keys.forEach(k => {
      if (localStorage.getItem(k)) {
        localStorage.removeItem(k)
        count++
      }
    })
    console.log(`✅ Cleaned ${count} old localStorage keys`)
  }

  // ✅ Reset کامل persist
  window.resetPersist = async () => {
    if (!confirm('آیا مطمئنی؟ همه داده‌ها پاک می‌شن.')) return
    await clearPersistStorage()
    await syncQueue.clear()
    localStorage.clear()
    console.log('🗑️ All cleared — reloading...')
    setTimeout(() => window.location.reload(), 500)
  }

  console.log('💡 Dev Tools Available:')
  console.log('   window.cleanupOldStorage()')
  console.log('   window.resetPersist()')
  console.log('   window.getStorageInfo()')
  console.log('   window.forceMigration()')
  console.log('   window.clearPersistStorage()')
  console.log('   window.syncQueue')
  console.log('   window.store')
  console.log('   window.persistor')
}

// ═══════════════════════════════════════════════
// ✅ Loading Component for PersistGate
// ═══════════════════════════════════════════════
const PersistLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <LoadingSpinner size="large" />
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        در حال بارگذاری...
      </p>
    </div>
  </div>
)

// ═══════════════════════════════════════════════
// ✅ Render
// ═══════════════════════════════════════════════
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<PersistLoading />}
        persistor={persistor}
        onBeforeLift={() => {
          console.log('✅ Persist ready. State keys:',
            Object.keys(store.getState())
          )
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)