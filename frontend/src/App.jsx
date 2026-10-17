import React, { useEffect, useState, Suspense, lazy, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import AppLayout from './components/layout/AppLayout'
import OfflineIndicator from './components/common/OfflineIndicator'
import ErrorBoundary from './components/common/ErrorBoundary'
import GlobalSearch from './components/common/GlobalSearch'
import QuickAddTask from './components/ui/QuickAddTask'
import FloatingQuickAdd from './components/ui/FloatingQuickAdd'
import LoadingSpinner from './components/common/LoadingSpinner'
import PomodoroWidget from './features/pomodoro/PomodoroWidget'
import AchievementNotification from './features/achievements/AchievementNotification'

import { reminderService } from './services/reminderService'
import { syncService } from './services/syncService'
import { generateRecurringTasks } from './features/tasks/tasksSlice'
import { initializeTheme } from './features/theme/themeSlice'
import { checkAuth, selectIsAuthenticated } from './features/auth/authSlice'
import {
  setSyncing,
  setSynced,
  setSyncError,
  setQueueSize
} from './features/sync/syncSlice'
import { syncQueue } from './services/syncQueue'

import 'react-toastify/dist/ReactToastify.css'

// ═══════════════════════════════════════════════
// ✅ Lazy Pages
// ═══════════════════════════════════════════════
const LoginPage = lazy(() => import('./features/auth/LoginPage'))
const ProtectedRoute = lazy(() => import('./features/auth/ProtectedRoute'))
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const ProjectsPage = lazy(() => import('./features/projects/ProjectsPage'))
const TasksPage = lazy(() => import('./features/tasks/TasksPage'))
const HabitsPage = lazy(() => import('./features/habits/HabitsPage'))
const NotesPage = lazy(() => import('./features/notes/NotesPage'))
const GoalsPage = lazy(() => import('./features/goals/GoalsPage'))
const AnalyticsPage = lazy(() => import('./features/analytics/AnalyticsPage'))
const PlanningPage = lazy(() => import('./features/planning/PlanningPage'))
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'))
const AchievementsPage = lazy(() => import('./features/achievements/AchievementsPage'))
const GrowthPage = lazy(() => import('./features/growth/GrowthPage'))
const FinancePage = lazy(() => import('./features/finance/FinancePage'))

// ═══════════════════════════════════════════════
// ✅ 404 Page
// ═══════════════════════════════════════════════
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

// ═══════════════════════════════════════════════
// ✅ AppContent
// ═══════════════════════════════════════════════
function AppContent() {
  const dispatch = useDispatch()
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const themeInitRef = useRef(false)
  const reminderInitRef = useRef(false)
  const recurringInitRef = useRef(false)
  const authInitRef = useRef(false)
  const syncInitRef = useRef(false)

  const isAuthenticated = useSelector(selectIsAuthenticated)

  // 1. Theme
  useEffect(() => {
    if (themeInitRef.current) return
    themeInitRef.current = true
    initializeTheme()
  }, [])

  // 2. Reminder
  useEffect(() => {
    if (reminderInitRef.current) return
    if (reminderService.started) {
      reminderInitRef.current = true
      return
    }
    reminderInitRef.current = true
    try {
      reminderService.start()
    } catch (error) {
      console.error('Error starting reminder service:', error)
    }
  }, [])

  // 3. Recurring tasks
  useEffect(() => {
    if (recurringInitRef.current) return
    recurringInitRef.current = true
    dispatch(generateRecurringTasks())
    const interval = setInterval(() => {
      dispatch(generateRecurringTasks())
    }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [dispatch])

  // 4. Check Auth
  useEffect(() => {
    if (authInitRef.current) return
    authInitRef.current = true
    dispatch(checkAuth())
  }, [dispatch])

  // 5. Sync events
  useEffect(() => {
    const unsubscribe = syncService.subscribe(async (event) => {
      if (event.status === 'syncing') {
        dispatch(setSyncing())
        const size = await syncQueue.size()
        dispatch(setQueueSize(size))
      } else if (event.status === 'synced') {
        const ts = event.timestamp instanceof Date
          ? event.timestamp.toISOString()
          : event.timestamp
        dispatch(setSynced(ts))
        dispatch(setQueueSize(0))
      } else if (event.status === 'error') {
        dispatch(setSyncError(event.error))
      }
    })
    return unsubscribe
  }, [dispatch])

  // 6. Sync start/stop
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        if (!syncInitRef.current) {
          syncInitRef.current = true
          syncService.start()
        }
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      syncService.stop()
      syncInitRef.current = false
    }
  }, [isAuthenticated])

  // 7. Track tasks page
  useEffect(() => {
    if (location.pathname === '/tasks') {
      localStorage.setItem('smart-planner-tasks-viewed-at', new Date().toISOString())
    }
  }, [location.pathname])

  // 8. Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target
      const tagName = target?.tagName?.toLowerCase()
      const isContentEditable = target?.isContentEditable
      const isInInput =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        isContentEditable

      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
        e.preventDefault()
        setShowSearch(prev => !prev)
        return
      }

      if (isInInput) return

      if (e.code === 'Slash') {
        e.preventDefault()
        setShowSearch(true)
        return
      }

      if (e.code === 'KeyN' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setShowQuickAdd(true)
        return
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <React.Fragment>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <LoadingSpinner size="large" />
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout
                  onOpenSearch={() => setShowSearch(true)}
                  onOpenQuickAdd={() => setShowQuickAdd(true)}
                >
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[60vh]">
                        <LoadingSpinner size="large" />
                      </div>
                    }
                  >
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/tasks" element={<TasksPage />} />
                      <Route path="/habits" element={<HabitsPage />} />
                      <Route path="/notes" element={<NotesPage />} />
                      <Route path="/goals" element={<GoalsPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/planning" element={<PlanningPage />} />
                      <Route path="/achievements" element={<AchievementsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/growth" element={<GrowthPage />} />
                      <Route path="/finance" element={<FinancePage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

      {isAuthenticated && (
        <>
          <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
          <QuickAddTask isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
          <FloatingQuickAdd onClick={() => setShowQuickAdd(true)} />
          <PomodoroWidget />
          <AchievementNotification />
        </>
      )}

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
    </React.Fragment>
  )
}

// ═══════════════════════════════════════════════
// ✅ App — فقط محتوا (Provider/Router توی main.jsx)
// ═══════════════════════════════════════════════
function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}

export default App