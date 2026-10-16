import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App.jsx'
import store, { persistor } from './app/store'
import './index.css'
import './i18n/config'
import { initializeTheme } from './features/theme/themeSlice'

// ═══════════════════════════════════════════════
// ✅ اعمال تم قبل از رندر (جلوگیری از فلش)
// ═══════════════════════════════════════════════
initializeTheme()

// ═══════════════════════════════════════════════
// ✅ Loading Component حین Rehydration
// ═══════════════════════════════════════════════
const PersistLoader = () => {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-3 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
        </div>

        {/* متن */}
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
          برنامه‌ریزی هوشمند
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          در حال بارگذاری داده‌ها...
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// ✅ Error Boundary برای PersistGate
// ═══════════════════════════════════════════════
class PersistErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Persist Error:', error, errorInfo)
  }

  handleReset = () => {
    try {
      // ✅ پاک کردن LocalStorage و reload
      const keysToKeep = [
        'smart-planner-language',
        'smart-planner-primary-color'
      ]
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })
      window.location.reload()
    } catch (error) {
      console.error('Reset failed:', error)
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              خطا در بارگذاری داده‌ها
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              متأسفانه در بارگذاری داده‌های ذخیره‌شده مشکلی پیش اومده.
              می‌تونی داده‌ها رو ریست کنی و از اول شروع کنی.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-start">
                <p className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              ریست داده‌ها و شروع مجدد
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              ⚠️ این کار همه داده‌های محلی رو پاک می‌کنه
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ═══════════════════════════════════════════════
// ✅ Dev Cleanup (فقط در حالت Development)
// ═══════════════════════════════════════════════
if (import.meta.env.DEV) {
  // ✅ در دسترس گذاشتن پاک‌سازی از Console
  window.cleanupOldStorage = () => {
    const OLD_KEYS = [
      'smart-planner-tasks',
      'smart-planner-projects',
      'smart-planner-habits',
      'smart-planner-notes',
      'smart-planner-goals',
      'smart-planner-growth',
      'smart-planner-dashboard-layout',
      'smart-planner-achievements',
      'smart-planner-pomodoro',
      'smart-planner-theme',
      'smart-planner-notifications',
      'smart-planner-finance'
    ]
    let cleaned = 0
    OLD_KEYS.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        cleaned++
        console.log(`🗑️ Removed: ${key}`)
      }
    })
    console.log(`✅ Cleaned ${cleaned} old keys`)
    return cleaned
  }

  // ✅ پاک کردن کامل persist state
  window.resetPersist = () => {
    if (window.confirm('⚠️ همه داده‌های ذخیره‌شده پاک بشن؟')) {
      const keysToKeep = ['smart-planner-language', 'smart-planner-primary-color']
      Object.keys(localStorage).forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })
      window.location.reload()
    }
  }

  console.log(
    '%c💡 Dev Tools Available:',
    'color: #3b82f6; font-weight: bold; font-size: 14px;'
  )
  console.log('%c   window.cleanupOldStorage()', 'color: #10b981; font-family: monospace;')
  console.log('%c   window.resetPersist()', 'color: #10b981; font-family: monospace;')
  console.log('%c   window.store', 'color: #10b981; font-family: monospace;')
  console.log('%c   window.persistor', 'color: #10b981; font-family: monospace;')
}

// ═══════════════════════════════════════════════
// ✅ Render
// ═══════════════════════════════════════════════
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('❌ Root element #root not found in index.html')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <PersistErrorBoundary>
      <Provider store={store}>
        <PersistGate
          loading={<PersistLoader />}
          persistor={persistor}
          onBeforeLift={() => {
            // ✅ قبل از اینکه اپ لود بشه، یه چک سریع
            if (import.meta.env.DEV) {
              const state = store.getState()
              console.log('✅ Persist ready. State keys:', Object.keys(state))
            }
          }}
        >
          <App />
        </PersistGate>
      </Provider>
    </PersistErrorBoundary>
  </React.StrictMode>
)