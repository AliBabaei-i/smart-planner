import React, { useEffect, useState, Suspense, lazy, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Provider, useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import store from './app/store'
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
import { generateRecurringTasks } from './features/tasks/tasksSlice'
import { initializeTheme } from './features/theme/themeSlice'

import 'react-toastify/dist/ReactToastify.css'

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
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  // ✅ FIX: محافظ برای جلوگیری از اجرای دوباره در StrictMode
  const recurringInitRef = useRef(false)

  useEffect(() => {
    initializeTheme()
  }, [])

  useEffect(() => {
    if (reminderService.started) return
    try {
      reminderService.start()
    } catch (error) {
      console.error('Error starting reminder service:', error)
    }
  }, [])

  // ✅ FIX: generateRecurringTasks فقط یک بار در هر mount اجرا بشه
  useEffect(() => {
    if (recurringInitRef.current) return
    recurringInitRef.current = true

    dispatch(generateRecurringTasks())

    const interval = setInterval(() => {
      dispatch(generateRecurringTasks())
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [dispatch])

  useEffect(() => {
    if (location.pathname === '/tasks') {
      localStorage.setItem('smart-planner-tasks-viewed-at', new Date().toISOString())
    }
  }, [location.pathname])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target
      const tagName = target?.tagName?.toLowerCase()
      const isContentEditable = target?.isContentEditable
      const isInInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select' || isContentEditable

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
      <AppLayout
        onOpenSearch={() => setShowSearch(true)}
        onOpenQuickAdd={() => setShowQuickAdd(true)}
      >
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
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/growth" element={<GrowthPage />} />
          </Routes>
        </Suspense>
      </AppLayout>

      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      <QuickAddTask
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />

      <FloatingQuickAdd onClick={() => setShowQuickAdd(true)} />

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
    </React.Fragment>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <AppContent />
        </Router>
      </Provider>
    </ErrorBoundary>
  )
}

export default App