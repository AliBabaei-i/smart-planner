import React, { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import store from './app/store'
import AppLayout from './components/layout/AppLayout'
import OfflineIndicator from './components/common/OfflineIndicator'
import ErrorBoundary from './components/common/ErrorBoundary'
import GlobalSearch from './components/common/GlobalSearch'
import LoadingSpinner from './components/common/LoadingSpinner'
import PomodoroWidget from './features/pomodoro/PomodoroWidget'
import AchievementNotification from './features/achievements/AchievementNotification'
import { reminderService } from './services/reminderService'
import { generateRecurringTasks } from './features/tasks/tasksSlice'
import { initializeTheme } from './features/theme/themeSlice'

import 'react-toastify/dist/ReactToastify.css'

// ✅ Lazy loading صفحات
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const ProjectsPage = lazy(() => import('./features/projects/ProjectsPage'))
const TasksPage = lazy(() => import('./features/tasks/TasksPage'))
const HabitsPage = lazy(() => import('./features/habits/HabitsPage'))
const NotesPage = lazy(() => import('./features/notes/NotesPage'))
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'))
const PlanningPage = lazy(() => import('./features/planning/PlanningPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const AchievementsPage = lazy(() => import('./features/achievements/AchievementsPage'))

function NotFound() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        صفحه پیدا نشد
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        صفحه‌ای که به دنبال آن هستید وجود ندارد
      </p>
      <a
        href="/"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        بازگشت به داشبورد
      </a>
    </div>
  )
}

function AppContent() {
  const dispatch = useDispatch()
  const [showSearch, setShowSearch] = useState(false)

  // ✅ اعمال تم در ابتدای لود
  useEffect(() => {
    initializeTheme()
  }, [])

  // ✅ راه‌اندازی سرویس یادآوری
  useEffect(() => {
    if (reminderService.started) return

    try {
      reminderService.start()
    } catch (error) {
      console.error('Error starting reminder service:', error)
    }

    return () => {
      // ✅ در StrictMode نباید stop کنیم تا دوباره اجرا نشه
      // reminderService.stop()
    }
  }, [])

  // ✅ بررسی و ساخت تسک‌های تکرارشونده
  useEffect(() => {
    dispatch(generateRecurringTasks())
    const interval = setInterval(() => {
      dispatch(generateRecurringTasks())
    }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [dispatch])

  // ✅ شورتکات‌های کیبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')
      ) {
        e.preventDefault()
        e.stopPropagation()
        setShowSearch(prev => !prev)
        return false
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target
        const tagName = target?.tagName?.toLowerCase()
        const isContentEditable = target?.isContentEditable

        if (tagName !== 'input' && tagName !== 'textarea' && !isContentEditable) {
          e.preventDefault()
          setShowSearch(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  return (
    <Router>
      <AppLayout onOpenSearch={() => setShowSearch(true)}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="large" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppLayout>

      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      <PomodoroWidget />
      <AchievementNotification />
      <OfflineIndicator />

      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ direction: 'rtl' }}
      />
    </Router>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  )
}

export default App